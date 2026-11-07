export const MUSHROOM_ORIGIN = 'https://whatsthatmushroom.app';
export const MUSHROOM_PLAY_URL = 'https://play.google.com/store/apps/details?id=sk.ab.shrooms';
export const MUSHROOM_APP_STORE_URL = 'https://apps.apple.com/us/app/whats-that-mushroom/id6826707489';

// Languages the mushroom site publishes. Others stay on the English home.
const MUSHROOM_LANGS = new Set([
  'sk', 'de', 'fr', 'cs', 'pl', 'ru', 'es', 'pt', 'ja', 'it', 'nl', 'uk', 'hu',
  'da', 'sv', 'no', 'fi', 'et', 'lv', 'lt', 'hr', 'sl', 'sr', 'bg', 'ro', 'hi',
  'ko', 'zh', 'fa', 'he', 'ar', 'id', 'tr',
]);

export function mushroomUrl(lang) {
  const code = String(lang || '').toLowerCase();
  if (!MUSHROOM_LANGS.has(code)) return `${MUSHROOM_ORIGIN}/`;
  return `${MUSHROOM_ORIGIN}/${code}/`;
}

export function mushroomIdentifyUrl(lang) {
  return `${mushroomUrl(lang)}identify/`;
}
