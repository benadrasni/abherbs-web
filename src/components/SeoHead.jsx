import { useEffect } from 'react';
import { INDEXED_LANGS, RTL, canonicalUrl, hreflangUrls } from '../lib';

function setLink(rel, href, hreflang) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    if (hreflang) tag.setAttribute('hreflang', hreflang);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function setMetaProperty(property, content) {
  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function SeoHead({ lang, pathname, search }) {
  useEffect(() => {
    const params = new URLSearchParams(search || '');
    const plant = params.get('plant');
    const path = plant ? `/plant/${plant}` : pathname;
    const indexed = INDEXED_LANGS.includes(lang);
    const canon = canonicalUrl(path, indexed ? lang : 'en');
    setLink('canonical', canon);
    setMetaProperty('og:url', canon);

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    if (indexed) {
      const urls = hreflangUrls(path);
      Object.keys(urls).forEach((code) => setLink('alternate', urls[code], code));
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
  }, [lang, pathname, search]);

  return null;
}
