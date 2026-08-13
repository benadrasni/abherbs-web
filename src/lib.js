import { illustrationFromHeaderUrl, photoUrl } from './api';

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=sk.ab.herbs';
export const APP_STORE_URL = 'https://apps.apple.com/us/app/whats-that-flower/id1449982118';
export const POWO_TAXON = 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:';
export const GBIF_TAXON = 'https://www.gbif.org/species/';

export const RTL = new Set(['ar', 'fa', 'he']);

const COUNTRIES = {
  at: 'Austria',
  bg: 'Bulgaria',
  ch: 'Switzerland',
  cz: 'Czechia',
  de: 'Germany',
  dk: 'Denmark',
  ee: 'Estonia',
  es: 'Spain',
  fr: 'France',
  gb: 'United Kingdom',
  gr: 'Greece',
  hr: 'Croatia',
  hu: 'Hungary',
  it: 'Italy',
  jm: 'Jamaica',
  ky: 'Cayman Islands',
  mv: 'Maldives',
  mx: 'Mexico',
  no: 'Norway',
  pl: 'Poland',
  se: 'Sweden',
  si: 'Slovenia',
  sk: 'Slovakia',
  tr: 'Turkey',
  us: 'United States',
};

const regionNames = {};

export function countryName(code, lang) {
  if (!code) return '';
  const cc = String(code).toLowerCase();
  const locale = lang || 'en';
  try {
    if (!regionNames[locale] && typeof Intl !== 'undefined' && Intl.DisplayNames) {
      regionNames[locale] = new Intl.DisplayNames([locale], { type: 'region' });
    }
    const name = regionNames[locale] && regionNames[locale].of(cc.toUpperCase());
    if (name) return name;
  } catch (err) {
    // fall through to the English map
  }
  return COUNTRIES[cc] || cc.toUpperCase();
}

export function withLang(path, lang) {
  if (!lang) return path;
  const join = path.includes('?') ? '&' : '?';
  return `${path}${join}lang=${encodeURIComponent(lang)}`;
}

export function plantPath(name, lang) {
  return withLang(`/plant/${encodeURIComponent(name)}`, lang);
}

export function familyPath(family, lang) {
  return withLang(`/family/${encodeURIComponent(family)}`, lang);
}

export function genusPath(genus, lang) {
  return withLang(`/genus/${encodeURIComponent(genus)}`, lang);
}

export function detectLang(search, supported) {
  const params = new URLSearchParams(search || '');
  let lang = params.get('lang') || (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  if (lang.indexOf('-') > 0) lang = lang.slice(0, lang.indexOf('-'));
  if (lang === 'nb' || lang === 'nn') lang = 'no';
  if (!supported[lang]) return 'en';
  return lang;
}

export function parseApg(apg) {
  const ranks = [];
  if (!apg) return ranks;
  Object.keys(apg)
    .sort()
    .forEach((key) => {
      const label = key.includes('_') ? key.slice(key.indexOf('_') + 1) : key;
      ranks.push({ key, label, value: apg[key] });
    });
  return ranks;
}

export function rankValue(apg, suffix) {
  if (!apg) return '';
  const hit = Object.keys(apg).find((key) => key.endsWith('_' + suffix) || key === suffix);
  return hit ? apg[hit] : '';
}

export function displayName(label, fallback) {
  const raw = (label || fallback || '').trim();
  if (!raw) return '';
  return raw.charAt(0).toLocaleUpperCase() + raw.slice(1);
}

export function genusOf(name) {
  if (!name) return '';
  return name.split(' ')[0];
}

function countByKey(headers, keyOf) {
  const map = {};
  (headers || []).forEach((h) => {
    const key = keyOf(h);
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.keys(map).map((name) => ({ name, count: map[name] }));
}

export function countByFamily(headers) {
  return countByKey(headers, (h) => h.family);
}

export function countByGenus(headers) {
  return countByKey(headers, (h) => genusOf(h.name));
}

export function formatHeight(from, to, lang) {
  if (from == null && to == null) return '';
  const a = from || 0;
  const b = to || 0;
  if (a >= 100 || b >= 100) {
    const fmt = (n) => (n / 100).toLocaleString(lang || 'en', { maximumFractionDigits: 1 });
    return `${fmt(a)}–${fmt(b)} m`;
  }
  return `${a}–${b} cm`;
}

export function monthName(month, lang) {
  if (!month) return '';
  return new Date(2000, month - 1, 1).toLocaleString(lang || 'en', { month: 'long' });
}

export function formatFlowering(from, to, lang) {
  if (!from && !to) return '';
  const a = monthName(from, lang);
  const b = monthName(to, lang);
  if (a && b && a !== b) return `${a}–${b}`;
  return a || b;
}

export function toxicityLabel(cls, t) {
  if (cls === 1) return t.toxicity_high;
  if (cls === 2) return t.toxicity_low;
  return t.toxicity_none;
}

export function headerPlate(header) {
  if (header && header.illustrationUrl) return photoUrl(header.illustrationUrl);
  return photoUrl(illustrationFromHeaderUrl(header && header.url));
}

export function youtubeId(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|v=)([\w-]+)/);
  return m ? m[1] : '';
}

export function observationTime(obs) {
  if (!obs) return null;
  if (obs.date && typeof obs.date.time === 'number') return obs.date.time;
  if (typeof obs.time === 'number') return obs.time;
  return null;
}

export function formatObsWhen(obs, lang) {
  const ms = observationTime(obs);
  if (!ms) return '';
  return new Date(ms).toLocaleString(lang || 'en', { month: 'short', year: 'numeric' });
}

export function publicObservations(list) {
  if (!list) return [];
  const rows = Array.isArray(list) ? list.filter(Boolean) : Object.keys(list).map((k) => list[k]);
  return rows
    .filter((row) => row && row.status === 'public' && row.photoPaths && row.photoPaths.length)
    .sort((a, b) => (observationTime(b) || 0) - (observationTime(a) || 0));
}

export function countByCountry(rows, lang) {
  const map = {};
  rows.forEach((row) => {
    const code = row.country;
    if (!code) return;
    const name = countryName(code, lang);
    map[name] = (map[name] || 0) + 1;
  });
  return Object.keys(map)
    .map((name) => ({ name, count: map[name] }))
    .sort((a, b) => b.count - a.count);
}

export const FEATURED = [
  'Rosa canina',
  'Bellis perennis',
  'Viola odorata',
  'Papaver rhoeas',
  'Nymphaea alba',
  'Digitalis purpurea',
  'Helianthus annuus',
  'Taraxacum officinale',
];

export function compactHeaders(raw) {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : Object.keys(raw).map((k) => raw[k])).filter((h) => h && h.name);
}
