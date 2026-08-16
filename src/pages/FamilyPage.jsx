import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { labelAt, loadCardExtras } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import { genusOf, withLang } from '../lib';

function withCatalogLabel(header, labels) {
  const label = labelAt(labels, header.id);
  return { ...header, label: label || '' };
}

export default function FamilyPage({ lang, t, headers, labels, fromCatalog, mode }) {
  const params = useParams();
  const key = decodeURIComponent(mode === 'genus' ? params.genus : params.family);
  const [items, setItems] = useState([]);

  const raw = useMemo(() => {
    if (mode === 'genus') {
      return headers.filter((h) => genusOf(h.name) === key);
    }
    return headers.filter((h) => h.family === key);
  }, [headers, key, mode]);

  const catalogItems = useMemo(() => {
    if (!fromCatalog) return null;
    return raw
      .map((h) => withCatalogLabel(h, labels))
      .sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name, lang));
  }, [fromCatalog, raw, labels, lang]);

  useEffect(() => {
    document.title = `${key} — ${t.app_name}`;
  }, [key, t.app_name]);

  useEffect(() => {
    if (fromCatalog) {
      setItems([]);
      return undefined;
    }
    let live = true;
    Promise.all(
      raw.map((h) =>
        loadCardExtras(lang, h.name)
          .then((extra) => ({ ...h, ...extra }))
          .catch(() => ({ ...h, label: h.name }))
      )
    ).then((rows) => {
      if (live) setItems(rows.sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name, lang)));
    });
    return () => {
      live = false;
    };
  }, [raw, lang, fromCatalog]);

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">
            <Link to={withLang(mode === 'genus' ? '/genera' : '/families', lang)}>{t.flowering_plants}</Link>
            {' · '}
            {mode === 'genus' ? t.genus : t.family}
          </div>
          <h1 className={mode === 'genus' ? 'common latin' : 'common'}>{key}</h1>
        </div>
        <p className="lede" style={{ margin: 0 }}>
          {mode === 'genus' ? t.genus_lede : t.family_lede} {t.plants_count(raw.length)}
        </p>
      </div>
      {raw.length ? (
        <PlateGrid
          items={catalogItems || (items.length ? items : raw)}
          lang={lang}
          genusLabel={mode === 'family'}
        />
      ) : (
        <p className="center-msg">{t.empty_taxon}</p>
      )}
      <Footer lang={lang} t={t} />
    </div>
  );
}
