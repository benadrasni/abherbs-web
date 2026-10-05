import languages from './languages';
import { contentPath, detectLang } from './lib';

const GA_ID = 'G-B646H2Z8M4';

const TITLE_GAP = ' — ';
const PAGE_TYPES = new Set([
  'identify',
  'about',
  'help',
  'families',
  'genera',
  'family',
  'genus',
  'list',
  'plant',
]);

let lastPageKey = '';
let lastSearchKey = '';

function ready() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
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

export function pageview(loc, appName) {
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

export function trackStore(store) {
  if (!ready()) return;
  window.gtag('event', 'store_click', {
    store,
    page_path: window.location.pathname,
    transport_type: 'beacon',
    send_to: GA_ID,
  });
}
