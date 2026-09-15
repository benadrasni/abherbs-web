import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { labelAt, loadLanguageList } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import { headersForIds, plantIdsFromList, plantYearsFromList, withLang } from '../lib';

function withLabel(header, labels) {
  return { ...header, label: labelAt(labels, header.id) || '' };
}

export default function ListPage({ lang, t, headersById, labels, taxonomy }) {
  const params = useParams();
  const name = decodeURIComponent(params.name || '');
  const [raw, setRaw] = useState(undefined);

  useEffect(() => {
    let live = true;
    setRaw(undefined);
    loadLanguageList(lang, name)
      .then((data) => {
        if (live) setRaw(data && typeof data === 'object' ? data : null);
      })
      .catch(() => {
        if (live) setRaw(null);
      });
    return () => {
      live = false;
    };
  }, [lang, name]);

  const items = useMemo(() => {
    const ids = plantIdsFromList(raw && raw.list);
    const years = plantYearsFromList(raw && raw.list);
    const rows = headersForIds(ids, headersById).map((header) => ({
      ...withLabel(header, labels),
      year: years[header.id],
    }));
    const byYear = rows.some((row) => row.year);
    rows.sort((a, b) => {
      if (byYear) {
        const c = (b.year || 0) - (a.year || 0);
        if (c) return c;
      }
      return (a.label || a.name).localeCompare(b.label || b.name, lang);
    });
    return rows;
  }, [raw, headersById, labels, lang]);

  useEffect(() => {
    document.title = name ? `${name} — ${t.app_name}` : t.app_name;
  }, [name, t.app_name]);

  const loaded = raw !== undefined;

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">
            <Link to={withLang('/', lang)}>{t.plants}</Link>
            {' · '}
            {t.lists}
          </div>
          <h1 className="common">{name}</h1>
        </div>
        <p className="lede" style={{ margin: 0 }}>
          {t.list_lede} {loaded ? t.plants_count(items.length) : ''}
        </p>
      </div>
      {items.length ? (
        <PlateGrid items={items} lang={lang} taxonomy={taxonomy} />
      ) : loaded ? (
        <p className="center-msg">{t.empty_list}</p>
      ) : null}
      <Footer lang={lang} t={t} />
    </div>
  );
}
