import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  distributionRel,
  loadObservations,
  loadPlant,
  loadPlantText,
  loadSynonyms,
  loadTaxonLabel,
  photoUrl,
  plateFiles,
} from '../api';
import PlateImage from '../components/PlateImage';
import Footer from '../components/Footer';
import Lightbox from '../components/Lightbox';
import RichPlantText from '../components/RichPlantText';
import StoreLinks from '../components/StoreLinks';
import {
  collectPlantSources,
  countByCountry,
  countryName,
  displayName,
  familyPath,
  formatFlowering,
  formatHeight,
  formatObsWhen,
  fullApgRanks,
  genusOf,
  genusPath,
  mergeSynonyms,
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
  const [mapFailed, setMapFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapSrc, setMapSrc] = useState('');

  useEffect(() => {
    let live = true;
    setPlant(null);
    setError('');
    setMapFailed(false);
    setMapReady(false);
    setMapSrc('');
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
    const desc = String(text.description || t.app_short).replace(/<\/?b>/g, '');
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', desc.slice(0, 240));
  }, [text, plant, t]);

  const ranks = useMemo(() => fullApgRanks(plant && plant.APGIV), [plant]);
  const family = plant ? rankValue(plant.APGIV, 'Familia') : '';
  const order = plant ? rankValue(plant.APGIV, 'Ordo') : '';
  const genus = plant ? rankValue(plant.APGIV, 'Genus') || genusOf(plant.name) : '';
  const countries = useMemo(() => countByCountry(obs, lang), [obs, lang]);
  const allSyn = useMemo(() => mergeSynonyms(plant, synonyms, name), [plant, synonyms, name]);
  const shownSyn = allSyn.slice(0, 2);
  const synonymRest = allSyn.slice(2);
  const groupedSources = useMemo(() => collectPlantSources(plant, text), [plant, text]);

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
  const plateRel = plant.illustrationUrl || '';
  const platePaths = plateFiles(plateRel);
  const plate = plateRel ? photoUrl(platePaths.master) : '';
  const plateLegacy = plateRel ? photoUrl(platePaths.legacy) : '';
  const distRel = distributionRel(plant);
  const distRemote = distRel ? photoUrl(distRel) : '';
  const distLocal = plant.name
    ? `/images/${String(plant.name).replace(/ /g, '_')}_distribution.webp`
    : '';
  const distSrc = mapSrc || distRemote;
  const showMap = Boolean(distSrc) && !mapFailed && mapReady;
  const probeMap = Boolean(distSrc) && !mapFailed;
  const sourceList = groupedSources.name.concat(groupedSources.text, groupedSources.images);
  const video = (plant.videoUrls || []).map(youtubeId).filter(Boolean)[0];

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
            <button type="button" onClick={() => setLight({ src: plate, fallbackSrc: plateLegacy, caption: t.illustration })}>
              <PlateImage
                rel={plateRel}
                preferred="master"
                sizes="(max-width: 860px) 92vw, 46vw"
                alt={t.plate_alt(plant.name)}
              />
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
              <div className="v ltr">{formatHeight(plant.heightFrom, plant.heightTo, lang) || '—'}</div>
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
          {text.description ? (
            <p className="lede">
              <RichPlantText value={text.description} />
            </p>
          ) : null}
          {SECTIONS.map(([key, copyKey]) =>
            text[key] ? (
              <div className="sec" key={key}>
                <div className="k">{t[copyKey] || copyKey}</div>
                <p>
                  <RichPlantText value={text[key]} />
                </p>
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
                    <img src={src} alt="" loading="lazy" />
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
        <div className={showMap ? 'tax-grid' : 'tax-grid no-map'}>
          <div className="tax-col">
            <div className="band-h">
              <h2>{t.classification}</h2>
              <p>{t.classification_lede}</p>
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
              {shownSyn.length ? (
                <div className="rank">
                  <div className="rk">{allSyn.length === 1 ? t.synonym : t.synonyms}</div>
                  <div>
                    <div className="syn-flow">
                      {shownSyn.map((s, i) => (
                        <span key={s.href || s.name}>
                          {i ? ', ' : null}
                          <SynonymName syn={s} />
                        </span>
                      ))}
                    </div>
                    {synonymRest.length ? (
                      <details className="more-names">
                        <summary>{t.more_names(synonymRest.length)}</summary>
                        <div className="syn-flow">
                          {synonymRest.map((s, i) => (
                            <span key={s.href || s.name}>
                              {i ? ', ' : null}
                              <SynonymName syn={s} />
                            </span>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            {ranks.length ? (
              <details className="details tax-ranks-full">
                <summary>{t.show_ranks}</summary>
                {ranks.map((r) => (
                  <div className="rank-full" key={r.key}>
                    <div className="rk">{fullRankLabel(r, t)}</div>
                    <div className={r.label === 'Genus' ? 'latin' : undefined}>
                      <FullRankValue rank={r} family={family} genus={genus} lang={lang} />
                    </div>
                  </div>
                ))}
                <div className="rank-full">
                  <div className="rk">{t.species}</div>
                  <div className="latin">
                    {plant.name} <span className="author">{plant.author || ''}</span>
                  </div>
                </div>
              </details>
            ) : null}
          </div>
          {probeMap ? (
            <div className={showMap ? 'dist-col' : 'dist-col dist-col-probe'}>
              {showMap ? (
                <div className="band-h">
                  <h2>{t.distribution}</h2>
                  <ul className="dist-legend">
                    <li>
                      <i className="swatch native" aria-hidden="true" />
                      {t.distribution_native}
                    </li>
                    <li>
                      <i className="swatch introduced" aria-hidden="true" />
                      {t.distribution_introduced}
                    </li>
                  </ul>
                </div>
              ) : null}
              <figure className="dist-map">
                <button
                  type="button"
                  onClick={() => setLight({ src: distSrc, caption: t.distribution })}
                >
                  <img
                    src={distSrc}
                    alt={t.distribution_alt(plant.name)}
                    onLoad={() => setMapReady(true)}
                    onError={() => {
                      setMapReady(false);
                      if (import.meta.env.DEV && distLocal && distSrc !== distLocal) {
                        setMapSrc(distLocal);
                      } else {
                        setMapFailed(true);
                      }
                    }}
                  />
                </button>
              </figure>
            </div>
          ) : null}
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
                        <img src={src} alt="" loading="lazy" />
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
            {countries.length ? (
              <ul className="places">
                {countries.map((c) => (
                  <li key={c.name}>
                    {c.name} <span>{c.count}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p>{t.record_in_app}</p>
            <StoreLinks t={t} />
          </aside>
        </div>
      </section>

      {sourceList.length ? (
        <section className="band">
          <div className="band-h">
            <h2>{t.sources}</h2>
            <p>{t.sources_lede}</p>
          </div>
          <div className="bib">
            <SourceColumn title={t.sources_name} items={groupedSources.name} t={t} />
            <SourceColumn title={t.sources_text} items={groupedSources.text} t={t} />
            <SourceColumn title={t.sources_images} items={groupedSources.images} t={t} />
          </div>
        </section>
      ) : null}

      <Footer
        lang={lang}
        t={t}
        extra={
          sourceList.length
            ? `${t.sources}: ${[...new Set(sourceList.map((s) => s.name))].slice(0, 3).join(' · ')}`
            : t.app_name
        }
      />
      <Lightbox
        src={light && light.src}
        fallbackSrc={light && light.fallbackSrc}
        caption={light && light.caption}
        onClose={() => setLight(null)}
      />
    </div>
  );
}

function SynonymName({ syn }) {
  const latin = [syn.name, syn.suffix].filter(Boolean).join(' ');
  return (
    <span className="ltr">
      <span className="latin">{latin}</span>
      {syn.author ? ` ${syn.author}` : ''}
    </span>
  );
}

function fullRankLabel(rank, t) {
  if (rank.label === 'Ordo') return t.order;
  if (rank.label === 'Familia') return t.family;
  if (rank.label === 'Genus') return t.genus;
  if (rank.label === 'Species') return t.species;
  return rank.label;
}

function FullRankValue({ rank, family, genus, lang }) {
  if (rank.label === 'Familia' && rank.value === family) {
    return <Link to={familyPath(family, lang)}>{rank.value}</Link>;
  }
  if (rank.label === 'Genus' && rank.value === genus) {
    return <Link to={genusPath(genus, lang)}>{rank.value}</Link>;
  }
  return rank.value;
}

function SourceColumn({ title, items, t }) {
  if (!items || !items.length) return null;
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.key || item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.name}
            </a>
            {item.detail ? <span className="sub">{item.detail}</span> : null}
            {!item.detail && item.kind === 'photographs' ? (
              <span className="sub">{t.sources_photographs}</span>
            ) : null}
            {!item.detail && item.kind === 'plate' ? <span className="sub">{t.sources_plate}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
