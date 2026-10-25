import languages from './languages';
import { decisionFor, parseCloudflareTrace } from './analyticsConsent.mjs';
import { contentPath, detectLang } from './lib';

const GA_ID = 'G-B646H2Z8M4';
const CHOICE_KEY = 'wtf-ga';
const REGION_WAIT_MS = 3000;

const TITLE_GAP = ' — ';
const PAGE_TYPES = new Set([
  'identify',
  'about',
  'help',
  'privacy',
  'families',
  'genera',
  'family',
  'genus',
  'list',
  'plant',
]);

let mode = 'pending';
let ask = false;
let installed = false;
let lastPageKey = '';
let lastSearchKey = '';
let lastFilterKey = '';
let queuedPage = null;
let queuedFilter = null;
let regionSettled = false;
const listeners = new Set();

function ready() {
  return mode === 'on' && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function readChoice() {
  try {
    const value = localStorage.getItem(CHOICE_KEY);
    return value === 'granted' || value === 'denied' ? value : '';
  } catch (err) {
    return '';
  }
}

function writeChoice(choice) {
  try {
    localStorage.setItem(CHOICE_KEY, choice);
  } catch (err) {
    /* private mode keeps the choice in memory only */
  }
}

export function analyticsState() {
  return { ready: mode !== 'pending', on: mode === 'on', ask };
}

function publish() {
  const state = analyticsState();
  listeners.forEach((listener) => listener(state));
}

export function subscribeAnalytics(listener) {
  listeners.add(listener);
  listener(analyticsState());
  return () => listeners.delete(listener);
}

function install() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);
}

function clearGaCookies() {
  if (typeof document === 'undefined') return;
  const names = ['_ga', '_ga_' + GA_ID.slice(2), '_gid'];
  const host = window.location.hostname;
  const domains = [''];
  if (host && host !== 'localhost' && host.includes('.')) {
    domains.push(host);
    const parts = host.split('.');
    if (parts.length >= 2) domains.push('.' + parts.slice(-2).join('.'));
  }
  names.forEach((name) => {
    domains.forEach((domain) => {
      const suffix = domain ? '; Domain=' + domain : '';
      document.cookie = name + '=; Max-Age=0; Path=/' + suffix;
    });
  });
}

function turnOn() {
  mode = 'on';
  ask = false;
  if (typeof window !== 'undefined') {
    window['ga-disable-' + GA_ID] = false;
    if (installed && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      install();
    }
  }
  if (queuedPage) sendPageview(queuedPage.loc, queuedPage.appName);
  if (queuedFilter) sendFilter(queuedFilter);
  publish();
}

function turnOff({ ask: nextAsk, disableScript }) {
  mode = 'off';
  ask = Boolean(nextAsk);
  lastPageKey = '';
  lastSearchKey = '';
  lastFilterKey = '';
  if (disableScript && typeof window !== 'undefined') {
    window['ga-disable-' + GA_ID] = true;
    if (installed && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    clearGaCookies();
  }
  publish();
}

function settle(decision) {
  if (decision.load) {
    turnOn();
    return;
  }
  turnOff({ ask: decision.ask, disableScript: true });
}

export function allowAnalytics() {
  writeChoice('granted');
  turnOn();
}

export function refuseAnalytics() {
  writeChoice('denied');
  turnOff({ ask: false, disableScript: true });
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch (err) {
    return segment;
  }
}

function describePage(pathname, search) {
  const lang = detectLang(pathname, search, languages);
  const parts = contentPath(pathname).split('/').filter(Boolean);
  const head = parts[0] || '';
  if (!head) return { lang, page_type: 'home', plant: '' };
  if (head === 'plant' && parts[1]) {
    return { lang, page_type: 'plant', plant: decodeSegment(parts[1]).replace(/_/g, ' ').trim() };
  }
  if (head === 'family' && parts[1]) return { lang, page_type: 'family', plant: '' };
  if (head === 'genus' && parts[1]) return { lang, page_type: 'genus', plant: '' };
  if (head === 'list' && parts[1]) return { lang, page_type: 'list', plant: '' };
  if (PAGE_TYPES.has(head)) return { lang, page_type: head, plant: '' };
  return { lang, page_type: 'other', plant: '' };
}

/** Plant titles load after the page view, so plant pages always report the Latin name. */
function pageTitleFor(plant, documentTitle, appName) {
  if (!plant) return documentTitle || '';
  return `${plant}${TITLE_GAP}${appName || "What's that flower?"}`;
}

function sendPageview(loc, appName) {
  if (!ready()) return;
  const pathname = loc.pathname || '/';
  const search = loc.search || '';
  const key = pathname + search;
  if (key === lastPageKey) return;
  lastPageKey = key;

  const described = describePage(pathname, search);
  const params = {
    page_path: key,
    page_location: window.location.origin + key,
    page_title: pageTitleFor(described.plant, document.title, appName),
    page_type: described.page_type,
    lang: described.lang,
    send_to: GA_ID,
  };
  if (described.plant) params.plant = described.plant;
  window.gtag('event', 'page_view', params);
}

export function pageview(loc, appName) {
  queuedPage = { loc, appName };
  if (mode === 'on') sendPageview(loc, appName);
}

export function trackSearch(term, resultCount) {
  if (!ready()) return;
  const search_term = String(term || '').trim().slice(0, 100);
  if (search_term.length < 2) {
    lastSearchKey = '';
    return;
  }
  if (search_term === lastSearchKey) return;
  lastSearchKey = search_term;
  window.gtag('event', 'search', {
    search_term,
    result_count: resultCount,
    send_to: GA_ID,
  });
}

function sendFilter(payload) {
  if (!ready() || !payload) return;
  if (payload.key === lastFilterKey) return;
  lastFilterKey = payload.key;
  window.gtag('event', 'filter_result', payload.params);
}

/** Same event as the field-guide key. Empty color and petal are omitted; empty habitat and region are "any". */
export function trackFilterResult({ color, habitat, petal, region, count }) {
  const colorValue = String(color || '').trim().slice(0, 40);
  const habitatValue = (String(habitat || '').trim() || 'any').slice(0, 40);
  const petalValue = String(petal || '').trim().slice(0, 40);
  const regionValue = (String(region || '').trim() || 'any').slice(0, 40);
  const active = Boolean(colorValue || petalValue || habitatValue !== 'any' || regionValue !== 'any');
  if (!active) {
    queuedFilter = null;
    lastFilterKey = '';
    return;
  }
  const resultCount = Number.isFinite(count) && count >= 0 ? Math.min(Math.floor(count), 100000) : 0;
  const params = {
    habitat: habitatValue,
    region: regionValue,
    count: resultCount,
    send_to: GA_ID,
  };
  if (colorValue) params.color = colorValue;
  if (petalValue) params.petal = petalValue;
  queuedFilter = {
    key: [colorValue, habitatValue, petalValue, regionValue, resultCount].join('\n'),
    params,
  };
  if (mode === 'on') sendFilter(queuedFilter);
}

/** A plant opened from a list. `source` matches the field guide (`key`, `search`, `list`). */
export function trackPlant(name, source) {
  if (!ready()) return;
  const itemId = String(name || '').trim().slice(0, 100);
  if (!itemId) return;
  const from = String(source || '').trim().slice(0, 24);
  window.gtag('event', 'select_content', {
    content_type: 'plant',
    item_id: itemId,
    ...(from ? { source: from } : {}),
    transport_type: 'beacon',
    send_to: GA_ID,
  });
}

export function trackStore(store) {
  if (!ready()) return;
  window.gtag('event', 'store_click', {
    store,
    page_path: window.location.pathname,
    transport_type: 'beacon',
    send_to: GA_ID,
  });
}

/** A tap on the sister field guide. Kept off store_click so that key event stays the flower app. */
export function trackSister(place) {
  if (!ready()) return;
  const where = String(place || '').trim().slice(0, 24);
  window.gtag('event', 'sister_click', {
    link_domain: 'whatsthatmushroom.app',
    ...(where ? { link_place: where } : {}),
    page_path: window.location.pathname,
    transport_type: 'beacon',
    send_to: GA_ID,
  });
}

async function readRegion() {
  const response = await fetch('/cdn-cgi/trace', { cache: 'no-store', credentials: 'omit' });
  if (!response.ok) return '';
  return parseCloudflareTrace(await response.text());
}

function boot() {
  if (typeof window === 'undefined') return;
  window['ga-disable-' + GA_ID] = true;
  const choice = readChoice();
  if (choice === 'granted') {
    settle(decisionFor({ choice, loc: '' }));
    return;
  }
  if (choice === 'denied') {
    settle(decisionFor({ choice, loc: '' }));
    return;
  }
  const timer = setTimeout(() => {
    if (regionSettled || readChoice()) return;
    settle(decisionFor({ choice: '', loc: '' }));
  }, REGION_WAIT_MS);
  readRegion()
    .then((loc) => {
      regionSettled = true;
      clearTimeout(timer);
      if (readChoice()) return;
      settle(decisionFor({ choice: '', loc }));
    })
    .catch(() => {
      regionSettled = true;
      clearTimeout(timer);
      if (readChoice()) return;
      settle(decisionFor({ choice: '', loc: '' }));
    });
}

boot();
