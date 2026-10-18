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

  const raw = (key) => {
    if (catalog[key] != null) return catalog[key];
    return null;
  };

  // Plural variants are not inherited from English. An English placeholder
  // such as more_names_many would otherwise win for Polish 5+.
  const own = (key) => {
    if (chosen[key] != null) return chosen[key];
    if (!lang || lang === 'en') return en[key] == null ? null : en[key];
    return null;
  };

  const text = (key, vars) => {
    const template = raw(key);
    if (template == null) return key;
    return vars ? interpolate(template, vars) : template;
  };

  const plural = (base, n, fallback) => {
    const count = Number(n);
    const formatted = count.toLocaleString(lang || 'en');
    const cat = pluralCategory(lang, count);
    const tail = fallback ? [fallback] : [];
    const order = {
      zero: [`${base}_zero`, `${base}_other`, ...tail],
      one: [`${base}_one`, `${base}_other`, ...tail],
      two: [`${base}_two`, `${base}_few`, `${base}_other`, ...tail],
      few: [`${base}_few`, `${base}_other`, ...tail],
      many: [`${base}_many`, `${base}_other`, ...tail],
      other: [`${base}_other`, ...tail],
    };
    const keys = order[cat] || order.other;
    const fill = (template) => interpolate(template, { n: formatted });
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const template = key === fallback ? raw(key) : own(key);
      if (template != null) return fill(template);
    }
    const inherited = raw(fallback || `${base}_other`);
    if (inherited != null) return fill(inherited);
    return fallback || `${base}_other`;
  };

  const taxonRank = (latin) => {
    const suffix = String(latin || '').toLowerCase();
    if (!suffix) return text('taxonomy_unknown');
    const key = `taxonomy_${suffix}`;
    if (raw(key) != null) return text(key);
    return text('taxonomy_unknown');
  };

  return {
    ...catalog,
    plants_count: (n) => plural('plants_count', n),
    photo_n: (i, n) => text('photo_n', { i, n }),
    more_names: (n) => plural('more_names', n, 'more_names'),
    public_records: (n) =>
      Number(n) === 1 ? text('public_records_one') : text('public_records_other', { n }),
    plate_alt: (name) => text('plate_alt', { name }),
    distribution_alt: (name) => text('distribution_alt', { name }),
    about_why_p1: () => text('about_why_p1', { app: catalog.app_name }),
    about_langs_lede: (n) => text('about_langs_lede', { n: Number(n).toLocaleString(lang || 'en') }),
    taxonRank,
  };
}
