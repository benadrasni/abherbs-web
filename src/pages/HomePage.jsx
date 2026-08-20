import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  familyIconUrl,
  idsFromSearchIndex,
  labelAt,
  loadSearchIndex,
  normalizeSearch,
  taxonLabel,
  taxonNames,
} from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import StoreLinks from '../components/StoreLinks';
import TaxonTile from '../components/TaxonTile';
import {
  countByFamily,
  countByGenus,
  displayName,
  familyPath,
  genusOf,
  genusPath,
  plantPath,
  sessionFeatured,
  withLang,
} from '../lib';

function taxonMatches(taxonomy, latin, needle) {
  return taxonMatchScore(taxonomy, latin, needle) < 99;
}

function taxonMatchScore(taxonomy, latin, needle) {
  if (!latin || !needle) return 99;
  const nLatin = normalizeSearch(latin);
  const names = taxonNames(taxonomy, latin).map((name) => normalizeSearch(name));
  if (nLatin === needle || names.includes(needle)) return 0;
  if (nLatin.startsWith(needle) || names.some((name) => name.startsWith(needle))) return 1;
  if (nLatin.includes(needle) || names.some((name) => name.includes(needle))) return 2;
  return 99;
}

export default function HomePage({ lang, t, headers, headersById, labels, taxonomy }) {
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

  const featuredBase = useMemo(() => sessionFeatured(headers), [headers]);
  const featured = useMemo(
    () => featuredBase.map((h) => ({ ...h, label: labelAt(labels, h.id) || '' })),
    [featuredBase, labels]
  );

  useEffect(() => {
    document.title = t.app_name;
  }, [t]);

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
          taxonMatches(taxonomy, h.family, needle) ||
          taxonMatches(taxonomy, genusOf(h.name), needle)
      )
      .slice(0, 12);

    const taxonHits = [];
    families.forEach((f) => {
      const score = taxonMatchScore(taxonomy, f.name, needle);
      if (score === 99) return;
      taxonHits.push({
        kind: 'family',
        name: f.name,
        label: taxonLabel(taxonomy, f.name),
        count: f.count,
        score,
      });
    });
    genera.forEach((g) => {
      const score = taxonMatchScore(taxonomy, g.name, needle);
      if (score === 99) return;
      taxonHits.push({
        kind: 'genus',
        name: g.name,
        label: taxonLabel(taxonomy, g.name),
        count: g.count,
        score,
      });
    });
    taxonHits.sort((a, b) => a.score - b.score || b.count - a.count);

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
          if (live) {
            const plants = merged.slice(0, 12).map((h) => ({
              ...h,
              kind: 'plant',
              label: labelAt(labels, h.id) || '',
            }));
            setHits(taxonHits.slice(0, 6).concat(plants).slice(0, 12));
          }
        })
        .catch(() => {
          if (live) {
            setHits(
              taxonHits.slice(0, 6).concat(local.map((h) => ({ ...h, kind: 'plant' }))).slice(0, 12)
            );
          }
        });
    }, 220);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [q, lang, headers, headersById, labels, taxonomy, families, genera]);

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
            hits.map((h) => {
              if (h.kind === 'family' || h.kind === 'genus') {
                const common = h.label ? displayName(h.label) : '';
                return (
                  <Link
                    key={`${h.kind}:${h.name}`}
                    className="result"
                    to={h.kind === 'family' ? familyPath(h.name, lang) : genusPath(h.name, lang)}
                  >
                    <span>
                      <b className={!common && h.kind === 'genus' ? 'latin' : undefined}>
                        {common || h.name}
                      </b>
                      {common ? <span className="latin"> {h.name}</span> : null}
                    </span>
                    <span className="muted">{h.kind === 'family' ? t.family : t.genus}</span>
                  </Link>
                );
              }
              const familyCommon = taxonLabel(taxonomy, h.family);
              return (
                <Link key={h.name} className="result" to={plantPath(h.name, lang)}>
                  <span>
                    <b>{h.label || h.name}</b>
                    <span className="latin"> {h.name}</span>
                  </span>
                  <span className="muted">{familyCommon ? displayName(familyCommon) : h.family}</span>
                </Link>
              );
            })
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
          <PlateGrid items={featured} lang={lang} taxonomy={taxonomy} />
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
              <TaxonTile
                key={f.name}
                to={familyPath(f.name, lang)}
                name={f.name}
                label={taxonLabel(taxonomy, f.name)}
                count={f.count}
                t={t}
                iconSrc={familyIconUrl(f.name)}
              />
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
              <TaxonTile
                key={g.name}
                to={genusPath(g.name, lang)}
                name={g.name}
                label={taxonLabel(taxonomy, g.name)}
                count={g.count}
                t={t}
                italicLatin
              />
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
