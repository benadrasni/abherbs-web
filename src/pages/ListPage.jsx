import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { labelAt, loadLanguageList, taxonLabel } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import {
  decodeRouteParam,
  genusMarksFromList,
  representativeOfGenus,
  headersForIds,
  plantIdsFromList,
  plantStatesFromList,
  plantYearsFromList,
  sourceLabel,
  withLang,
} from '../lib';

function withLabel(header, labels) {
  return { ...header, label: labelAt(labels, header.id) || '' };
}

export default function ListPage({ lang, t, headersById, labels, taxonomy }) {
  const params = useParams();
  const name = decodeRouteParam(params.name || '');
  const [raw, setRaw] = useState(undefined);

  useEffect(() => {
    let live = true;
    setRaw(undefined);
    loadLanguageList(lang, name)
      .then((data) => {
        if (live) setRaw(data && typeof data === 'object' ? data : null);
      });
    return () => {
      live = false;
    };
  }, [lang, name]);

  const items = useMemo(() => {
    const ids = plantIdsFromList(raw && raw.list);
    const years = plantYearsFromList(raw && raw.list);
    const states = plantStatesFromList(raw && raw.list);
    const genusMarks = genusMarksFromList(raw && raw.genera);
    const rows = [];
    headersForIds(ids, headersById).forEach((header) => {
      const base = withLabel(header, labels);
      const labelsForPlant = states[header.id] || [];
      if (labelsForPlant.length) {
        labelsForPlant.forEach((state) => rows.push({ ...base, state }));
        return;
      }
      rows.push({ ...base, year: years[header.id] });
    });
    genusMarks.forEach((mark) => {
      const plate = representativeOfGenus(mark.genus, headersById) || {};
      rows.push({
        genus: mark.genus,
        name: mark.genus,
        family: plate.family || '',
        illustrationUrl: plate.illustrationUrl || '',
        url: plate.url || '',
        label: taxonLabel(taxonomy, mark.genus),
        state: mark.state,
        year: mark.year,
      });
    });
    const speciesHaveStates = Object.keys(states).some((id) => states[id] && states[id].length);
    const speciesHaveYears = Object.keys(years).length > 0;
    const byState = speciesHaveStates || (genusMarks.some((mark) => mark.state) && !speciesHaveYears);
    const byYear = !byState && (speciesHaveYears || genusMarks.some((mark) => mark.year));
    rows.sort((a, b) => {
      if (byState) {
        const c = (a.state || '\uffff').localeCompare(b.state || '\uffff', lang);
        if (c) return c;
      } else if (byYear) {
        const c = (b.year || 0) - (a.year || 0);
        if (c) return c;
      }
      return (a.label || a.name).localeCompare(b.label || b.name, lang);
    });
    return rows;
  }, [raw, headersById, labels, lang, taxonomy]);

  useEffect(() => {
    document.title = name ? `${name} — ${t.app_name}` : t.app_name;
  }, [name, t.app_name]);

  const loaded = raw !== undefined;
  const sourceUrl = raw && typeof raw.sourceUrl === 'string' ? raw.sourceUrl.trim() : '';

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
          {sourceUrl ? (
            <a
              className="list-source"
              href={sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {sourceLabel(sourceUrl)}
            </a>
          ) : null}
        </div>
        <p className="lede" style={{ margin: 0 }}>
          {t.list_lede} {loaded ? t.plants_count(items.length) : ''}
        </p>
      </div>
      {items.length ? (
        <PlateGrid items={items} lang={lang} taxonomy={taxonomy} genusWord={t.genus} />
      ) : loaded ? (
        <p className="center-msg">{t.empty_list}</p>
      ) : null}
      <Footer lang={lang} t={t} />
    </div>
  );
}
