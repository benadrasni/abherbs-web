const DB = 'https://abherbs-backend.firebaseio.com';
export const STORAGE = 'https://storage.googleapis.com/abherbs-resources/';
export const PHOTO_ROOT = STORAGE + 'photos/';

const cache = new Map();

export async function getJson(path) {
  const url = path.startsWith('http') ? path : `${DB}/${path}.json`;
  if (cache.has(url)) return cache.get(url);
  const pending = fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
    return res.json();
  });
  cache.set(url, pending);
  try {
    const data = await pending;
    cache.set(url, data);
    return data;
  } catch (err) {
    cache.delete(url);
    throw err;
  }
}

function enc(name) {
  return encodeURIComponent(name);
}

export function familyIconUrl(family) {
  if (!family) return '';
  return `${STORAGE}families/${encodeURIComponent(family)}.webp`;
}

export function photoUrl(rel) {
  if (!rel) return '';
  if (rel.startsWith('http') || rel.startsWith('/')) return rel;
  if (rel.startsWith('observations/')) return STORAGE + rel;
  return PHOTO_ROOT + rel;
}

export function distributionRel(plant) {
  if (!plant) return '';
  if (plant.distributionUrl) return plant.distributionUrl;
  const ill = String(plant.illustrationUrl || '');
  const match = ill.match(/^(.*?)(\.[^.]+)$/);
  if (!match) return '';
  return `${match[1]}_distribution${match[2]}`;
}

export function plateFiles(rel) {
  if (!rel) return { legacy: '', master: '', grid: '' };
  const parts = String(rel).split('/');
  const file = parts.pop() || '';
  const match = file.match(/^(.*?)(?:@(?:1600|400))?(\.[^.]+)$/);
  const stem = match ? match[1] : file.replace(/\.[^.]+$/, '');
  const ext = match ? match[2] : '.webp';
  if (!stem) return { legacy: '', master: '', grid: '' };
  const prefix = parts.length ? parts.join('/') + '/' : '';
  return {
    legacy: prefix + stem + ext,
    master: prefix + stem + '@1600' + ext,
    grid: prefix + stem + '@400' + ext,
  };
}

export function plateGridUrl(rel) {
  return plateFiles(rel).grid || rel || '';
}

export function illustrationFromHeaderUrl(url) {
  if (!url) return '';
  const parts = url.split('/');
  if (parts.length < 3) return url;
  const folder = parts.slice(0, 3).join('/');
  return `${folder}/${parts[2]}.webp`;
}

export function labelAt(labels, id) {
  if (labels == null || id == null) return '';
  const row = Array.isArray(labels) ? labels[id] : labels[id] ?? labels[String(id)];
  return typeof row === 'string' ? row : '';
}

function namedCount(raw) {
  if (!raw) return 0;
  if (Array.isArray(raw)) return raw.filter((row) => row && row.name).length;
  return Object.keys(raw).reduce((n, key) => n + (raw[key] && raw[key].name ? 1 : 0), 0);
}

function catalogCoversCount(n, expectedCount) {
  if (!n) return false;
  if (expectedCount == null || expectedCount === '') return n >= 1000;
  const count = Number(expectedCount);
  if (Number.isNaN(count)) return n >= 1000;
  return n >= count;
}

export async function loadPlantIndex() {
  const [catalog, count] = await Promise.all([
    getJson('web/catalog').catch(() => null),
    getJson('plants_to_update/count').catch(() => null),
  ]);
  if (catalogCoversCount(namedCount(catalog), count)) {
    return { raw: catalog, fromCatalog: true };
  }
  const headers = await getJson('plants_headers');
  return { raw: headers, fromCatalog: false };
}

export function loadLabels(lang) {
  if (!lang) return Promise.resolve(null);
  return getJson(`web/labels/${enc(lang)}`).catch(() => null);
}

export function loadPlant(name) {
  return getJson(`plants_v2/${enc(name)}`);
}

export function loadSynonyms(name) {
  return getJson(`synonyms/${enc(name)}`);
}

export function loadObservations(name) {
  return getJson(`observations/public/by plant/${enc(name)}/list`);
}

export function loadTaxonLabel(lang, taxon) {
  return getJson(`translations_taxonomy/${enc(lang)}/${enc(taxon)}`);
}

export function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function loadSearchIndex(lang) {
  if (!lang) return Promise.resolve(null);
  return getJson(`search_v3/${enc(lang)}`);
}

export function idsFromSearchIndex(index, query) {
  const needle = normalizeSearch(query);
  if (!needle || !index || typeof index !== 'object') return [];
  const ids = [];
  const seen = new Set();
  Object.keys(index).forEach((key) => {
    if (!normalizeSearch(key).includes(needle)) return;
    const list = index[key] && index[key].list;
    if (!list) return;
    Object.keys(list).forEach((id) => {
      const n = Number(id);
      if (Number.isNaN(n) || seen.has(n)) return;
      seen.add(n);
      ids.push(n);
    });
  });
  return ids;
}

const BODY_FIELDS = [
  'description',
  'flower',
  'inflorescence',
  'fruit',
  'leaf',
  'stem',
  'habitat',
  'toxicity',
  'herbalism',
  'trivia',
];

function pickField(field, ...sources) {
  for (const src of sources) {
    if (src && src[field]) return src[field];
  }
  return '';
}

export async function loadPlantText(lang, name) {
  const code = lang || 'en';
  const [primary, gt, fallback] = await Promise.all([
    getJson(`translations/${enc(code)}/${enc(name)}`),
    getJson(`translations/${enc(code)}-GT/${enc(name)}`).catch(() => null),
    code === 'en'
      ? Promise.resolve(null)
      : getJson(`translations/${code === 'cs' ? 'sk' : 'en'}/${enc(name)}`),
  ]);
  const sources = [primary, gt, fallback];
  const text = {
    label: pickField('label', primary) || name,
    names: (primary && primary.names) || [],
    wikipedia: pickField('wikipedia', primary, fallback),
    sourceUrls: (primary && primary.sourceUrls) || (fallback && fallback.sourceUrls) || [],
  };
  BODY_FIELDS.forEach((field) => {
    text[field] = pickField(field, ...sources);
  });
  return text;
}
