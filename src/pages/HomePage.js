import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { familyIconUrl, idsFromSearchIndex, loadCardExtras, loadLabel, loadSearchIndex, normalizeSearch } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import StoreLinks from '../components/StoreLinks';
import { FEATURED, countByFamily, countByGenus, familyPath, genusPath, plantPath, withLang } from '../lib';

export default function HomePage({ lang, t, headers, headersById }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);

  const families = useMemo(
    () => countByFamily(headers).sort((a, b) => b.count - a.count),
    [headers]
  );
  const genera = useMemo(
    () => countByGenus(headers).sort((a, b) => b.count - a.count),
    [headers]
  );

  const featuredBase = useMemo(() => {
    const byName = {};
    headers.forEach((h) => {
      byName[h.name] = h;
    });
    return FEATURED.map((n) => byName[n]).filter(Boolean);
  }, [headers]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let live = true;
    Promise.all(
      featuredBase.map((h) =>
        loadCardExtras(lang, h.name)
          .then((extra) => ({ ...h, ...extra }))
          .catch(() => ({ ...h, label: h.name }))
      )
    ).then((rows) => {
      if (live) setFeatured(rows);
    });
    return () => {
      live = false;
    };
  }, [featuredBase, lang]);

  useEffect(() => {
    document.title = t.app_name;
  }, [t]);

  useEffect(() => {
    loadSearchIndex(lang).catch(() => null);
    loadSearchIndex('la').catch(() => null);
  }, [lang]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      return undefined;
    }
    let live = true;
    const needle = normalizeSearch(query);
    const local = headers
      .filter(
        (h) =>
          normalizeSearch(h.name).includes(needle) ||
          (h.family && normalizeSearch(h.family).includes(needle))
      )
      .slice(0, 12);

    const timer = setTimeout(() => {
      Promise.all([loadSearchIndex(lang).catch(() => null), loadSearchIndex('la').catch(() => null)])
        .then(([named, latin]) => {
          if (!live) return;
          const fromIndex = [];
          const seenIds = new Set();
          idsFromSearchIndex(named, query)
            .concat(idsFromSearchIndex(latin, query))
            .forEach((id) => {
              if (seenIds.has(id)) return;
              seenIds.add(id);
              const h = headersById && headersById[id];
              if (h && h.name) fromIndex.push(h);
            });
          const merged = [];
          const seen = new Set();
          fromIndex.concat(local).forEach((h) => {
            if (!h || seen.has(h.name)) return;
            seen.add(h.name);
            merged.push(h);
          });
          Promise.all(
            merged.slice(0, 12).map((h) =>
              loadLabel(lang, h.name)
                .then((label) => ({ ...h, label: label || h.name }))
                .catch(() => ({ ...h, label: h.name }))
            )
          ).then((rows) => {
            if (live) setHits(rows);
          });
        })
        .catch(() => {
          if (live) setHits(local);
        });
    }, 220);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [q, lang, headers, headersById]);

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">{t.app_name}</div>
          <h1 className="common">{t.plants}</h1>
        </div>
        <div className="muted">{t.plants_count(headers.length)}</div>
      </div>

      <div className="search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search_placeholder}
          aria-label={t.search_placeholder}
        />
      </div>
      {q.trim().length >= 2 ? (
        <div className="results">
          {hits.length ? (
            hits.map((h) => (
              <Link key={h.name} className="result" to={plantPath(h.name, lang)}>
                <span>
                  <b>{h.label || h.name}</b>
                  <span className="latin"> {h.name}</span>
                </span>
                <span className="muted">{h.family}</span>
              </Link>
            ))
          ) : (
            <p className="muted">{t.search_empty}</p>
          )}
        </div>
      ) : null}

      {featured.length ? (
        <section className="band">
          <div className="band-h">
            <h2>{t.from_collection}</h2>
          </div>
          <PlateGrid items={featured} lang={lang} />
        </section>
      ) : null}

      <section className="band">
        <div className="band-h">
          <h2>{t.browse}</h2>
        </div>
        <div className="browse-block">
          <div className="band-h">
            <h3 className="kicker">{t.by_family}</h3>
            <Link to={withLang('/families', lang)}>{t.see_all}</Link>
          </div>
          <div className="tiles">
            {families.slice(0, 12).map((f) => (
              <Link key={f.name} className="tile tile-with-icon" to={familyPath(f.name, lang)}>
                <img
                  className="tile-icon"
                  src={familyIconUrl(f.name)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                  }}
                />
                <span className="tile-copy">
                  <b>{f.name}</b>
                  <span>{t.plants_count(f.count)}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="browse-block">
          <div className="band-h">
            <h3 className="kicker">{t.by_genus}</h3>
            <Link to={withLang('/genera', lang)}>{t.see_all_genera}</Link>
          </div>
          <div className="tiles">
            {genera.slice(0, 12).map((g) => (
              <Link key={g.name} className="tile" to={genusPath(g.name, lang)}>
                <b className="latin">{g.name}</b>
                <span>{t.plants_count(g.count)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band identify-band">
        <h2>{t.get_the_app}</h2>
        <p className="lede">{t.get_lede}</p>
        <StoreLinks t={t} />
      </section>

      <Footer lang={lang} t={t} extra={t.plants_count(headers.length)} />
    </div>
  );
}
