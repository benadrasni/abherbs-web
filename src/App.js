import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
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
  const history = useHistory();
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
      history.replace(`/identify?lang=${encodeURIComponent(lang)}`);
    }
  }, [location.hash, lang, history]);

  const headers = useMemo(() => compactHeaders(rawHeaders), [rawHeaders]);
  const t = useMemo(() => uiText(lang, loc), [lang, loc]);

  const setLang = (next) => {
    const params = new URLSearchParams(location.search);
    params.set('lang', next);
    history.push(`${location.pathname}?${params.toString()}${location.hash || ''}`);
  };

  return (
    <>
      <Header lang={lang} t={t} onLang={setLang} />
      <Switch>
        <Route path="/translate_flower" render={() => <Redirect to="/" />} />
        <Route path="/translate_app" render={() => <Redirect to="/" />} />
        <Route path="/identify" render={() => <IdentifyPage lang={lang} t={t} />} />
        <Route path="/about" render={() => <AboutPage lang={lang} t={t} loc={loc} />} />
        <Route path="/help" render={() => <HelpPage lang={lang} t={t} loc={loc} />} />
        <Route path="/families" render={() => <FamiliesPage lang={lang} t={t} headers={headers} />} />
        <Route path="/genera" render={() => <GeneraPage lang={lang} t={t} headers={headers} />} />
        <Route
          path="/family/:family"
          render={() => <FamilyPage lang={lang} t={t} headers={headers} mode="family" />}
        />
        <Route
          path="/genus/:genus"
          render={() => <FamilyPage lang={lang} t={t} headers={headers} mode="genus" />}
        />
        <Route path="/plant/:name" render={() => <PlantPage lang={lang} t={t} />} />
        <Route
          exact
          path="/"
          render={() =>
            queryPlant ? (
              <PlantPage lang={lang} t={t} requestedName={queryPlant} />
            ) : (
              <HomePage lang={lang} t={t} headers={headers} headersById={rawHeaders} />
            )
          }
        />
      </Switch>
    </>
  );
}
