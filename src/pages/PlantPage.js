import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  loadObservations,
  loadPlant,
  loadPlantText,
  loadSynonyms,
  loadTaxonLabel,
  photoUrl,
} from '../api';
import Footer from '../components/Footer';
import Lightbox from '../components/Lightbox';
import {
  APP_STORE_URL,
  GBIF_TAXON,
  PLAY_URL,
  POWO_TAXON,
  countByCountry,
  countryName,
  displayName,
  familyPath,
  formatFlowering,
  formatHeight,
  formatObsWhen,
  genusOf,
  genusPath,
  parseApg,
  publicObservations,
  rankValue,
  toxicityLabel,
  withLang,
  youtubeId,
} from '../lib';

const SECTIONS = [
  ['inflorescence', 'inflorescence'],
  ['flower', 'flower'],
  ['fruit', 'fruit'],
  ['leaf', 'leaf'],
  ['stem', 'stem'],
  ['habitat', 'habitat'],
  ['toxicity', 'toxicity'],
  ['herbalism', 'herbalism'],
  ['trivia', 'trivia'],
];

export default function PlantPage({ lang, t, requestedName }) {
  const params = useParams();
  const name = decodeURIComponent(requestedName || params.name || '').replace(/_/g, ' ');
  const [plant, setPlant] = useState(null);
  const [text, setText] = useState(null);
  const [synonyms, setSynonyms] = useState([]);
  const [obs, setObs] = useState([]);
  const [familyCommon, setFamilyCommon] = useState('');
  const [error, setError] = useState('');
  const [light, setLight] = useState(null);

  useEffect(() => {
    let live = true;
    setPlant(null);
    setError('');
    if (!name) {
      setError('missing');
      return undefined;
    }
    Promise.all([
      loadPlant(name),
      loadPlantText(lang, name),
      loadSynonyms(name).catch(() => null),
      loadObservations(name).catch(() => null),
    ])
      .then(([p, tx, syn, rawObs]) => {
        if (!live) return;
        if (!p || !p.name) {
          setError('missing');
          return;
        }
        setPlant(p);
        setText(tx);
        setSynonyms((syn && syn.ipni) || []);
        setObs(publicObservations(rawObs));
        const family = rankValue(p.APGIV, 'Familia');
        if (family) {
          loadTaxonLabel(lang, family)
            .then((labels) => {
              if (live && Array.isArray(labels) && labels[0]) setFamilyCommon(labels[0]);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (live) setError('missing');
      });
    return () => {
      live = false;
    };
  }, [name, lang]);

  useEffect(() => {
    if (!text || !plant) return;
    const title = `${displayName(text.label, plant.name)} (${plant.name}) — ${t.app_name}`;
    document.title = title;
    const desc = text.description || t.app_short;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', desc.slice(0, 240));
  }, [text, plant, t]);

  const ranks = useMemo(() => parseApg(plant && plant.APGIV), [plant]);
  const family = plant ? rankValue(plant.APGIV, 'Familia') : '';
  const order = plant ? rankValue(plant.APGIV, 'Ordo') : '';
  const genus = plant ? rankValue(plant.APGIV, 'Genus') || genusOf(plant.name) : '';
  const countries = useMemo(() => countByCountry(obs, lang), [obs, lang]);
  const shownSyn = (() => {
    const fromPlant = ((plant && plant.synonyms) || []).filter(Boolean).map((s) => ({ name: s }));
    const fromIpni = synonyms.filter((s) => s && s.name && s.name !== name);
    const seen = new Set();
    const merged = [];
    fromPlant.concat(fromIpni).forEach((s) => {
      const key = `${s.name} ${s.suffix || ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(s);
    });
    return merged.slice(0, 3);
  })();
  const synonymTotal = ((plant && plant.synonyms) || []).length + synonyms.length;

  if (error === 'missing') {
    return (
      <div className="page">
        <p className="center-msg">{t.not_found}</p>
        <Footer lang={lang} t={t} />
      </div>
    );
  }
  if (!plant || !text) {
    return <p className="center-msg">{t.loading}</p>;
  }

  const photos = plant.photoUrls || [];
  const plate = plant.illustrationUrl ? photoUrl(plant.illustrationUrl) : '';
  const sources = []
    .concat(plant.sourceUrls || [])
    .concat(text.sourceUrls || [])
    .filter((u, i, arr) => u && arr.indexOf(u) === i);
  const video = (plant.videoUrls || []).map(youtubeId).filter(Boolean)[0];
  const wiki = text.wikipedia || (plant.wikilinks && plant.wikilinks.data);

  return (
    <div className="page">
      <div className="crumb">
        <Link to={withLang('/', lang)}>{t.plants}</Link>
        {order ? (
          <>
            {' · '}
            <span>{order}</span>
          </>
        ) : null}
        {family ? (
          <>
            {' · '}
            <Link to={familyPath(family, lang)}>{family}</Link>
          </>
        ) : null}
        {genus ? (
          <>
            {' · '}
            <Link to={genusPath(genus, lang)}>{genus}</Link>
          </>
        ) : null}
        {' · '}
        <span className="here latin">{plant.name}</span>
      </div>

      <section className="spread">
        <div className="plate">
          {plate ? (
            <button type="button" onClick={() => setLight({ src: plate, caption: t.illustration })}>
              <img src={plate} alt={t.plate_alt(plant.name)} />
            </button>
          ) : null}
          <div className="cap">{t.illustration}</div>
        </div>
        <div className="copy">
          <div className="kicker">
            {family}
            {family && order ? ' · ' : ''}
            {order}
          </div>
          <h1 className="common">{displayName(text.label, plant.name)}</h1>
          <div className="binomen latin">
            {plant.name} <span className="author">{plant.author || ''}</span>
          </div>
          {text.names && text.names.length ? (
            <div className="aka">
              {t.also_called} {text.names.slice(0, 4).join(', ')}
            </div>
          ) : null}
          <div className="facts">
            <div className="fact">
              <div className="k">{t.height}</div>
              <div className="v">{formatHeight(plant.heightFrom, plant.heightTo, lang) || '—'}</div>
            </div>
            <div className="fact">
              <div className="k">{t.flowering}</div>
              <div className="v">{formatFlowering(plant.floweringFrom, plant.floweringTo, lang) || '—'}</div>
            </div>
            <div className="fact">
              <div className="k">{t.toxicity}</div>
              <div className="v">{toxicityLabel(plant.toxicityClass, t)}</div>
            </div>
          </div>
          {text.description ? <p className="lede">{text.description}</p> : null}
          {SECTIONS.map(([key, copyKey]) =>
            text[key] ? (
              <div className="sec" key={key}>
                <div className="k">{t[copyKey] || copyKey}</div>
                <p>{text[key]}</p>
              </div>
            ) : null
          )}
        </div>
      </section>

      {photos.length ? (
        <section className="band">
          <div className="band-h">
            <h2>{t.in_the_field}</h2>
            <p>{t.in_the_field_lede}</p>
          </div>
          <div className="photos">
            {photos.map((rel, i) => {
              const src = photoUrl(rel);
              return (
                <figure key={rel}>
                  <button type="button" onClick={() => setLight({ src, caption: t.photo_n(i + 1, photos.length) })}>
                    <img src={src} alt="" />
                  </button>
                  <figcaption className="dark-cap">{t.photo_n(i + 1, photos.length)}</figcaption>
                </figure>
              );
            })}
          </div>
          {video ? (
            <div className="video">
              <div className="kicker" style={{ margin: '18px 0 8px' }}>{t.video}</div>
              <iframe
                title={plant.name}
                src={`https://www.youtube.com/embed/${video}`}
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="band">
        <div className="band-h">
          <h2>{t.classification}</h2>
          <p>{t.classification_lede}</p>
        </div>
        <div className="tax-grid">
          <div>
            <div className="path">
              {['Plantae', order, family, genus, plant.name].filter(Boolean).map((part, i) => {
                const isFamily = part === family && part !== plant.name;
                const isGenus = part === genus && part !== family && part !== plant.name;
                const isSpecies = part === plant.name;
                return (
                  <span key={`${part}-${i}`}>
                    {i ? ' · ' : null}
                    {isFamily ? (
                      <Link to={familyPath(family, lang)}>{family}</Link>
                    ) : isGenus ? (
                      <Link className="latin" to={genusPath(genus, lang)}>{genus}</Link>
                    ) : isSpecies ? (
                      <span className="latin">{plant.name}</span>
                    ) : (
                      part
                    )}
                  </span>
                );
              })}
            </div>
            <div className="ranks">
              {order ? (
                <div className="rank">
                  <div className="rk">{t.order}</div>
                  <div>{order}</div>
                </div>
              ) : null}
              {family ? (
                <div className="rank">
                  <div className="rk">{t.family}</div>
                  <div>
                    <Link to={familyPath(family, lang)}>{family}</Link>
                    {familyCommon ? ` · ${familyCommon}` : ''}
                  </div>
                </div>
              ) : null}
              {genus ? (
                <div className="rank">
                  <div className="rk">{t.genus}</div>
                  <div className="latin">
                    <Link to={genusPath(genus, lang)}>{genus}</Link>
                  </div>
                </div>
              ) : null}
              <div className="rank">
                <div className="rk">{t.species}</div>
                <div className="latin">
                  {plant.name} <span className="author">{plant.author || ''}</span>
                </div>
              </div>
              {shownSyn.map((s) => (
                <div className="rank" key={s.href || s.name}>
                  <div className="rk">{t.synonym}</div>
                  <div className="latin">
                    {s.name} {s.suffix || ''} {s.author || ''}
                  </div>
                </div>
              ))}
              {synonymTotal > shownSyn.length ? (
                <div className="rank">
                  <div className="rk" />
                  <div className="muted">{t.more_names(synonymTotal - shownSyn.length)}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>{t.authorities}</div>
            <div className="links">
              {plant.ipniId ? <a href={POWO_TAXON + plant.ipniId}>POWO</a> : null}
              {plant.ipniId ? <a href={POWO_TAXON + plant.ipniId}>IPNI {plant.ipniId}</a> : null}
              {plant.gbifId ? <a href={GBIF_TAXON + plant.gbifId}>GBIF {plant.gbifId}</a> : null}
              {plant.wikilinks && plant.wikilinks.data ? <a href={plant.wikilinks.data}>Wikidata</a> : null}
              {wiki ? <a href={wiki}>Wikipedia</a> : null}
            </div>
            {ranks.length ? (
              <details className="details">
                <summary>{t.show_ranks}</summary>
                {ranks.map((r) => (
                  <div className="rank-full" key={r.key}>
                    <div className="rk">{r.label}</div>
                    <div>{r.value}</div>
                  </div>
                ))}
              </details>
            ) : null}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-h">
          <h2>{t.seen_wild}</h2>
          <p>{t.seen_lede}</p>
        </div>
        <div className="seen">
          <div>
            {obs.length ? (
              <div className="obs">
                {obs.slice(0, 8).map((row) => {
                  const src = photoUrl(row.photoPaths[0]);
                  const when = formatObsWhen(row, lang);
                  const where = countryName(row.country, lang);
                  const cap = [when, where].filter(Boolean).join(' · ');
                  return (
                    <figure key={row.id}>
                      <button type="button" onClick={() => setLight({ src, caption: cap })}>
                        <img src={src} alt="" />
                      </button>
                      {cap ? <figcaption>{cap}</figcaption> : null}
                    </figure>
                  );
                })}
              </div>
            ) : (
              <p className="muted">{t.no_sightings}</p>
            )}
          </div>
          <aside className="aside">
            <h3>{t.public_records(obs.length)}</h3>
            <p>{t.seen_lede}</p>
            {countries.length ? (
              <ul className="places">
                {countries.map((c) => (
                  <li key={c.name}>
                    {c.name} <span>{c.count}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <a className="cta" href={PLAY_URL}>{t.record_in_app}</a>
          </aside>
        </div>
      </section>

      {(sources.length || true) ? (
        <section className="band">
          <div className="band-h">
            <h2>{t.sources}</h2>
          </div>
          <div className="links">
            {sources.map((href) => (
              <a key={href} href={href}>
                {prettyHost(href)}
              </a>
            ))}
            <a href={PLAY_URL}>Google Play</a>
            <a href={APP_STORE_URL}>App Store</a>
          </div>
        </section>
      ) : null}

      <Footer
        lang={lang}
        t={t}
        extra={
          sources.length
            ? `${t.sources}: ${[...new Set(sources.map(prettyHost))].slice(0, 3).join(' · ')}`
            : t.app_name
        }
      />
      <Lightbox src={light && light.src} caption={light && light.caption} onClose={() => setLight(null)} />
    </div>
  );
}

function prettyHost(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch (e) {
    return href;
  }
}
