import catalogs from './locales.json';

function interpolate(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] == null ? `{${key}}` : String(vars[key])
  );
}

function pluralCategory(lang, n) {
  try {
    return new Intl.PluralRules(lang || 'en').select(Number(n));
  } catch (err) {
    return Number(n) === 1 ? 'one' : 'other';
  }
}

export function uiText(lang) {
  const en = catalogs.en || {};
  const chosen = (lang && catalogs[lang]) || {};
  const catalog = { ...en, ...chosen };
  if (!catalog.app_short) catalog.app_short = catalog.get_lede;

  const raw = (key) => {
    if (catalog[key] != null) return catalog[key];
    if (en[key] != null) return en[key];
    return null;
  };

  const text = (key, vars) => {
    const template = raw(key);
    if (template == null) return key;
    return vars ? interpolate(template, vars) : template;
  };

  const plural = (base, n) => {
    const count = Number(n);
    const formatted = count.toLocaleString(lang || 'en');
    const cat = pluralCategory(lang, count);
    const order = {
      zero: [`${base}_zero`, `${base}_other`],
      one: [`${base}_one`, `${base}_other`],
      two: [`${base}_two`, `${base}_few`, `${base}_other`],
      few: [`${base}_few`, `${base}_other`],
      many: [`${base}_many`, `${base}_other`],
      other: [`${base}_other`],
    };
    const keys = order[cat] || order.other;
    for (let i = 0; i < keys.length; i++) {
      if (raw(keys[i]) != null) return text(keys[i], { n: formatted });
    }
    return text(`${base}_other`, { n: formatted });
  };

  return {
    ...catalog,
    plants_count: (n) => plural('plants_count', n),
    photo_n: (i, n) => text('photo_n', { i, n }),
    more_names: (n) => text('more_names', { n }),
    public_records: (n) =>
      Number(n) === 1 ? text('public_records_one') : text('public_records_other', { n }),
    plate_alt: (name) => text('plate_alt', { name }),
  };
}
