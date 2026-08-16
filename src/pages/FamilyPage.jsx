import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { labelAt } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import { genusOf, withLang } from '../lib';

function withLabel(header, labels) {
  return { ...header, label: labelAt(labels, header.id) || '' };
}

export default function FamilyPage({ lang, t, headers, labels, mode }) {
  const params = useParams();
  const key = decodeURIComponent(mode === 'genus' ? params.genus : params.family);

  const raw = useMemo(() => {
    if (mode === 'genus') {
      return headers.filter((h) => genusOf(h.name) === key);
    }
    return headers.filter((h) => h.family === key);
  }, [headers, key, mode]);

  const items = useMemo(
    () =>
      raw
        .map((h) => withLabel(h, labels))
        .sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name, lang)),
    [raw, labels, lang]
  );

  useEffect(() => {
    document.title = `${key} — ${t.app_name}`;
  }, [key, t.app_name]);

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
        <PlateGrid items={items} lang={lang} genusLabel={mode === 'family'} />
      ) : (
        <p className="center-msg">{t.empty_taxon}</p>
      )}
      <Footer lang={lang} t={t} />
    </div>
  );
}
