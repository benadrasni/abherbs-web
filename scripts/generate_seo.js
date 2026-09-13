#!/usr/bin/env node
/**
 * After Vite build: sitemap.xml + unique HTML shells for plant/family/genus URLs.
 * Indexed languages (keep in sync with src/lib.js INDEXED_LANGS): en unprefixed, others /{lang}/.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://whatsthatflower.com';
const APP = "What's that flower?";
const DB = 'https://abherbs-backend.firebaseio.com';
const PHOTO = 'https://storage.googleapis.com/abherbs-resources/photos/';
const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const INDEXED_LANGS = ['en', 'sk', 'de', 'fr', 'cs', 'pl', 'ru', 'es', 'pt', 'ja'];
const OG_LOCALE = {
  en: 'en_US',
  sk: 'sk_SK',
  de: 'de_DE',
  fr: 'fr_FR',
  cs: 'cs_CZ',
  pl: 'pl_PL',
  ru: 'ru_RU',
  es: 'es_ES',
  pt: 'pt_PT',
  ja: 'ja_JP',
};
const locales = require('../src/locales.json');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function localeOf(lang) {
  return Object.assign({}, locales.en || {}, locales[lang] || {});
}

function t(lang, key) {
  const cat = localeOf(lang);
  if (cat[key] != null) return cat[key];
  if ((locales.en || {})[key] != null) return locales.en[key];
  return key;
}

function plantsCount(lang, n) {
  const key = n === 1 ? 'plants_count_one' : 'plants_count_other';
  return String(t(lang, key)).replace('{n}', String(n));
}

function stripText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageUrl(lang, parts) {
  const segs = lang && lang !== 'en' ? [lang].concat(parts) : parts;
  if (!segs.length) return SITE + '/';
  return SITE + '/' + segs.map((part) => encodeURIComponent(part)).join('/') + '/';
}

function hreflangTags(parts) {
  return INDEXED_LANGS.map(
    (lang) =>
      '<link rel="alternate" hreflang="' + lang + '" href="' + escapeHtml(pageUrl(lang, parts)) + '">'
  ).concat([
    '<link rel="alternate" hreflang="x-default" href="' + escapeHtml(pageUrl('en', parts)) + '">',
  ]);
}

function displayName(label, fallback) {
  return String(label || fallback || '').trim();
}

function namedRows(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw)
    ? raw.map((row, index) => (row && row.name ? { ...row, id: row.id != null ? row.id : index } : null))
    : Object.keys(raw).map((key) => {
        const row = raw[key];
        if (!row || !row.name) return null;
        return { ...row, id: row.id != null ? row.id : key };
      });
  return list.filter(Boolean);
}

function catalogCovers(rows, expectedCount) {
  const n = rows.length;
  if (!n) return false;
  if (expectedCount == null || expectedCount === '') return n >= 1000;
  const count = Number(expectedCount);
  if (Number.isNaN(count)) return n >= 1000;
  return n >= count;
}

function plateUrl(header) {
  const rel = (header && header.illustrationUrl) || '';
  if (rel) return PHOTO + rel;
  const fallback = header && header.url;
  if (!fallback) return '';
  const parts = String(fallback).split('/');
  if (parts.length < 3) return '';
  return PHOTO + parts.slice(0, 3).join('/') + '/' + parts[2] + '.webp';
}

function labelFor(header, labels) {
  if (!labels || header.id == null) return header && header.name;
  const id = header.id;
  const row = Array.isArray(labels) ? labels[id] : labels[id] != null ? labels[id] : labels[String(id)];
  return row || header.name;
}

function taxonLabel(taxonomy, latin) {
  if (!taxonomy || !latin) return '';
  const raw = taxonomy[latin];
  const values = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.keys(raw)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => raw[key])
      : typeof raw === 'string'
        ? [raw]
        : [];
  const latinKey = String(latin).toLocaleLowerCase();
  const hit = values.find(
    (name) => typeof name === 'string' && name.trim() && name.trim().toLocaleLowerCase() !== latinKey
  );
  return hit ? String(hit).trim() : '';
}

function genusOf(name) {
  if (!name) return '';
  return String(name).split(' ')[0];
}

function safeSegment(name) {
  const value = String(name || '');
  if (!value || value.includes('..') || value.includes('/') || value.includes('\\')) {
    throw new Error('unsafe path segment: ' + value);
  }
  return value;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed ' + url + ': ' + res.status);
  return res.json();
}

function stripSeo(html) {
  return String(html || '')
    .replace(/<link rel="canonical"[^>]*>/g, '')
    .replace(/<link rel="alternate" hreflang="[^"]+"[^>]*>/g, '')
    .replace(/<meta property="og:[^"]+"[^>]*>/g, '')
    .replace(/<meta name="twitter:[^"]+"[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<div id="root"><\/div><noscript>[\s\S]*?<\/noscript>/g, '<div id="root"></div>');
}

function inject(template, opts) {
  const title = escapeHtml(opts.title);
  const description = escapeHtml((opts.description || '').slice(0, 240));
  const url = escapeHtml(opts.url);
  const lang = opts.lang || 'en';
  let html = template.replace(/<html lang="[^"]*">/, '<html lang="' + lang + '">');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="' + description + '">'
  );
  const extra = [
    '<link rel="canonical" href="' + url + '">',
  ]
    .concat(hreflangTags(opts.parts || []))
    .concat([
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="' + escapeHtml(t(lang, 'app_name') || APP) + '">',
      '<meta property="og:locale" content="' + (OG_LOCALE[lang] || 'en_US') + '">',
      '<meta property="og:title" content="' + title + '">',
      '<meta property="og:description" content="' + description + '">',
      '<meta property="og:url" content="' + url + '">',
      opts.image ? '<meta property="og:image" content="' + escapeHtml(opts.image) + '">' : '',
      '<meta name="twitter:card" content="' + (opts.image ? 'summary_large_image' : 'summary') + '">',
      opts.jsonLd
        ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd) + '</script>'
        : '',
    ])
    .filter(Boolean)
    .join('');
  html = html.replace('</head>', extra + '</head>');
  if (opts.noscript) {
    html = html.replace(
      '<div id="root"></div>',
      '<div id="root"></div><noscript>' + opts.noscript + '</noscript>'
    );
  }
  return html;
}

function writePage(relParts, html) {
  const dir = path.join(BUILD, ...relParts.map(safeSegment));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

function sitemapXml(entries) {
  const body = entries
    .map((entry) => {
      const loc = pageUrl(entry.lang, entry.parts);
      const links = INDEXED_LANGS.map(
        (lang) =>
          '    <xhtml:link rel="alternate" hreflang="' +
          lang +
          '" href="' +
          pageUrl(lang, entry.parts).replace(/&/g, '&amp;') +
          '"/>'
      ).concat([
        '    <xhtml:link rel="alternate" hreflang="x-default" href="' +
          pageUrl('en', entry.parts).replace(/&/g, '&amp;') +
          '"/>',
      ]);
      return (
        '  <url>\n    <loc>' +
        loc.replace(/&/g, '&amp;') +
        '</loc>\n' +
        links.join('\n') +
        '\n  </url>'
      );
    })
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    body +
    '\n</urlset>\n'
  );
}

async function main() {
  const templatePath = path.join(BUILD, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('build/index.html missing; run vite build first');
  }
  const template = stripSeo(fs.readFileSync(templatePath, 'utf8'));

  const langPacks = await Promise.all(
    INDEXED_LANGS.map((lang) =>
      Promise.all([
        getJson(DB + '/translations/' + lang + '.json').catch(() => ({})),
        getJson(DB + '/web/labels/' + lang + '.json').catch(() => null),
        getJson(DB + '/translations_taxonomy/' + lang + '.json').catch(() => null),
      ]).then(([translations, labels, taxonomy]) => ({
        lang,
        translations: translations && typeof translations === 'object' ? translations : {},
        labels,
        taxonomy,
      }))
    )
  );
  const [webCatalog, count, headers] = await Promise.all([
    getJson(DB + '/web/catalog.json').catch(() => null),
    getJson(DB + '/plants_to_update/count.json').catch(() => null),
    getJson(DB + '/plants_headers.json'),
  ]);
  const catalogRows = namedRows(webCatalog);
  const headerRows = namedRows(headers);
  const plants = catalogCovers(catalogRows, count) ? catalogRows : headerRows;
  const packByLang = {};
  langPacks.forEach((pack) => {
    packByLang[pack.lang] = pack;
  });

  const families = {};
  const genera = {};
  plants.forEach((header) => {
    const family = header.family || '';
    const genus = genusOf(header.name);
    if (family) families[family] = (families[family] || 0) + 1;
    if (genus) genera[genus] = (genera[genus] || 0) + 1;
  });

  const entries = [];

  function emit(lang, parts, opts) {
    const url = pageUrl(lang, parts);
    const html = inject(template, {
      ...opts,
      lang,
      parts,
      url,
    });
    if (!parts.length) {
      if (lang === 'en') fs.writeFileSync(templatePath, html);
      else writePage([lang], html);
    } else {
      writePage(lang === 'en' ? parts : [lang].concat(parts), html);
    }
    entries.push({ lang, parts });
  }

  INDEXED_LANGS.forEach((lang) => {
    const app = t(lang, 'app_name') || APP;
    const pack = packByLang[lang] || { translations: {}, labels: null, taxonomy: null };
    const homeDesc = t(lang, 'seo_home');
    emit(lang, [], {
      title: app,
      description: homeDesc,
      noscript: '<h1>' + escapeHtml(app) + '</h1><p>' + escapeHtml(homeDesc) + '</p>',
    });

    const staticPages = [
      ['families', t(lang, 'families'), t(lang, 'seo_families')],
      ['genera', t(lang, 'genera'), t(lang, 'seo_genera')],
      ['identify', t(lang, 'identify'), t(lang, 'seo_identify')],
      ['about', t(lang, 'about'), t(lang, 'seo_about')],
      ['help', t(lang, 'help'), t(lang, 'seo_help')],
    ];
    staticPages.forEach(([slug, heading, description]) => {
      const title = heading + ' — ' + app;
      emit(lang, [slug], {
        title,
        description,
        noscript: '<h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(description) + '</p>',
      });
    });

    plants.forEach((header) => {
      const name = header.name;
      const text = pack.translations[name] || {};
      const label = displayName(text.label || labelFor(header, pack.labels), name);
      const title = label + ' (' + name + ') — ' + app;
      const description = stripText(text.description || title).slice(0, 240);
      const url = pageUrl(lang, ['plant', name]);
      const image = plateUrl(header);
      const family = header.family || '';
      emit(lang, ['plant', name], {
        title,
        description,
        image,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Taxon',
          name,
          alternateName: text.label || undefined,
          description,
          taxonRank: 'Species',
          inLanguage: lang,
          url,
          image: image || undefined,
          parentTaxon: family
            ? { '@type': 'Taxon', name: family, taxonRank: 'Family' }
            : undefined,
        },
        noscript:
          '<h1>' +
          escapeHtml(label) +
          '</h1><p><i>' +
          escapeHtml(name) +
          '</i></p><p>' +
          escapeHtml(description) +
          '</p>',
      });
    });

    Object.keys(families)
      .sort()
      .forEach((family) => {
        const n = families[family];
        const common = displayName(taxonLabel(pack.taxonomy, family), '');
        const titled = common ? common + ' (' + family + ')' : family;
        const description = titled + '. ' + plantsCount(lang, n);
        const url = pageUrl(lang, ['family', family]);
        emit(lang, ['family', family], {
          title: titled + ' — ' + app,
          description,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Taxon',
            name: family,
            alternateName: common || undefined,
            taxonRank: 'Family',
            inLanguage: lang,
            url,
          },
          noscript:
            '<h1>' +
            escapeHtml(common || family) +
            '</h1>' +
            (common ? '<p><i>' + escapeHtml(family) + '</i></p>' : '') +
            '<p>' +
            escapeHtml(description) +
            '</p>',
        });
      });

    Object.keys(genera)
      .sort()
      .forEach((genus) => {
        const n = genera[genus];
        const common = displayName(taxonLabel(pack.taxonomy, genus), '');
        const titled = common ? common + ' (' + genus + ')' : genus;
        const description = titled + '. ' + plantsCount(lang, n);
        const url = pageUrl(lang, ['genus', genus]);
        emit(lang, ['genus', genus], {
          title: titled + ' — ' + app,
          description,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Taxon',
            name: genus,
            alternateName: common || undefined,
            taxonRank: 'Genus',
            inLanguage: lang,
            url,
          },
          noscript:
            '<h1>' +
            escapeHtml(common || genus) +
            '</h1>' +
            (common ? '<p><i>' + escapeHtml(genus) + '</i></p>' : '') +
            '<p>' +
            escapeHtml(description) +
            '</p>',
        });
      });
  });

  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemapXml(entries));
  console.log(
    'seo pages',
    plants.length,
    'plants',
    Object.keys(families).length,
    'families',
    Object.keys(genera).length,
    'genera',
    'langs',
    INDEXED_LANGS.join(','),
    'sitemap',
    entries.length
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
