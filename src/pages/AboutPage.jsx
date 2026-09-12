import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadPlant, photoUrl } from '../api';
import Footer from '../components/Footer';
import PlateImage from '../components/PlateImage';
import StoreLinks from '../components/StoreLinks';
import languages from '../languages';
import { INDEXED_LANGS, plantPath, withLang, writeLangCookie } from '../lib';

const ABOUT_PLANT = 'Bellis perennis';
const ALSO_LANGS = ['es', 'it', 'pt', 'ja', 'nl', 'hu'];
const SUPPORT_EMAIL = 'support@whatsthatflower.com';
const CREDITS = [
  { name: 'Lucia Kleinová', codes: ['es'] },
  { name: 'Janka Benková Marcelliová', codes: ['pt', 'en'] },
  { name: 'Éric Verna', codes: ['fr'] },
  { name: 'Christian Wyniger', codes: ['de'] },
  { name: 'Marius Grama', codes: ['ro'] },
  { name: 'Ladislav Petro', codes: ['hu'] },
  { name: 'Dawid Zieliński', codes: ['pl'] },
  { name: 'Marco Schmidt, Chiara Naruli', codes: ['it'] },
  { name: 'Alex Metry', codes: ['ar'] },
  { name: 'Swati Arora', codes: ['hi', 'pa'] },
];

export default function AboutPage({ lang, t, headers }) {
  const [plant, setPlant] = useState(null);
  const langCount = Object.keys(languages).length;
  const officialCount = INDEXED_LANGS.length;
  const moreCount = Math.max(0, langCount - officialCount - ALSO_LANGS.length);

  useEffect(() => {
    document.title = `${t.about} — ${t.app_name}`;
    const desc = t.seo_about || t.about_lede;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', desc);
  }, [t]);

  useEffect(() => {
    let live = true;
    loadPlant(ABOUT_PLANT)
      .then((data) => {
        if (live && data && data.name) setPlant(data);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const photos = (plant && plant.photoUrls) || [];
  const plateRel = (plant && plant.illustrationUrl) || '';
  const toPlant = plantPath(ABOUT_PLANT, lang);

  return (
    <div className="page">
      <div className="about-hero">
        <h1 className="common">{t.about_headline}</h1>
        <p className="lede">{t.about_lede}</p>
      </div>

      <div className="facts about-facts">
        <div className="fact">
          <div className="k">{t.about_fact_collection}</div>
          <div className="v">{headers && headers.length ? headers.length.toLocaleString(lang) : '—'}</div>
        </div>
        <div className="fact">
          <div className="k">{t.about_fact_languages}</div>
          <div className="v">{langCount.toLocaleString(lang)}</div>
        </div>
        <div className="fact">
          <div className="k">{t.about_fact_body}</div>
          <div className="v">{officialCount.toLocaleString(lang)}</div>
        </div>
        <div className="fact">
          <div className="k">{t.about_fact_key}</div>
          <div className="v">{t.about_fact_steps}</div>
        </div>
      </div>

      <section className="spread">
        <div className="plate">
          {plateRel ? (
            <Link to={toPlant}>
              <PlateImage
                rel={plateRel}
                preferred="master"
                sizes="(max-width: 860px) 92vw, 46vw"
                alt={t.plate_alt(ABOUT_PLANT)}
              />
            </Link>
          ) : null}
          <div className="cap">{t.illustration}</div>
        </div>
        <div className="copy about-copy">
          <div className="kicker">{t.about_why_kicker}</div>
          <h2 className="common">{t.about_why_title}</h2>
          <p>{t.about_why_p1()}</p>
          <p>{t.about_why_p2}</p>
          <p>{t.about_why_p3}</p>
          {photos.length ? (
            <div className="about-photos">
              {photos.slice(0, 3).map((rel) => (
                <Link key={rel} to={toPlant}>
                  <img src={photoUrl(rel)} alt={t.plate_alt(ABOUT_PLANT)} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="band">
        <div className="band-h">
          <h2>{t.about_how_title}</h2>
          <p>{t.about_how_lede}</p>
        </div>
        <div className="tiles">
          <div className="tile">
            <div className="kicker">{t.illustration}</div>
            <b>{t.about_tile_plate_t}</b>
            <span>{t.about_tile_plate_d}</span>
          </div>
          <div className="tile">
            <div className="kicker">{t.in_the_field}</div>
            <b>{t.about_tile_photo_t}</b>
            <span>{t.about_tile_photo_d}</span>
          </div>
          <div className="tile">
            <div className="kicker">{t.about_fact_key}</div>
            <b>{t.about_tile_text_t}</b>
            <span>{t.about_tile_text_d}</span>
          </div>
          <div className="tile">
            <div className="kicker">{t.distribution}</div>
            <b>{t.about_tile_map_t}</b>
            <span>{t.about_tile_map_d}</span>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-h">
          <h2>{t.about_langs_title}</h2>
          <p>{t.about_langs_lede(langCount)}</p>
        </div>
        <div className="kicker langs-label">{t.about_langs_official}</div>
        <div className="langs">
          {INDEXED_LANGS.map((code) => (
            <LangChip key={code} code={code} current={lang} official />
          ))}
        </div>
        <div className="kicker langs-label-more">
          {t.about_langs_also}
        </div>
        <div className="langs">
          {ALSO_LANGS.map((code) => (
            <LangChip key={code} code={code} current={lang} />
          ))}
          {moreCount ? <span className="lang-chip">{t.about_langs_more(moreCount)}</span> : null}
        </div>
        <aside className="note">
          <div className="k">{t.about_names_k}</div>
          <p>{t.about_names_note}</p>
        </aside>
      </section>

      <section className="band">
        <div className="band-h">
          <h2>{t.sources}</h2>
          <p>{t.about_sources_intro}</p>
        </div>
        <div className="bib">
          <div>
            <h3>{t.sources_name}</h3>
            <ul>
              <li>
                <a href="https://wcvp.science.kew.org/">World Checklist of Vascular Plants</a>
                <span className="sub">{t.about_src_wcvp_sub}</span>
              </li>
              <li>
                <a href="https://www.wikidata.org/">Wikidata</a>
                <span className="sub">{t.about_src_wikidata_sub}</span>
              </li>
              <li>
                <a href="https://www.gbif.org/">GBIF</a>
                {' · '}
                <a href="https://gd.eppo.int/">EPPO</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>{t.sources_text}</h3>
            <ul>
              <li>
                <a href="https://en.wikipedia.org/">Wikipedia</a>
              </li>
              <li>
                <a href="https://pfaf.org/">Plants For A Future</a>
                {' · '}
                <a href="https://www.rhs.org.uk/">RHS</a>
              </li>
              <li>
                <a href="https://luontoportti.com/">Luontoportti</a>
                {' · '}
                <a href="https://www.missouriplants.com/">Missouri Plants</a>
              </li>
              <li>
                <a href="https://botany.cz/">BOTANY.cz</a>
                {' · '}
                <a href="https://www.wildflower.org/plants">Lady Bird Johnson Wildflower Center</a>
              </li>
              <li>
                {t.about_src_floras}
                <span className="sub">{t.about_src_floras_sub}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3>{t.sources_images}</h3>
            <ul>
              <li>{t.about_src_photos}</li>
              <li>
                <a href="https://commons.wikimedia.org/">Wikimedia Commons</a>
                <span className="sub">{t.about_src_commons_sub}</span>
              </li>
              <li>
                <a href="https://botanicalillustrations.org/">{t.about_src_plates}</a>
              </li>
              <li>
                {t.about_src_obs}
                <span className="sub">{t.about_src_obs_sub}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-h">
          <h2>{t.about_thanks_title}</h2>
          <p>{t.about_thanks_lede}</p>
        </div>
        <ul className="credits">
          {CREDITS.map((row) => (
            <li key={row.name}>
              {row.name}
              <span className="sub">
                {row.codes.map((code) => languages[code] || code).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="band identify-band">
        <h2>{t.get_the_app}</h2>
        <p className="lede">{t.about_app_lede}</p>
        <p>
          <Link to={withLang('/identify', lang)}>{t.about_identify_here}</Link>
        </p>
        <StoreLinks t={t} />
        <p className="about-contact">
          {t.about_contact}
          {': '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </section>

      <Footer lang={lang} t={t} extra={headers && headers.length ? t.plants_count(headers.length) : t.app_name} />
    </div>
  );
}

function LangChip({ code, current, official }) {
  return (
    <Link
      className={`lang-chip${official ? ' official' : ''}${code === current ? ' on' : ''}`}
      to={withLang('/about', code)}
      onClick={() => writeLangCookie(code)}
      aria-current={code === current ? 'page' : undefined}
    >
      {languages[code] || code}
    </Link>
  );
}
