import React, { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { pageview } from './analytics';
import { loadLabels, loadPlantIndex, loadTaxonomyLabels } from './api';
import Header from './components/Header';
import SeoHead from './components/SeoHead';
import { uiText } from './copy';
import languages from './languages';
import {
  PATH_LANGS,
  compactHeaders,
  contentPath,
  detectLang,
  indexHeadersById,
  langFromPath,
  normPath,
  normalizeLang,
  plantPath,
  readLangCookie,
  withLang,
  writeLangCookie,
} from './lib';
import AboutPage from './pages/AboutPage';
import FamiliesPage from './pages/FamiliesPage';
import GeneraPage from './pages/GeneraPage';
import FamilyPage from './pages/FamilyPage';
import HelpPage from './pages/HelpPage';
import HomePage from './pages/HomePage';
import IdentifyPage from './pages/IdentifyPage';
import ListPage from './pages/ListPage';
import PlantPage from './pages/PlantPage';

function routeNeedsIndex(pathname) {
  const path = contentPath(pathname);
  return (
    path === '/' ||
    path === '/about' ||
    path === '/families' ||
    path === '/genera' ||
    path.startsWith('/family/') ||
    path.startsWith('/genus/') ||
    path.startsWith('/list/')
  );
}

function routeNeedsLabels(pathname) {
  const path = contentPath(pathname);
  return (
    path === '/' ||
    path.startsWith('/family/') ||
    path.startsWith('/genus/') ||
    path.startsWith('/list/')
  );
}

function samePlace(location, dest) {
  const url = new URL(dest, 'https://whatsthatflower.com');
  return (
    normPath(url.pathname) === normPath(location.pathname) &&
    url.search === location.search &&
    url.hash === (location.hash || '')
  );
}

function joinPath(path, params, hash) {
  const q = params.toString();
  if (!q) return path + hash;
  return path + (path.includes('?') ? '&' : '?') + q + hash;
}

function migratedLocation(location) {
  const params = new URLSearchParams(location.search);
  const hash = location.hash || '';
  let pathname = location.pathname;
  const parts = normPath(pathname).split('/').filter(Boolean);

  if (parts[0] === 'en') {
    params.delete('lang');
    pathname = parts.length === 1 ? '/' : '/' + parts.slice(1).join('/');
  }

  const qLangRaw = params.get('lang');
  if (qLangRaw) {
    const pathLang = langFromPath(pathname);
    const qLang = normalizeLang(qLangRaw, languages);
    if (pathLang !== 'en' || PATH_LANGS.includes(qLang) || qLang === 'en') {
      params.delete('lang');
      if (pathLang === 'en') pathname = withLang(contentPath(pathname), qLang);
    }
  }

  const qPlant = params.get('plant');
  if (qPlant) {
    params.delete('plant');
    const name = String(qPlant).replace(/_/g, ' ').trim();
    if (name) pathname = plantPath(name, langFromPath(pathname));
  }

  const plantSeg = contentPath(pathname).split('/').filter(Boolean);
  if (plantSeg[0] === 'plant' && plantSeg[1] && plantSeg[1].includes('_')) {
    const name = decodeURIComponent(plantSeg[1]).replace(/_/g, ' ').trim();
    if (name) pathname = plantPath(name, langFromPath(pathname));
  }

  if (normPath(pathname) === '/' && !params.get('lang') && !params.get('plant')) {
    const preferred = normalizeLang(readLangCookie(), languages);
    if (preferred && preferred !== 'en') pathname = withLang('/', preferred);
  }

  const dest = joinPath(pathname, params, hash);
  return dest === joinPath(location.pathname, new URLSearchParams(location.search), hash) ? null : dest;
}

function StripEn() {
  const location = useLocation();
  const rest = location.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return <Navigate to={`${rest}${location.search}${location.hash}`} replace />;
}

const PAGE_SCROLL_KEY = 'wtf-page-scroll';
const pageScrollPositions = new Map();
let pageScrollHydrated = false;

function pageScrollKey(location) {
  const path = normPath(location.pathname);
  const plant = new URLSearchParams(location.search).get('plant');
  return plant ? `${path}?plant=${plant}` : path;
}

function loadPageScrolls() {
  if (!pageScrollHydrated) {
    pageScrollHydrated = true;
    try {
      const raw = JSON.parse(sessionStorage.getItem(PAGE_SCROLL_KEY) || '{}');
      Object.entries(raw).forEach(([k, v]) => pageScrollPositions.set(k, Number(v) || 0));
    } catch (err) {
      // private mode / quota
    }
  }
  return pageScrollPositions;
}

function savePageScroll(key, y) {
  const positions = loadPageScrolls();
  positions.set(key, y);
  try {
    sessionStorage.setItem(PAGE_SCROLL_KEY, JSON.stringify(Object.fromEntries(positions)));
  } catch (err) {
    // private mode / quota
  }
}

function usePageScroll(location) {
  const prevKey = useRef(pageScrollKey(location));
  const key = pageScrollKey(location);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let frame = 0;
    const persist = () => {
      const y = window.scrollY;
      if (y > 0) savePageScroll(prevKey.current, y);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        persist();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
    };
  }, []);

  useLayoutEffect(() => {
    const prev = prevKey.current;
    if (prev !== key) {
      const current = window.scrollY;
      if (current > 0) savePageScroll(prev, current);
      prevKey.current = key;
    }
    const y = loadPageScrolls().get(key) || 0;
    let done = false;
    const apply = () => {
      if (done) return;
      window.scrollTo(0, y);
      if (y <= 0) {
        done = true;
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max >= y - 1) done = true;
    };
    apply();
    if (done) return undefined;
    const root = document.documentElement;
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null;
    if (ro) ro.observe(root);
    const stop = () => {
      done = true;
    };
    window.addEventListener('wheel', stop, { passive: true, once: true });
    window.addEventListener('touchmove', stop, { passive: true, once: true });
    const timer = window.setTimeout(stop, 2500);
    return () => {
      done = true;
      if (ro) ro.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
  }, [key]);
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  usePageScroll(location);

  useLayoutEffect(() => {
    const dest = migratedLocation(location);
    if (dest && !samePlace(location, dest)) {
      navigate(dest, { replace: true });
    }
  }, [location, navigate]);

  const lang = detectLang(location.pathname, location.search, languages);
  const queryPlant = new URLSearchParams(location.search).get('plant');
  const needsIndex = !queryPlant && routeNeedsIndex(location.pathname);
  const needsLabels = !queryPlant && routeNeedsLabels(location.pathname);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [labels, setLabels] = useState(null);
  const [taxonomy, setTaxonomy] = useState(null);

  useEffect(() => {
    if (!needsIndex) return undefined;
    let live = true;
    loadPlantIndex()
      .then((index) => {
        if (live) setRawHeaders(index.raw || []);
      })
      .catch(() => {
        if (live) setRawHeaders([]);
      });
    return () => {
      live = false;
    };
  }, [needsIndex]);

  useEffect(() => {
    if (!needsLabels) return undefined;
    let live = true;
    loadLabels(lang)
      .then((data) => {
        if (live) setLabels(data);
      })
      .catch(() => {
        if (live) setLabels(null);
      });
    return () => {
      live = false;
    };
  }, [needsLabels, lang]);

  useEffect(() => {
    let live = true;
    loadTaxonomyLabels(lang)
      .then((data) => {
        if (live) setTaxonomy(data && typeof data === 'object' ? data : null);
      })
      .catch(() => {
        if (live) setTaxonomy(null);
      });
    return () => {
      live = false;
    };
  }, [lang]);

  useEffect(() => {
    if (location.hash === '#app') {
      navigate(withLang('/identify', lang), { replace: true });
    }
  }, [location.hash, lang, navigate]);

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  const headers = useMemo(() => compactHeaders(rawHeaders), [rawHeaders]);
  const headersById = useMemo(() => indexHeadersById(headers), [headers]);
  const t = useMemo(() => uiText(lang), [lang]);

  const setLang = (next) => {
    writeLangCookie(next);
    const params = new URLSearchParams(location.search);
    params.delete('lang');
    const rest = contentPath(location.pathname);
    const q = params.toString();
    navigate(withLang(rest, next) + (q ? `?${q}` : '') + (location.hash || ''));
  };

  const home = queryPlant ? (
    <PlantPage lang={lang} t={t} requestedName={queryPlant} taxonomy={taxonomy} />
  ) : (
    <HomePage
      lang={lang}
      t={t}
      headers={headers}
      headersById={headersById}
      labels={labels}
      taxonomy={taxonomy}
    />
  );

  const catalogRoutes = (prefix) => {
    const p = (seg) => (prefix ? `/${prefix}${seg}` : seg);
    return (
      <Fragment key={prefix || 'en'}>
        <Route path={p('/identify')} element={<IdentifyPage lang={lang} t={t} />} />
        <Route path={p('/about')} element={<AboutPage lang={lang} t={t} headers={headers} />} />
        <Route path={p('/help')} element={<HelpPage lang={lang} t={t} />} />
        <Route
          path={p('/families')}
          element={<FamiliesPage lang={lang} t={t} headers={headers} taxonomy={taxonomy} />}
        />
        <Route
          path={p('/genera')}
          element={<GeneraPage lang={lang} t={t} headers={headers} taxonomy={taxonomy} />}
        />
        <Route
          path={p('/family/:family')}
          element={
            <FamilyPage
              lang={lang}
              t={t}
              headers={headers}
              labels={labels}
              taxonomy={taxonomy}
              mode="family"
            />
          }
        />
        <Route
          path={p('/genus/:genus')}
          element={
            <FamilyPage
              lang={lang}
              t={t}
              headers={headers}
              labels={labels}
              taxonomy={taxonomy}
              mode="genus"
            />
          }
        />
        <Route
          path={p('/list/:name')}
          element={
            <ListPage
              lang={lang}
              t={t}
              headersById={headersById}
              labels={labels}
              taxonomy={taxonomy}
            />
          }
        />
        <Route path={p('/plant/:name')} element={<PlantPage lang={lang} t={t} taxonomy={taxonomy} />} />
        <Route path={p('/translate_flower')} element={<Navigate to={withLang('/', lang)} replace />} />
        <Route path={p('/translate_app')} element={<Navigate to={withLang('/', lang)} replace />} />
        <Route path={prefix ? `/${prefix}` : '/'} element={home} />
        {prefix ? <Route path={`/${prefix}/`} element={home} /> : null}
      </Fragment>
    );
  };

  return (
    <>
      <Header lang={lang} t={t} onLang={setLang} />
      <SeoHead lang={lang} pathname={location.pathname} search={location.search} />
      <Routes>
        <Route path="/translate_flower" element={<Navigate to={withLang('/', lang)} replace />} />
        <Route path="/translate_app" element={<Navigate to={withLang('/', lang)} replace />} />
        <Route path="/en" element={<Navigate to="/" replace />} />
        <Route path="/en/*" element={<StripEn />} />
        {catalogRoutes('')}
        {PATH_LANGS.map((code) => catalogRoutes(code))}
      </Routes>
    </>
  );
}
