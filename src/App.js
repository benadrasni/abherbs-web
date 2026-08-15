import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { pageview } from './analytics';
import { loadHeaders, loadWebStrings } from './api';
import Header from './components/Header';
import { uiText } from './copy';
import languages from './languages';
import { RTL, compactHeaders, detectLang } from './lib';
import AboutPage from './pages/AboutPage';
import FamiliesPage from './pages/FamiliesPage';
import GeneraPage from './pages/GeneraPage';
import FamilyPage from './pages/FamilyPage';
import HelpPage from './pages/HelpPage';
import HomePage from './pages/HomePage';
import IdentifyPage from './pages/IdentifyPage';
import PlantPage from './pages/PlantPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = detectLang(location.search, languages);
  const queryPlant = new URLSearchParams(location.search).get('plant');
  const [rawHeaders, setRawHeaders] = useState([]);
  const [loc, setLoc] = useState({});

  useEffect(() => {
    loadHeaders()
      .then((data) => setRawHeaders(Array.isArray(data) ? data : []))
      .catch(() => setRawHeaders([]));
  }, []);

  useEffect(() => {
    loadWebStrings(lang)
      .then((data) => setLoc(data || {}))
      .catch(() => setLoc({}));
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
  const t = useMemo(() => uiText(lang, loc), [lang, loc]);

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
        <Route path="/about" element={<AboutPage lang={lang} t={t} loc={loc} />} />
        <Route path="/help" element={<HelpPage lang={lang} t={t} loc={loc} />} />
        <Route path="/families" element={<FamiliesPage lang={lang} t={t} headers={headers} />} />
        <Route path="/genera" element={<GeneraPage lang={lang} t={t} headers={headers} />} />
        <Route
          path="/family/:family"
          element={<FamilyPage lang={lang} t={t} headers={headers} mode="family" />}
        />
        <Route
          path="/genus/:genus"
          element={<FamilyPage lang={lang} t={t} headers={headers} mode="genus" />}
        />
        <Route path="/plant/:name" element={<PlantPage lang={lang} t={t} />} />
        <Route
          path="/"
          element={
            queryPlant ? (
              <PlantPage lang={lang} t={t} requestedName={queryPlant} />
            ) : (
              <HomePage lang={lang} t={t} headers={headers} headersById={rawHeaders} />
            )
          }
        />
      </Routes>
    </>
  );
}
