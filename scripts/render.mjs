// Shared renderer for the static site. No dependencies.
// build.mjs writes the output; check.mjs re-renders in memory to verify it is up to date.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_PATH = join(ROOT, 'data', 'projects.json');

export const TYPE_LABELS = { app: 'App', runbook: 'Runbook', workshop: 'Workshop' };

export function loadData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf8'));
}

export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slug(value) {
  return String(value).toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Small inline SVG icons (24x24, stroke-based) so the site needs no external assets.
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
export const ICONS = {
  agent: `<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="12" cy="3.5" r="1"/><circle cx="9" cy="13" r="1.25"/><circle cx="15" cy="13" r="1.25"/><path d="M2 12v3M22 12v3"/>`,
  tools: `<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>`,
  gauge: `<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1.25"/><path d="M4 20h16"/>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>`,
  book: `<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6M9 10h4"/>`,
  code: `<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>`,
  document: `<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15h6M9 18h3"/>`,
  phone: `<path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/><path d="M15 3a6 6 0 0 1 6 6M15 7a2 2 0 0 1 2 2"/>`,
  avatar: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 4c1 .8 1.5 1.8 1.5 3s-.5 2.2-1.5 3"/>`,
  pipeline: `<circle cx="6" cy="6" r="2.25"/><circle cx="6" cy="18" r="2.25"/><circle cx="18" cy="12" r="2.25"/><path d="M6 8.25v7.5M8 7.2c4 .8 6.5 2.2 7.8 3.8M8 16.8c4-.8 6.5-2.2 7.8-3.8"/>`,
  external: `<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`,
  rocket: `<path d="M12 15l-3-3c1.5-5 4.5-8 10-9-1 5.5-4 8.5-9 10z"/><path d="M9 12H5l2-4h4M12 15v4l4-2v-4"/><path d="M6 17c-1 1-1.5 3-1.5 3s2-.5 3-1.5"/>`,
  pin: `<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.25"/>`,
  arrowDown: `<path d="M12 5v14M6 13l6 6 6-6"/>`,
};

export function icon(name, cls = 'icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" ${STROKE}>${ICONS[name]}</svg>`;
}

// GitHub mark (Primer Octicons, MIT).
export const GITHUB_ICON = '<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

// LinkedIn "in" mark drawn as a single even-odd path so it inherits currentColor like the GitHub mark.
export const LINKEDIN_ICON = '<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor" fill-rule="evenodd"><path d="M1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0zM3 4.1a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0zM3.1 6.1h2.2V13H3.1zM6.6 6.1h2.1v.95c.35-.6 1.15-1.15 2.35-1.15 2.1 0 2.55 1.35 2.55 3.1V13h-2.2V9.5c0-.85-.2-1.6-1.1-1.6-.95 0-1.35.7-1.35 1.65V13H6.6z"/></svg>';

function isLinkedIn(url) {
  return /(^|\.)linkedin\.com$/i.test(new URL(url).hostname);
}

// Profile links ("" url = hidden). Each gets an accessible name, an icon, and display text.
function profileLinks(profile) {
  return profile.links.filter((l) => l.url).map((l) => {
    const linkedin = isLinkedIn(l.url);
    const u = new URL(l.url);
    return {
      url: l.url,
      name: linkedin ? 'LinkedIn profile' : l.label,
      icon: linkedin ? LINKEDIN_ICON : icon('external'),
      display: (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, ''),
    };
  });
}

// Inline profile link used in the About card and footer: visible "host/path" text, prefixed for screen readers.
function profileLinkInline(l) {
  return `<a href="${esc(l.url)}" rel="me noopener">${l.icon}<span class="visually-hidden">${esc(l.name)}: </span>${esc(l.display)}</a>`;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function repoName(url) {
  return url.replace('https://github.com/', '');
}

function thumb(project, variant, size) {
  const g = `thumb--g${(variant % 4) + 1}`;
  const img = project.thumbnail
    ? `\n          <img src="${esc(project.thumbnail)}" alt="${esc(project.thumbnailAlt)}" width="${size.w}" height="${size.h}" loading="lazy" decoding="async">`
    : '';
  return `<div class="thumb ${g}">
          ${icon(project.icon, 'thumb-icon')}${img}
        </div>`;
}

function badges(project) {
  const tracks = project.tracks
    .map((t) => `<li class="badge badge--${slug(t)}">${esc(t)}</li>`)
    .join('');
  const type = `<li class="badge badge--type">${esc(TYPE_LABELS[project.type])}</li>`;
  return `<ul class="badges" aria-label="Tracks and type">${tracks}${type}</ul>`;
}

function chips(services) {
  return `<ul class="chips" aria-label="Key Azure services">${services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
}

function deployBadge(project) {
  if (project.hasTemplate) {
    return `<span class="deploy deploy--azd">${icon('rocket')}Deployable: <code>azd up</code></span>`;
  }
  return `<span class="deploy deploy--guided">${icon('book')}Guided workshop</span>`;
}

function projectCard(project, index) {
  const tracks = project.tracks.map(slug).join(' ');
  return `      <li class="card" data-tracks="${tracks}">
        <article class="card-inner" aria-labelledby="card-${esc(project.id)}">
          ${thumb(project, index, { w: 640, h: 360 })}
          <div class="card-body">
            ${badges(project)}
            <h3 id="card-${esc(project.id)}"><a class="stretched" href="${esc(project.repo)}">${esc(project.title)}</a></h3>
            <p class="use-case">${esc(project.useCase)}</p>
            ${chips(project.services)}
            <div class="card-footer">
              ${deployBadge(project)}
              <span class="repo-hint" aria-hidden="true">${GITHUB_ICON}${esc(repoName(project.repo))}</span>
            </div>
          </div>
        </article>
      </li>`;
}

function featuredCard(project, index) {
  const highlights = project.highlights.length
    ? `<ul class="highlights">${project.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';
  return `      <li class="feature">
        <article class="feature-inner" aria-labelledby="feature-${esc(project.id)}">
          ${thumb(project, index, { w: 960, h: 540 })}
          <div class="feature-body">
            ${badges(project)}
            <h3 id="feature-${esc(project.id)}">${esc(project.title)}</h3>
            <p>${esc(project.description)}</p>
            ${highlights}
            <div class="feature-actions">
              <a class="button button--primary" href="${esc(project.repo)}">${GITHUB_ICON}View repository<span class="visually-hidden">: ${esc(project.title)}</span></a>
              ${deployBadge(project)}
            </div>
          </div>
        </article>
      </li>`;
}

function head(data, { title, description, path, noindex = false }) {
  const { site, profile } = data;
  const url = site.url + path;
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https://raw.githubusercontent.com data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'none'">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${esc(profile.name)}">${noindex ? '\n  <meta name="robots" content="noindex">' : ''}
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${esc(url)}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(profile.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(site.url)}/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(profile.name)} — Azure AI reference architectures and demos">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(site.url)}/assets/og-image.png">`;
}

function header(data, { home }) {
  const prefix = home ? '' : '/';
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <nav class="nav container" aria-label="Primary">
      <a class="brand" href="/"><span class="monogram" aria-hidden="true">${esc(data.profile.initials)}</span><span class="brand-name">${esc(data.profile.name)}</span></a>
      <ul class="nav-links">
        <li><a href="${prefix}#featured">Featured</a></li>
        <li><a href="${prefix}#projects">Projects</a></li>
        <li><a href="${prefix}#about">About</a></li>
        <li><a class="nav-github" href="${esc(data.profile.github)}">${GITHUB_ICON}<span>GitHub</span></a></li>
      </ul>
    </nav>
  </header>`;
}

function footer(data, date) {
  return `<footer class="site-footer">
    <div class="container footer-inner">
      <p class="disclaimer">${esc(data.site.disclaimer)}</p>
      <p class="footer-meta">
        <a href="${esc(data.profile.github)}">${GITHUB_ICON}github.com/${esc(data.profile.github.split('/').pop())}</a>
${profileLinks(data.profile).map((l) => `        <span aria-hidden="true">·</span>\n        ${profileLinkInline(l)}\n`).join('')}        <span aria-hidden="true">·</span>
        <span>Last updated <time datetime="${date}">${formatDate(date)}</time></span>
      </p>
    </div>
  </footer>`;
}

function jsonLd(data) {
  const { site, profile, projects } = data;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${site.url}/#person`,
        name: profile.name,
        jobTitle: 'Solution Engineer',
        url: site.url,
        sameAs: [profile.github, ...profile.links.filter((l) => l.url).map((l) => l.url)],
        address: { '@type': 'PostalAddress', addressRegion: profile.location },
      },
      {
        '@type': 'ItemList',
        name: 'Projects',
        itemListElement: projects.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareSourceCode',
            name: p.title,
            description: p.useCase,
            codeRepository: p.repo,
            author: { '@id': `${site.url}/#person` },
          },
        })),
      },
    ],
  };
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

export function renderIndex(data, date) {
  const { site, profile, projects, tracks } = data;
  const byId = new Map(projects.map((p) => [p.id, p]));
  const featured = data.featured.map((id) => byId.get(id)).filter(Boolean);
  const deployable = projects.filter((p) => p.hasTemplate).length;
  const links = profileLinks(profile);
  const trackCounts = tracks.map((t) => [t, projects.filter((p) => p.tracks.includes(t)).length]);

  return `<!doctype html>
<html lang="${esc(site.language)}">
<head>
  ${head(data, { title: site.title, description: site.description, path: '/' })}
  <script type="application/ld+json">${jsonLd(data)}</script>
  <script src="/assets/site.js" defer></script>
</head>
<body>
  ${header(data, { home: true })}
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <p class="eyebrow">${esc(profile.role)} <span aria-hidden="true">·</span> ${esc(profile.focus)} <span aria-hidden="true">·</span> <span class="nowrap">${icon('pin')}${esc(profile.location)}</span></p>
        <h1 id="hero-title">${esc(profile.name)}</h1>
        <p class="lede">${esc(profile.headline)}</p>
        <p class="hero-bio">${esc(profile.bio)}</p>
        <div class="hero-actions">
          <a class="button button--primary" href="#projects">${icon('arrowDown')}Browse projects</a>
          <a class="button button--secondary" href="${esc(profile.github)}">${GITHUB_ICON}GitHub profile</a>
          ${links.map((l) => `          <a class="button button--secondary" href="${esc(l.url)}" rel="me noopener">${l.icon}${esc(l.name)}</a>\n`).join('')}        </div>
        <dl class="stats">
          <div><dt>Reference projects</dt><dd>${projects.length}</dd></div>
          <div><dt>Deployable with <code>azd up</code></dt><dd>${deployable}</dd></div>
          <div><dt>Tracks</dt><dd>${tracks.length}</dd></div>
        </dl>
      </div>
    </section>

    <section id="featured" class="section" aria-labelledby="featured-title">
      <div class="container">
        <div class="section-head">
          <h2 id="featured-title">Featured</h2>
          <p>Three patterns that show the end-to-end approach: governed agents, grounded knowledge, and AI cost control.</p>
        </div>
        <ul class="features">
${featured.map(featuredCard).join('\n')}
        </ul>
      </div>
    </section>

    <section id="projects" class="section section--alt" aria-labelledby="projects-title">
      <div class="container">
        <div class="section-head">
          <h2 id="projects-title">All projects</h2>
          <p>Every project is a public GitHub repository with an architecture diagram, docs, and testing guidance.</p>
        </div>
        <div class="filters" role="group" aria-label="Filter projects by track" hidden>
          <button type="button" class="filter" data-filter="all" aria-pressed="true">All <span class="count">${projects.length}</span></button>
${trackCounts.map(([t, n]) => `          <button type="button" class="filter" data-filter="${slug(t)}" aria-pressed="false">${esc(t)} <span class="count">${n}</span></button>`).join('\n')}
        </div>
        <p class="filter-status visually-hidden" role="status" aria-live="polite"></p>
        <ul class="grid">
${projects.map(projectCard).join('\n')}
        </ul>
      </div>
    </section>

    <section id="about" class="section" aria-labelledby="about-title">
      <div class="container about">
        <div>
          <h2 id="about-title">About</h2>
${profile.about.map((p) => `          <p>${esc(p)}</p>`).join('\n')}
        </div>
        <aside class="about-card" aria-label="Focus areas">
          <h3>Focus areas</h3>
          <ul class="chips chips--lg">${profile.focusAreas.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <ul class="about-links">
            <li><a href="${esc(profile.github)}">${GITHUB_ICON}github.com/${esc(profile.github.split('/').pop())}</a></li>
${links.map((l) => `            <li>${profileLinkInline(l)}</li>`).join('\n')}
          </ul>
        </aside>
      </div>
    </section>
  </main>
  ${footer(data, date)}
</body>
</html>
`;
}

export function render404(data, date) {
  return `<!doctype html>
<html lang="${esc(data.site.language)}">
<head>
  ${head(data, { title: `Page not found — ${data.profile.name}`, description: 'The page you were looking for does not exist.', path: '/404.html', noindex: true })}
</head>
<body>
  ${header(data, { home: false })}
  <main id="main" class="not-found">
    <div class="container">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p class="lede">That page doesn't exist. The project you're after may have moved or been renamed.</p>
      <div class="hero-actions">
        <a class="button button--primary" href="/">Back to home</a>
        <a class="button button--secondary" href="${esc(data.profile.github)}?tab=repositories">${GITHUB_ICON}All repositories</a>
      </div>
    </div>
  </main>
  ${footer(data, date)}
</body>
</html>
`;
}

export function renderSitemap(data, date) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(data.site.url)}/</loc>
    <lastmod>${date}</lastmod>
  </url>
</urlset>
`;
}

export function renderRobots(data) {
  return `User-agent: *
Allow: /

Sitemap: ${data.site.url}/sitemap.xml
`;
}

export function renderAll(data, date) {
  return {
    'index.html': renderIndex(data, date),
    '404.html': render404(data, date),
    'sitemap.xml': renderSitemap(data, date),
    'robots.txt': renderRobots(data),
  };
}
