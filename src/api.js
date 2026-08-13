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
  if (rel.startsWith('http')) return rel;
  if (rel.startsWith('observations/')) return STORAGE + rel;
  return PHOTO_ROOT + rel;
}

export function illustrationFromHeaderUrl(url) {
  if (!url) return '';
  const parts = url.split('/');
  if (parts.length < 3) return url;
  const folder = parts.slice(0, 3).join('/');
  return `${folder}/${parts[2]}.webp`;
}

export function loadHeaders() {
  return getJson('plants_headers');
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

export function loadWebStrings(lang) {
  return getJson(`web/${enc(lang)}`);
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

export function loadSearch(lang, query) {
  const key = query.trim().toLowerCase();
  if (!key || /[.#$[\]/]/.test(key)) return Promise.resolve(null);
  return getJson(`search_v3/${enc(lang)}/${enc(key)}`);
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

export function loadLabel(lang, name) {
  return getJson(`translations/${enc(lang)}/${enc(name)}/label`);
}

export function loadIllustrationUrl(name) {
  return getJson(`plants_v2/${enc(name)}/illustrationUrl`);
}

export async function loadCardExtras(lang, name) {
  const [label, illustrationUrl] = await Promise.all([
    loadLabel(lang, name).catch(() => null),
    loadIllustrationUrl(name).catch(() => null),
  ]);
  return {
    label: label || name,
    illustrationUrl: illustrationUrl || '',
  };
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
    label: pickField('label', primary, fallback) || name,
    names: (primary && primary.names) || (fallback && fallback.names) || [],
    wikipedia: pickField('wikipedia', primary, fallback),
    sourceUrls: (primary && primary.sourceUrls) || (fallback && fallback.sourceUrls) || [],
  };
  BODY_FIELDS.forEach((field) => {
    text[field] = pickField(field, ...sources);
  });
  return text;
}
