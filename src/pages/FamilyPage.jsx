import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadCardExtras } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import { genusOf, withLang } from '../lib';

export default function FamilyPage({ lang, t, headers, mode }) {
  const params = useParams();
  const key = decodeURIComponent(mode === 'genus' ? params.genus : params.family);
  const [items, setItems] = useState([]);

  const raw = useMemo(() => {
    if (mode === 'genus') {
      return headers.filter((h) => genusOf(h.name) === key);
    }
    return headers.filter((h) => h.family === key);
  }, [headers, key, mode]);

  useEffect(() => {
    let live = true;
    document.title = `${key} — ${t.app_name}`;
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
  }, [raw, lang, key, t.app_name]);

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
        <PlateGrid items={items.length ? items : raw} lang={lang} genusLabel={mode === 'family'} />
      ) : (
        <p className="center-msg">{t.empty_taxon}</p>
      )}
      <Footer lang={lang} t={t} />
    </div>
  );
}
