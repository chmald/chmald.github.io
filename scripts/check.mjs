// Validates data, verifies the committed HTML is up to date, and lints the output.
// Usage: npm run check   (also: npm test)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, loadData, renderAll } from './render.mjs';
import { validateData } from './validate.mjs';

const failures = [];
const fail = (section, msg) => failures.push(`[${section}] ${msg}`);
const read = (file) => readFileSync(join(ROOT, file), 'utf8');

// 1. Data file
const data = loadData();
validateData(data).forEach((e) => fail('data', e));

// 2. Generated files match data (rendered with the date already stamped in index.html)
const required = ['index.html', '404.html', 'sitemap.xml', 'robots.txt', '.nojekyll', 'assets/styles.css', 'assets/site.js', 'assets/favicon.svg', 'assets/og-image.png'];
required.forEach((f) => { if (!existsSync(join(ROOT, f))) fail('files', `missing ${f}`); });

let date = null;
if (existsSync(join(ROOT, 'index.html'))) {
  date = /<time datetime="(\d{4}-\d{2}-\d{2})">/.exec(read('index.html'))?.[1] ?? null;
  if (!date) fail('build', 'index.html has no "Last updated" <time datetime> stamp');
}
if (date && failures.length === 0) {
  for (const [file, content] of Object.entries(renderAll(data, date))) {
    if (!existsSync(join(ROOT, file)) || read(file).replace(/\r\n/g, '\n') !== content) {
      fail('build', `${file} is out of date with data/projects.json — run "npm run build"`);
    }
  }
}

// 3. HTML structure and links
function checkHtml(file) {
  if (!existsSync(join(ROOT, file))) return;
  const html = read(file);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(file, `duplicate id(s): ${[...new Set(dupes)].join(', ')}`);
  if (!/<html lang="[a-z-]+">/.test(html)) fail(file, 'missing <html lang>');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(file, 'must contain exactly one <h1>');
  if (!/<title>[^<]+<\/title>/.test(html)) fail(file, 'missing <title>');
  if (!/<meta name="description" content="[^"]+">/.test(html)) fail(file, 'missing meta description');
  if (!/<main id="main"/.test(html)) fail(file, 'missing <main id="main"> (skip-link target)');

  // Heading levels must not skip (e.g. h2 -> h4).
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    if (prev && level > prev + 1) fail(file, `heading level jumps from h${prev} to h${level}`);
    prev = level;
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="[^"]+"/.test(tag)) fail(file, `<img> without meaningful alt: ${tag.slice(0, 80)}`);
    if (!/\sloading="lazy"/.test(tag)) fail(file, `<img> without loading="lazy": ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(file, `<img> without width/height: ${tag.slice(0, 80)}`);
  }

  for (const m of html.matchAll(/\s(href|src|content)="([^"]*)"/g)) {
    const [, attr, raw] = m;
    const value = raw.replace(/&amp;/g, '&');
    if (attr === 'content' && !/^https?:/.test(value)) continue;
    if (!value) { fail(file, `empty ${attr}`); continue; }
    if (value.startsWith('#')) {
      if (!ids.includes(value.slice(1))) fail(file, `in-page link ${value} has no matching id`);
    } else if (value.startsWith('/')) {
      const target = value.split(/[?#]/)[0];
      const path = target === '/' ? 'index.html' : target.slice(1);
      if (!existsSync(join(ROOT, path))) fail(file, `local link ${value} does not resolve to a file`);
    } else {
      let url;
      try { url = new URL(value); } catch { fail(file, `malformed URL: ${value}`); continue; }
      if (url.protocol !== 'https:') fail(file, `non-https URL: ${value}`);
      if (/\s/.test(value)) fail(file, `URL contains whitespace: ${value}`);
    }
  }
  if (/target="_blank"/.test(html)) fail(file, 'avoid target="_blank"; links open in the same tab');
  if (/\sstyle="/.test(html)) fail(file, 'inline style attributes are blocked by the Content-Security-Policy');
  if (/\son[a-z]+="/.test(html)) fail(file, 'inline event handlers are blocked by the Content-Security-Policy');
}
['index.html', '404.html'].forEach(checkHtml);

if (existsSync(join(ROOT, 'index.html'))) {
  const html = read('index.html');
  for (const p of data.projects ?? []) {
    if (!html.includes(`href="${p.repo}"`)) fail('index.html', `project ${p.id} is not linked`);
  }
  const links = (data.profile?.links ?? []).filter((l) => !l.url);
  for (const l of links) {
    if (html.includes(`>${l.label}</a>`)) fail('index.html', `placeholder link "${l.label}" (empty url) must not be rendered`);
  }
}

// 4. WCAG AA contrast for the colour tokens in both themes
function parseTokens(block) {
  const tokens = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[m[1]] = m[2];
  return tokens;
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const contrastReport = [];
if (existsSync(join(ROOT, 'assets/styles.css'))) {
  const css = read('assets/styles.css');
  const light = parseTokens(/:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '');
  const dark = parseTokens(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '');
  // [foreground, background, minimum ratio]
  const pairs = [
    ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['text', 'card', 4.5],
    ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['muted', 'card', 4.5],
    ['link', 'bg', 4.5], ['link', 'surface', 4.5], ['link', 'card', 4.5],
    ['button-fg', 'button-bg', 4.5], ['button-fg', 'button-bg-hover', 4.5],
    ['chip-fg', 'chip-bg', 4.5],
    ['apps-fg', 'apps-bg', 4.5], ['data-fg', 'data-bg', 4.5], ['infra-fg', 'infra-bg', 4.5], ['type-fg', 'type-bg', 4.5],
    ['deploy-fg', 'deploy-bg', 4.5], ['guided-fg', 'guided-bg', 4.5],
    ['filter-on-fg', 'filter-on-bg', 4.5],
    ['focus', 'bg', 3], ['focus', 'surface', 3], ['focus', 'card', 3],
    ['border-strong', 'bg', 3],
  ];
  for (const [theme, tokens] of [['light', light], ['dark', dark]]) {
    for (const [fg, bg, min] of pairs) {
      if (!tokens[fg] || !tokens[bg]) { fail('contrast', `${theme}: missing token --${tokens[fg] ? bg : fg}`); continue; }
      const ratio = contrast(tokens[fg], tokens[bg]);
      contrastReport.push(`${theme.padEnd(5)} ${`--${fg} on --${bg}`.padEnd(34)} ${ratio.toFixed(2)}:1 (min ${min})`);
      if (ratio < min) fail('contrast', `${theme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
    }
  }
}

// 5. Public-safety scan: no local paths, emails, or local config files in the published tree
const SKIP = new Set(['.git', 'node_modules']);
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
const localPath = new RegExp('[A-Za-z]:\\\\(Users|Workspace)\\\\', 'i');
const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net|org|io)\b/;
for (const full of walk(ROOT)) {
  const rel = relative(ROOT, full).replace(/\\/g, '/');
  if (/\.local\.json$|\.env$|vault-config/i.test(rel)) fail('safety', `local-only file must not be published: ${rel}`);
  if (/\.(png|ico|jpg)$/i.test(rel)) continue;
  const text = readFileSync(full, 'utf8');
  if (localPath.test(text)) fail('safety', `${rel} contains a local filesystem path`);
  const e = email.exec(text);
  if (e && !/noreply\.github\.com$/.test(e[0])) fail('safety', `${rel} contains an email address (${e[0]})`);
}

if (process.argv.includes('--verbose')) console.log(contrastReport.join('\n'));
if (failures.length) {
  console.error(`check failed with ${failures.length} problem(s):\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`check passed: ${data.projects.length} projects, HTML up to date (${date}), links well-formed, ${contrastReport.length} contrast pairs meet WCAG AA.`);
