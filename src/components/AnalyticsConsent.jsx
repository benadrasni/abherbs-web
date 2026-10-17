import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { allowAnalytics, analyticsState, refuseAnalytics, subscribeAnalytics } from '../analytics';
import { withLang } from '../lib';

export default function AnalyticsConsent({ lang, t }) {
  const [state, setState] = useState(analyticsState);
  const bar = useRef(null);

  useEffect(() => subscribeAnalytics(setState), []);

  useEffect(() => {
    const root = document.documentElement;
    if (!state.ask) {
      root.classList.remove('ga-ask');
      root.style.removeProperty('--ga-banner-h');
      return undefined;
    }
    root.classList.add('ga-ask');
    const node = bar.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const apply = () => root.style.setProperty('--ga-banner-h', node.offsetHeight + 'px');
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.classList.remove('ga-ask');
      root.style.removeProperty('--ga-banner-h');
    };
  }, [state.ask, t.ga_banner]);

  if (!state.ask) return null;

  return (
    <div className="ga-banner" ref={bar} role="region" aria-label={t.privacy}>
      <p>{t.ga_banner}</p>
      <div className="ga-actions">
        <button type="button" className="ga-choice" onClick={allowAnalytics}>{t.ga_allow}</button>
        <button type="button" className="ga-choice" onClick={refuseAnalytics}>{t.ga_refuse}</button>
        <Link className="ga-choice" to={withLang('/privacy', lang)}>{t.privacy}</Link>
      </div>
    </div>
  );
}
