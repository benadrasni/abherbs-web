export const DISMISS_KEY = 'wtf-app-banner';
export const PLAY_PACKAGE = 'sk.ab.herbs';
export const IOS_APP_ID = '1449982118';

const CRAWLER =
  /googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterestbot|slackbot|applebot|redditbot|whatsapp|telegrambot|semrush|ahrefs|petalbot|crawler|spider/i;

// iPhone and iPad Safari draw Apple's Smart App Banner from the apple-itunes-app
// meta tag, and that banner already opens the App Store when the app is missing.
const IN_APP_BROWSER = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\/|FBAN|FBAV|Instagram|Line\/|Twitter|OPT\/|YaBrowser/;

function isIpadOs(ua, maxTouchPoints) {
  if (!/Macintosh/.test(ua) || maxTouchPoints < 2) return false;
  // A touchscreen Mac runs a desktop browser. iPadOS browsers do not send Chrome/.
  if (/Chrome\/|Chromium\/|Firefox\/|Edg\//.test(ua)) return false;
  return true;
}

function isIosDevice(ua, maxTouchPoints) {
  return /iPad|iPhone|iPod/.test(ua) || isIpadOs(ua, maxTouchPoints);
}

export function isIosSafari(ua, maxTouchPoints) {
  const agent = String(ua || '');
  if (!isIosDevice(agent, maxTouchPoints)) return false;
  if (!/Safari/.test(agent)) return false;
  if (IN_APP_BROWSER.test(agent) || /Chrome|Chromium|Android/.test(agent)) return false;
  return true;
}

export function isMobileDevice(ua, maxTouchPoints) {
  const agent = String(ua || '');
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(agent)) return true;
  return isIpadOs(agent, maxTouchPoints);
}

export function storeForDevice(ua, maxTouchPoints) {
  const agent = String(ua || '');
  if (/Android/i.test(agent)) return 'google_play';
  if (isIosDevice(agent, maxTouchPoints)) return 'app_store';
  return null;
}

export function relatedAppInstalled(apps) {
  if (!Array.isArray(apps)) return false;
  return apps.some((app) => {
    const id = String(app && app.id != null ? app.id : '');
    return id === PLAY_PACKAGE || id === IOS_APP_ID || id === `id${IOS_APP_ID}`;
  });
}

export function readDismissed(storage) {
  try {
    return storage.getItem(DISMISS_KEY) === 'dismissed';
  } catch (err) {
    return false;
  }
}

export function writeDismissed(storage) {
  try {
    storage.setItem(DISMISS_KEY, 'dismissed');
  } catch (err) {
    // Private mode can refuse the write. The bar still closes for this view.
  }
}

// null: no custom bar. 'google_play' or 'app_store': show that store.
export function bannerDecision(env) {
  const ua = String(env.userAgent || '');
  const points = Number(env.maxTouchPoints) || 0;
  if (!ua || CRAWLER.test(ua)) return null;
  if (!isMobileDevice(ua, points)) return null;
  if (isIosSafari(ua, points)) return null;
  if (env.dismissed || env.installed) return null;
  return storeForDevice(ua, points);
}
