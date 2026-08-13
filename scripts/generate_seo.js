#!/usr/bin/env node
/**
 * After CRA build: sitemap.xml + unique HTML shells for plant/family/genus URLs.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://whatsthatflower.com';
const APP = "What's that flower?";
const DB = 'https://abherbs-backend.firebaseio.com';
const PHOTO = 'https://storage.googleapis.com/abherbs-resources/photos/';
const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function encodePath(parts) {
  return SITE + '/' + parts.map((part) => encodeURIComponent(part)).join('/') + '/';
}

function displayName(label, fallback) {
  const raw = String(label || fallback || '').trim();
  if (!raw) return '';
  return raw.charAt(0).toLocaleUpperCase() + raw.slice(1);
}

function plateUrl(header) {
  const rel = header && header.url;
  if (!rel) return '';
  const parts = String(rel).split('/');
  if (parts.length < 3) return '';
  return PHOTO + parts.slice(0, 3).join('/') + '/' + parts[2] + '.webp';
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

function inject(template, opts) {
  const title = escapeHtml(opts.title);
  const description = escapeHtml((opts.description || '').slice(0, 240));
  const url = escapeHtml(opts.url);
  let html = template.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    '<meta name="description" content="' + description + '">'
  );
  const extra = [
    '<link rel="canonical" href="' + url + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="' + escapeHtml(APP) + '">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + description + '">',
    '<meta property="og:url" content="' + url + '">',
    opts.image ? '<meta property="og:image" content="' + escapeHtml(opts.image) + '">' : '',
    '<meta name="twitter:card" content="' + (opts.image ? 'summary_large_image' : 'summary') + '">',
    opts.jsonLd
      ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd) + '</script>'
      : '',
  ]
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

function sitemapXml(urls) {
  const body = urls
    .map(
      (loc) =>
        '  <url><loc>' +
        loc.replace(/&/g, '&amp;') +
        '</loc></url>'
    )
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    '\n</urlset>\n'
  );
}

async function main() {
  const templatePath = path.join(BUILD, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('build/index.html missing; run react-scripts build first');
  }
  const template = fs.readFileSync(templatePath, 'utf8');

  const [headers, translations] = await Promise.all([
    getJson(DB + '/plants_headers.json'),
    getJson(DB + '/translations/en.json'),
  ]);
  const plants = (Array.isArray(headers) ? headers : []).filter((h) => h && h.name);
  const byName = translations && typeof translations === 'object' ? translations : {};

  const urls = [
    SITE + '/',
    SITE + '/families/',
    SITE + '/genera/',
    SITE + '/identify/',
    SITE + '/about/',
    SITE + '/help/',
  ];

  const homeDesc =
    "A plant encyclopedia with 19th-century botanical plates, field photographs, and public sightings. What's that flower?";
  fs.writeFileSync(
    templatePath,
    inject(template, {
      title: APP,
      description: homeDesc,
      url: SITE + '/',
      noscript:
        '<h1>' +
        escapeHtml(APP) +
        '</h1><p>' +
        escapeHtml(homeDesc) +
        '</p>',
    })
  );

  const staticPages = [
    {
      parts: ['families'],
      title: 'Families — ' + APP,
      description: 'Browse flowering-plant families in the encyclopedia.',
    },
    {
      parts: ['genera'],
      title: 'Genera — ' + APP,
      description: 'Browse flowering-plant genera in the encyclopedia.',
    },
    {
      parts: ['identify'],
      title: 'Identify — ' + APP,
      description: 'Identify a flower with the four-step key in the app.',
    },
    {
      parts: ['about'],
      title: 'About — ' + APP,
      description: 'About the plant encyclopedia What\'s that flower?',
    },
    {
      parts: ['help'],
      title: 'Help — ' + APP,
      description: 'Help for What\'s that flower?',
    },
  ];
  staticPages.forEach((page) => {
    const url = encodePath(page.parts);
    writePage(
      page.parts,
      inject(template, {
        title: page.title,
        description: page.description,
        url,
        noscript: '<h1>' + escapeHtml(page.title) + '</h1><p>' + escapeHtml(page.description) + '</p>',
      })
    );
  });

  const families = {};
  const genera = {};

  plants.forEach((header) => {
    const name = header.name;
    const text = byName[name] || {};
    const label = displayName(text.label, name);
    const title = label + ' (' + name + ') — ' + APP;
    const description = String(text.description || label + ' — botanical plate and notes in ' + APP).slice(
      0,
      240
    );
    const url = encodePath(['plant', name]);
    const image = plateUrl(header);
    const family = header.family || '';
    const genus = genusOf(name);
    if (family) families[family] = (families[family] || 0) + 1;
    if (genus) genera[genus] = (genera[genus] || 0) + 1;

    writePage(
      ['plant', name],
      inject(template, {
        title,
        description,
        url,
        image,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Taxon',
          name,
          alternateName: text.label || undefined,
          description,
          taxonRank: 'Species',
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
      })
    );
    urls.push(url);
  });

  Object.keys(families)
    .sort()
    .forEach((family) => {
      const url = encodePath(['family', family]);
      const n = families[family];
      const description =
        n === 1
          ? '1 plant in the family ' + family + '.'
          : n + ' plants in the family ' + family + '.';
      writePage(
        ['family', family],
        inject(template, {
          title: family + ' — ' + APP,
          description,
          url,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Taxon',
            name: family,
            taxonRank: 'Family',
            url,
          },
          noscript: '<h1>' + escapeHtml(family) + '</h1><p>' + escapeHtml(description) + '</p>',
        })
      );
      urls.push(url);
    });

  Object.keys(genera)
    .sort()
    .forEach((genus) => {
      const url = encodePath(['genus', genus]);
      const n = genera[genus];
      const description =
        n === 1 ? '1 plant in the genus ' + genus + '.' : n + ' plants in the genus ' + genus + '.';
      writePage(
        ['genus', genus],
        inject(template, {
          title: genus + ' — ' + APP,
          description,
          url,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Taxon',
            name: genus,
            taxonRank: 'Genus',
            url,
          },
          noscript: '<h1>' + escapeHtml(genus) + '</h1><p>' + escapeHtml(description) + '</p>',
        })
      );
      urls.push(url);
    });

  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemapXml(urls));
  console.log(
    'seo pages',
    plants.length,
    'plants',
    Object.keys(families).length,
    'families',
    Object.keys(genera).length,
    'genera',
    'sitemap',
    urls.length
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
