import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  bannerDecision,
  pageStorage,
  readDismissed,
  relatedAppInstalled,
  writeDismissed,
} from '../appBanner.mjs';
import { trackStore } from '../analytics';
import { APP_STORE_URL, PLAY_URL } from '../lib';

// The bar has to be in the first render. Choosing it in an effect inserts it
// after paint and pushes the page down.
function initialStore() {
  if (typeof navigator === 'undefined') return null;
  return bannerDecision({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    dismissed: readDismissed(pageStorage()),
  });
}

export default function AppBanner({ t }) {
  const [store, setStore] = useState(initialStore);
  const bar = useRef(null);

  useEffect(() => {
    if (!store) return undefined;
    let cancel = false;
    const ask = navigator.getInstalledRelatedApps;
    if (typeof ask !== 'function') return undefined;
    ask.call(navigator).then((apps) => {
      if (!cancel && relatedAppInstalled(apps)) setStore(null);
    }).catch(() => {});
    return () => { cancel = true; };
  }, [store]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!store) {
      root.style.removeProperty('--app-banner-h');
      return undefined;
    }
    const node = bar.current;
    if (!node) return undefined;
    const apply = () => root.style.setProperty('--app-banner-h', node.offsetHeight + 'px');
    apply();
    if (typeof ResizeObserver === 'undefined') {
      return () => root.style.removeProperty('--app-banner-h');
    }
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--app-banner-h');
    };
  }, [store, t.app_name, t.app_short, t.app_banner_get]);

  if (!store) return null;

  const play = store === 'google_play';
  const dismiss = () => {
    writeDismissed(pageStorage());
    setStore(null);
  };

  return (
    <div className="app-banner" ref={bar} role="region" aria-label={t.app_name}>
      <button type="button" className="app-banner-x" onClick={dismiss} aria-label={t.close}>
        ×
      </button>
      <img src="/images/app-icon.png" alt="" width="40" height="40" />
      <span className="app-banner-copy">
        <strong>{t.app_name}</strong>
        <span>{t.app_short}</span>
      </span>
      <a
        className="app-banner-get"
        href={play ? PLAY_URL : APP_STORE_URL}
        aria-label={play ? t.store_play : t.store_apple}
        onClick={() => trackStore(store)}
      >
        {t.app_banner_get}
      </a>
    </div>
  );
}
