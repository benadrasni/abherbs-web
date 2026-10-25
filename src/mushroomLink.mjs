export const MUSHROOM_ORIGIN = 'https://whatsthatmushroom.app';

// Languages the mushroom site actually publishes. Others stay on the English home.
const MUSHROOM_LANGS = new Set(['sk']);

export function mushroomUrl(lang) {
  const code = String(lang || '').toLowerCase();
  if (!MUSHROOM_LANGS.has(code)) return `${MUSHROOM_ORIGIN}/`;
  return `${MUSHROOM_ORIGIN}/${code}/`;
}
