// Data-file validation shared by build.mjs and check.mjs.
import { ICONS, TYPE_LABELS } from './render.mjs';

const OWNER = 'chmald';
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO_RE = new RegExp(`^https://github\\.com/${OWNER}/([A-Za-z0-9._-]+)$`);
const THUMB_RE = new RegExp(`^https://raw\\.githubusercontent\\.com/${OWNER}/([A-Za-z0-9._-]+)/main/docs/assets/[A-Za-z0-9._-]+\\.png$`);

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isHttpsUrl(v) {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateData(data) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  const site = data.site ?? {};
  for (const key of ['url', 'title', 'description', 'language', 'disclaimer', 'projectsNote']) {
    if (!isNonEmptyString(site[key])) err(`site.${key} is required`);
  }
  if (site.url && (!isHttpsUrl(site.url) || site.url.endsWith('/'))) err('site.url must be an https URL without a trailing slash');
  if (site.description && site.description.length > 200) err('site.description should be 200 characters or fewer (meta description)');

  const profile = data.profile ?? {};
  for (const key of ['name', 'initials', 'role', 'focus', 'location', 'github', 'headline', 'bio']) {
    if (!isNonEmptyString(profile[key])) err(`profile.${key} is required`);
  }
  if (profile.github && profile.github !== `https://github.com/${OWNER}`) err(`profile.github must be https://github.com/${OWNER}`);
  for (const key of ['about', 'focusAreas']) {
    if (!Array.isArray(profile[key]) || profile[key].length === 0 || !profile[key].every(isNonEmptyString)) err(`profile.${key} must be a non-empty array of strings`);
  }
  if (!Array.isArray(profile.links)) {
    err('profile.links must be an array (use an empty url to keep a link hidden)');
  } else {
    profile.links.forEach((l, i) => {
      if (!isNonEmptyString(l.label)) err(`profile.links[${i}].label is required`);
      if (typeof l.url !== 'string') err(`profile.links[${i}].url must be a string ("" = not rendered)`);
      else if (l.url && !isHttpsUrl(l.url)) err(`profile.links[${i}].url must be an https URL or ""`);
    });
  }

  const tracks = data.tracks;
  if (!Array.isArray(tracks) || tracks.length === 0) err('tracks must be a non-empty array');

  const projects = data.projects;
  if (!Array.isArray(projects) || projects.length === 0) {
    err('projects must be a non-empty array');
    return errors;
  }

  const ids = new Set();
  projects.forEach((p, i) => {
    const where = `projects[${i}]${p && p.id ? ` (${p.id})` : ''}`;
    for (const key of ['id', 'title', 'useCase', 'description', 'repo', 'type', 'icon', 'license']) {
      if (!isNonEmptyString(p[key])) err(`${where}.${key} is required`);
    }
    if (p.id) {
      if (!ID_RE.test(p.id)) err(`${where}.id must be a lowercase kebab-case slug`);
      if (ids.has(p.id)) err(`${where}.id is duplicated`);
      ids.add(p.id);
    }
    if (p.useCase && p.useCase.length > 170) err(`${where}.useCase should be one line (170 characters or fewer)`);
    const repo = REPO_RE.exec(p.repo ?? '');
    if (!repo) err(`${where}.repo must look like https://github.com/${OWNER}/<repo>`);
    else if (repo[1] !== p.id) err(`${where}.repo name (${repo[1]}) must match id`);
    if (!Array.isArray(p.tracks) || p.tracks.length === 0) err(`${where}.tracks must be a non-empty array`);
    else p.tracks.forEach((t) => { if (!tracks?.includes(t)) err(`${where}.tracks has unknown track "${t}" (allowed: ${tracks?.join(', ')})`); });
    if (p.type && !TYPE_LABELS[p.type]) err(`${where}.type must be one of ${Object.keys(TYPE_LABELS).join(', ')}`);
    for (const key of ['deployable', 'hasTemplate']) {
      if (typeof p[key] !== 'boolean') err(`${where}.${key} must be true or false`);
    }
    if (!Array.isArray(p.services) || p.services.length === 0 || !p.services.every(isNonEmptyString)) err(`${where}.services must be a non-empty array of strings`);
    else if (p.services.length > 6) err(`${where}.services should list at most 6 key services`);
    if (!Array.isArray(p.highlights) || !p.highlights.every(isNonEmptyString)) err(`${where}.highlights must be an array of strings (may be empty)`);
    if (p.derivedFrom !== undefined && p.derivedFrom !== '') err(`${where} is derived from ${p.derivedFrom}; forks and derived repositories are not listed — remove the entry`);
    if (p.icon && !ICONS[p.icon]) err(`${where}.icon must be one of ${Object.keys(ICONS).join(', ')}`);
    if (typeof p.thumbnail !== 'string') err(`${where}.thumbnail must be a string ("" = generated placeholder)`);
    else if (p.thumbnail) {
      const t = THUMB_RE.exec(p.thumbnail);
      if (!t) err(`${where}.thumbnail must be https://raw.githubusercontent.com/${OWNER}/<repo>/main/docs/assets/<file>.png`);
      else if (t[1] !== p.id) err(`${where}.thumbnail must point at the project's own repo`);
      if (!isNonEmptyString(p.thumbnailAlt)) err(`${where}.thumbnailAlt is required when a thumbnail is set`);
    }
  });

  if (!Array.isArray(data.featured)) err('featured must be an array of project ids');
  else {
    if (data.featured.length > 3) err('featured should list at most 3 projects');
    data.featured.forEach((id) => { if (!ids.has(id)) err(`featured id "${id}" does not match any project`); });
  }

  return errors;
}
