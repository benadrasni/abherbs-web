import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { pageview } from './analytics';
import { loadLabels, loadPlantIndex, loadTaxonomyLabels } from './api';
import Header from './components/Header';
import { uiText } from './copy';
import languages from './languages';
import { RTL, compactHeaders, detectLang, indexHeadersById, normPath } from './lib';
import AboutPage from './pages/AboutPage';
import FamiliesPage from './pages/FamiliesPage';
import GeneraPage from './pages/GeneraPage';
import FamilyPage from './pages/FamilyPage';
import HelpPage from './pages/HelpPage';
import HomePage from './pages/HomePage';
import IdentifyPage from './pages/IdentifyPage';
import PlantPage from './pages/PlantPage';

function routeNeedsIndex(pathname) {
  const path = normPath(pathname);
  return (
    path === '/' ||
    path === '/families' ||
    path === '/genera' ||
    path.startsWith('/family/') ||
    path.startsWith('/genus/')
  );
}

function routeNeedsLabels(pathname) {
  const path = normPath(pathname);
  return path === '/' || path.startsWith('/family/') || path.startsWith('/genus/');
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
  const lang = detectLang(location.search, languages);
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
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (location.hash === '#app') {
      navigate(`/identify?lang=${encodeURIComponent(lang)}`, { replace: true });
    }
  }, [location.hash, lang, navigate]);

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  const headers = useMemo(() => compactHeaders(rawHeaders), [rawHeaders]);
  const headersById = useMemo(() => indexHeadersById(headers), [headers]);
  const t = useMemo(() => uiText(lang), [lang]);

  const setLang = (next) => {
    const params = new URLSearchParams(location.search);
    params.set('lang', next);
    navigate(`${location.pathname}?${params.toString()}${location.hash || ''}`);
  };

  return (
    <>
      <Header lang={lang} t={t} onLang={setLang} />
      <Routes>
        <Route path="/translate_flower" element={<Navigate to="/" replace />} />
        <Route path="/translate_app" element={<Navigate to="/" replace />} />
        <Route path="/identify" element={<IdentifyPage lang={lang} t={t} />} />
        <Route path="/about" element={<AboutPage lang={lang} t={t} />} />
        <Route path="/help" element={<HelpPage lang={lang} t={t} />} />
        <Route
          path="/families"
          element={<FamiliesPage lang={lang} t={t} headers={headers} taxonomy={taxonomy} />}
        />
        <Route
          path="/genera"
          element={<GeneraPage lang={lang} t={t} headers={headers} taxonomy={taxonomy} />}
        />
        <Route
          path="/family/:family"
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
          path="/genus/:genus"
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
        <Route path="/plant/:name" element={<PlantPage lang={lang} t={t} taxonomy={taxonomy} />} />
        <Route
          path="/"
          element={
            queryPlant ? (
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
            )
          }
        />
      </Routes>
    </>
  );
}
