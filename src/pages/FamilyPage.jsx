import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { labelAt, taxonNames } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import { displayName, genusOf, withLang } from '../lib';

function withLabel(header, labels) {
  return { ...header, label: labelAt(labels, header.id) || '' };
}

export default function FamilyPage({ lang, t, headers, labels, taxonomy, mode }) {
  const params = useParams();
  const key = decodeURIComponent(mode === 'genus' ? params.genus : params.family);
  const names = taxonNames(taxonomy, key).filter(
    (name) => name.toLocaleLowerCase() !== String(key).toLocaleLowerCase()
  );
  const label = names[0] || '';
  const also = names.slice(1);

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
    const title = label ? `${displayName(label)} (${key})` : key;
    document.title = `${title} — ${t.app_name}`;
  }, [key, label, t.app_name]);

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">
            <Link to={withLang(mode === 'genus' ? '/genera' : '/families', lang)}>{t.flowering_plants}</Link>
            {' · '}
            {mode === 'genus' ? t.genus : t.family}
          </div>
          <h1 className={!label && mode === 'genus' ? 'common latin' : 'common'}>
            {displayName(label, key)}
          </h1>
          {label ? <div className="binomen latin">{key}</div> : null}
          {also.length ? (
            <div className="aka">
              {t.also_called} {also.join(', ')}
            </div>
          ) : null}
        </div>
        <p className="lede" style={{ margin: 0 }}>
          {mode === 'genus' ? t.genus_lede : t.family_lede} {t.plants_count(raw.length)}
        </p>
      </div>
      {raw.length ? (
        <PlateGrid items={items} lang={lang} genusLabel={mode === 'family'} taxonomy={taxonomy} />
      ) : (
        <p className="center-msg">{t.empty_taxon}</p>
      )}
      <Footer lang={lang} t={t} />
    </div>
  );
}
