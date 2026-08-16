import { illustrationFromHeaderUrl, photoUrl } from './api';

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=sk.ab.herbs';
export const APP_STORE_URL = 'https://apps.apple.com/us/app/whats-that-flower/id1449982118';
export const POWO_TAXON = 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:';
export const GBIF_TAXON = 'https://www.gbif.org/species/';
export const USDA_PLANTS = 'https://plants.usda.gov/home/plantProfile?symbol=';

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

export function normPath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
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

/** APG path from highest rank to genus. Order, family, and genus stay in the list. */
export function fullApgRanks(apg) {
  return parseApg(apg)
    .slice()
    .sort((a, b) => {
      const na = parseInt(a.key, 10);
      const nb = parseInt(b.key, 10);
      if (Number.isNaN(na) || Number.isNaN(nb)) return String(a.key).localeCompare(String(b.key));
      return nb - na;
    });
}

export function mergeSynonyms(plant, ipni, acceptedName) {
  const fromPlant = ((plant && plant.synonyms) || []).filter(Boolean).map((s) => ({ name: s }));
  const fromIpni = (ipni || []).filter((s) => s && s.name && s.name !== acceptedName);
  const seen = new Set();
  const merged = [];
  fromPlant.concat(fromIpni).forEach((s) => {
    const key = `${s.name} ${s.suffix || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(s);
  });
  return merged;
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

const FEATURED_KEY = 'wtf-featured';
const FEATURED_COUNT = 8;

function shuffleTake(items, count) {
  const pool = items.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return pool.slice(0, count);
}

export function sessionFeatured(headers) {
  const catalog = (headers || []).filter((h) => h && h.name);
  if (!catalog.length) return [];
  const byName = {};
  catalog.forEach((h) => {
    byName[h.name] = h;
  });
  try {
    const stored = JSON.parse(sessionStorage.getItem(FEATURED_KEY) || 'null');
    if (Array.isArray(stored) && stored.length) {
      const rows = stored.map((name) => byName[name]).filter(Boolean);
      if (rows.length === FEATURED_COUNT) return rows;
    }
  } catch (err) {
    // pick a new set
  }
  const picked = shuffleTake(catalog, FEATURED_COUNT);
  try {
    sessionStorage.setItem(FEATURED_KEY, JSON.stringify(picked.map((h) => h.name)));
  } catch (err) {
    // private mode
  }
  return picked;
}

function withId(header, fallbackId) {
  if (!header || !header.name) return null;
  const rawId = header.id != null ? header.id : fallbackId;
  const id = typeof rawId === 'number' ? rawId : Number(rawId);
  return {
    ...header,
    id: Number.isNaN(id) ? fallbackId : id,
  };
}

export function compactHeaders(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((header, index) => withId(header, index)).filter(Boolean);
  }
  return Object.keys(raw)
    .map((key) => withId(raw[key], key))
    .filter(Boolean);
}

export function indexHeadersById(headers) {
  const map = {};
  (headers || []).forEach((header) => {
    if (!header || header.id == null) return;
    map[header.id] = header;
  });
  return map;
}

export function catalogCovers(rows, expectedCount) {
  const n = (rows || []).length;
  if (!n) return false;
  if (expectedCount == null || expectedCount === '') return n >= 1000;
  const count = Number(expectedCount);
  if (Number.isNaN(count)) return n >= 1000;
  return n >= count;
}

export function sourceHost(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch (err) {
    return href || '';
  }
}

const SOURCE_HOSTS = [
  ['powo.science.kew.org', 'Plants of the World Online', 'name'],
  ['ipni.org', 'IPNI', 'name'],
  ['gbif.org', 'GBIF', 'name'],
  ['wikidata.org', 'Wikidata', 'name'],
  ['plants.usda.gov', 'USDA PLANTS', 'name'],
  ['species.wikimedia.org', 'Wikispecies', 'name'],
  ['commons.wikimedia.org', 'Wikimedia Commons', 'images'],
  ['botanicalillustrations.org', 'Botanical Illustrations', 'images'],
  ['wikipedia.org', 'Wikipedia', 'text'],
  ['pfaf.org', 'Plants For A Future', 'text'],
  ['rhs.org.uk', 'Royal Horticultural Society', 'text'],
  ['liliumspeciesfoundation.org', 'Lilium Species Foundation', 'text'],
  ['luontoportti.com', 'NatureGate / Luontoportti', 'text'],
  ['missouriplants.com', 'Missouri Plants', 'text'],
  ['botany.cz', 'BOTANY.cz', 'text'],
  ['gd.eppo.int', 'EPPO Global Database', 'text'],
  ['efloras.org', 'eFloras', 'text'],
  ['temperate.theferns.info', 'Useful Temperate Plants', 'text'],
  ['gobotany.nativeplanttrust.org', 'Go Botany', 'text'],
  ['flora.org.il', 'Flora of Israel Online', 'text'],
  ['pacificbulbsociety.org', 'Pacific Bulb Society', 'text'],
  ['onrockgarden.com', 'Ontario Rock Garden & Hardy Plant Society', 'text'],
];

function hostEndsWith(host, domain) {
  return host === domain || (host && host.endsWith('.' + domain));
}

function lookupSourceHost(host) {
  for (let i = 0; i < SOURCE_HOSTS.length; i++) {
    if (hostEndsWith(host, SOURCE_HOSTS[i][0])) {
      return { name: SOURCE_HOSTS[i][1], group: SOURCE_HOSTS[i][2], known: true };
    }
  }
  return { name: host || '', group: '', known: false };
}

function pushSource(bucket, seen, item) {
  if (!item || !item.href) return;
  const key = item.key || item.href;
  if (seen.has(key)) return;
  seen.add(key);
  bucket.push(item);
}

/**
 * Group citations: name records (POWO, GBIF, Wikidata, USDA), text floras, images.
 * Commons file URLs collapse to one Commons link.
 */
export function collectPlantSources(plant, text) {
  const name = [];
  const written = [];
  const images = [];
  const seen = new Set();
  const p = plant || {};
  const tx = text || {};
  const wikiLinks = p.wikilinks || {};

  if (p.ipniId) {
    pushSource(name, seen, {
      href: POWO_TAXON + p.ipniId,
      name: 'Plants of the World Online',
      detail: 'Kew · IPNI ' + p.ipniId,
      key: 'powo',
    });
  }
  if (p.gbifId) {
    pushSource(name, seen, {
      href: GBIF_TAXON + p.gbifId,
      name: 'GBIF',
      detail: String(p.gbifId),
      key: 'gbif',
    });
  }
  if (wikiLinks.data) {
    const qid = String(wikiLinks.data).split('/').pop();
    pushSource(name, seen, {
      href: wikiLinks.data,
      name: 'Wikidata',
      detail: qid,
      key: 'wikidata',
    });
  }
  if (p.usdaId) {
    pushSource(name, seen, {
      href: USDA_PLANTS + encodeURIComponent(p.usdaId),
      name: 'USDA PLANTS',
      detail: p.usdaId,
      key: 'usda',
    });
  }
  if (wikiLinks.species) {
    pushSource(name, seen, {
      href: wikiLinks.species,
      name: 'Wikispecies',
      key: 'wikispecies',
    });
  }
  if (tx.wikipedia) {
    pushSource(written, seen, {
      href: tx.wikipedia,
      name: 'Wikipedia',
      key: 'wikipedia',
    });
  }
  if (wikiLinks.commons) {
    pushSource(images, seen, {
      href: wikiLinks.commons,
      name: 'Wikimedia Commons',
      kind: 'photographs',
      key: 'commons',
    });
  }

  function ingest(href, fallbackGroup) {
    if (!href) return;
    const host = sourceHost(href);
    const info = lookupSourceHost(host);
    const group = info.known ? info.group : fallbackGroup;
    if (group === 'name') {
      if (
        hostEndsWith(host, 'powo.science.kew.org') ||
        hostEndsWith(host, 'ipni.org') ||
        hostEndsWith(host, 'gbif.org') ||
        hostEndsWith(host, 'wikidata.org') ||
        hostEndsWith(host, 'plants.usda.gov') ||
        hostEndsWith(host, 'species.wikimedia.org')
      ) {
        return;
      }
      pushSource(name, seen, { href, name: info.name || host, key: 'host:' + host });
      return;
    }
    if (group === 'images') {
      const isCommons = hostEndsWith(host, 'commons.wikimedia.org');
      pushSource(images, seen, {
        href: isCommons && wikiLinks.commons ? wikiLinks.commons : href,
        name: info.known ? info.name : host,
        kind: isCommons ? 'photographs' : hostEndsWith(host, 'botanicalillustrations.org') ? 'plate' : '',
        key: isCommons ? 'commons' : 'host:' + host,
      });
      return;
    }
    const isWiki = hostEndsWith(host, 'wikipedia.org');
    pushSource(written, seen, {
      href,
      name: info.known ? info.name : host,
      key: isWiki ? 'wikipedia' : 'host:' + host,
    });
  }

  (tx.sourceUrls || []).forEach((href) => ingest(href, 'text'));
  (p.sourceUrls || []).forEach((href) => ingest(href, 'images'));

  return { name, text: written, images };
}
