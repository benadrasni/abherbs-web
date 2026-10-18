import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { labelAt, loadFilterHeaders } from '../api';
import Footer from '../components/Footer';
import PlateGrid from '../components/PlateGrid';
import StoreLinks from '../components/StoreLinks';
import { HabitatGlyph, PetalGlyph } from '../identify-glyphs.jsx';
import {
  COLORS,
  FEATURED_REGIONS,
  HABITATS,
  PETALS,
  REGION_GROUPS,
  attachFilters,
  labelKeyFor,
  optionCounts,
  parseSelection,
  plantMatches,
  selectionActive,
  selectionQuery,
} from '../identify.mjs';
import { catalogHold } from '../lib';

const FEATURED = new Set(FEATURED_REGIONS);

function sentenceStart(text, lang) {
  const value = String(text || '');
  if (!value) return value;
  const first = value.charAt(0);
  const upper = first.toLocaleUpperCase(lang || 'en');
  if (upper === first) return value;
  return upper + value.slice(1);
}

function choiceName(axis, id, t, lang) {
  const key = labelKeyFor(axis, id);
  return key ? sentenceStart(t[key], lang) : '';
}

function chipLabel(axis, id, t, lang) {
  const name = choiceName(axis, id, t, lang);
  if (axis !== 'petal' || id === '4') return name;
  const trail = t.guide_petal_trail || '{name} petals';
  return trail.replaceAll('{name}', name);
}

export default function IdentifyPage({ lang, t, headers, labels, taxonomy, status }) {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const selection = useMemo(() => parseSelection(new URLSearchParams(query)), [query]);
  const active = selectionActive(selection);
  const [filters, setFilters] = useState({ status: 'loading', raw: null });
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionAll, setRegionAll] = useState(false);
  const filtersRef = useRef(null);

  useEffect(() => {
    document.title = `${t.identify} — ${t.app_name}`;
    const desc = t.seo_identify;
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
    loadFilterHeaders()
      .then((raw) => {
        if (live) setFilters({ status: 'ready', raw });
      })
      .catch(() => {
        if (live) setFilters({ status: 'error', raw: null });
      });
    return () => {
      live = false;
    };
  }, []);

  const plants = useMemo(() => {
    if (status !== 'ready' || filters.status !== 'ready') return [];
    return attachFilters(headers || [], filters.raw).map((header) => ({
      ...header,
      label: labelAt(labels, header.id) || '',
    }));
  }, [status, filters, headers, labels]);

  const matches = useMemo(() => {
    const list = plants.filter((plant) => plantMatches(plant, selection));
    list.sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name, lang || 'en'));
    return list;
  }, [plants, selection, lang]);

  const colorCounts = useMemo(() => optionCounts(plants, selection, 'color'), [plants, selection]);
  const habitatCounts = useMemo(() => optionCounts(plants, selection, 'habitat'), [plants, selection]);
  const petalCounts = useMemo(() => optionCounts(plants, selection, 'petal'), [plants, selection]);
  const regionCounts = useMemo(() => optionCounts(plants, selection, 'region'), [plants, selection]);
  const anyRegionCount = useMemo(() => {
    const open = { ...selection, region: '' };
    return plants.filter((plant) => plantMatches(plant, open)).length;
  }, [plants, selection]);

  const hold =
    catalogHold(status, t) ||
    (filters.status === 'loading' ? t.loading : filters.status === 'error' ? t.catalog_unavailable : null);

  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return undefined;
    let frame = 0;
    const fit = () => {
      if (window.matchMedia('(max-width: 960px)').matches) {
        el.style.maxHeight = '';
        return;
      }
      const root = getComputedStyle(document.documentElement);
      const banner = parseFloat(root.getPropertyValue('--ga-banner-h')) || 0;
      const bar = parseFloat(root.getPropertyValue('--bar-h')) || 0;
      const origin = Math.max(el.getBoundingClientRect().top, bar);
      const available = window.innerHeight - origin - banner;
      const px = Math.max(160, Math.floor(available));
      const current = parseFloat(el.style.maxHeight) || 0;
      if (Math.abs(current - px) > 2) el.style.maxHeight = px + 'px';
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
      observer.disconnect();
      el.style.maxHeight = '';
    };
  }, [hold]);

  function write(patch) {
    setParams((prev) => selectionQuery({ ...parseSelection(prev), ...patch }), { replace: true });
  }

  function toggle(axis, id) {
    setParams((prev) => {
      const current = parseSelection(prev);
      return selectionQuery({ ...current, [axis]: current[axis] === id ? '' : id });
    }, { replace: true });
  }

  function clearAxis(axis) {
    setParams((prev) => {
      const current = parseSelection(prev);
      if (!current[axis]) return prev;
      return selectionQuery({ ...current, [axis]: '' });
    }, { replace: true });
  }

  function toggleRegions() {
    setRegionOpen((open) => {
      if (open) {
        setRegionAll(false);
        return false;
      }
      setRegionAll(Boolean(selection.region) && !FEATURED.has(selection.region));
      return true;
    });
  }

  function pickRegion(id) {
    setParams((prev) => {
      const current = parseSelection(prev);
      return selectionQuery({ ...current, region: current.region === id ? '' : id });
    }, { replace: true });
    setRegionOpen(false);
    setRegionAll(false);
  }

  function regionShown(id) {
    return selection.region === id || (regionCounts[id] || 0) > 0;
  }

  const chips = ['color', 'habitat', 'petal']
    .filter((axis) => selection[axis])
    .map((axis) => ({
      axis,
      name: chipLabel(axis, selection[axis], t, lang),
    }));

  return (
    <div className="page identify-page">
      <div className="home-hero identify-hero">
        <div>
          <h1 className="common">{t.identify}</h1>
        </div>
        <p className="lede">{t.identify_lede}</p>
      </div>

      {hold ? (
        <p className="center-msg">{hold}</p>
      ) : (
        <div className="identify-split">
          <div className="identify-filters" ref={filtersRef}>
            <fieldset>
              <legend>{t.guide_color_question}</legend>
              <div className="swatches" role="group">
                {COLORS.map((color) => {
                  const count = colorCounts[color.id] || 0;
                  const on = selection.color === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={on ? 'swatch-btn on' : 'swatch-btn'}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => toggle('color', color.id)}
                    >
                      <span className={'swatch-disk c' + color.id} />
                      <span className="lbl">{sentenceStart(t[color.labelKey], lang)}</span>
                      <span className="num">{count.toLocaleString(lang || 'en')}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend>{t.guide_habitat_question}</legend>
              <button
                type="button"
                className={selection.habitat ? 'any-btn' : 'any-btn on'}
                aria-pressed={!selection.habitat}
                onClick={() => clearAxis('habitat')}
              >
                {t.identify_any_habitat}
              </button>
              <div className="habitat-grid">
                {HABITATS.map((habitat) => {
                  const count = habitatCounts[habitat.id] || 0;
                  const on = selection.habitat === habitat.id;
                  return (
                    <button
                      key={habitat.id}
                      type="button"
                      className={on ? 'habitat-tile on' : 'habitat-tile'}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => toggle('habitat', habitat.id)}
                    >
                      <span className="tile-top">
                        <HabitatGlyph id={habitat.id} />
                        <span className="num">{count.toLocaleString(lang || 'en')}</span>
                      </span>
                      <span className="lbl">{sentenceStart(t[habitat.labelKey], lang)}</span>
                      <span className="ex">{t[habitat.examplesKey]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend>{t.guide_petal_question}</legend>
              <p className="key-note">{t.guide_petal_hint}</p>
              <div className="petal-grid">
                {PETALS.map((petal) => {
                  const count = petalCounts[petal.id] || 0;
                  const on = selection.petal === petal.id;
                  return (
                    <button
                      key={petal.id}
                      type="button"
                      className={on ? 'petal-tile on' : 'petal-tile'}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => toggle('petal', petal.id)}
                    >
                      <PetalGlyph id={petal.id} />
                      <span className="lbl">{sentenceStart(t[petal.labelKey], lang)}</span>
                      <span className="num">{count.toLocaleString(lang || 'en')}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="identify-stores">
              <StoreLinks t={t} />
            </div>
          </div>

          <section className="identify-results" id="identify-results" aria-labelledby="identify-count">
            <div className="identify-results-h">
              <p id="identify-count" aria-live="polite">
                {t.plants_count(matches.length)}
              </p>
              <div className="identify-results-row">
                <button
                  type="button"
                  className={selection.region ? 'region-toggle on' : 'region-toggle'}
                  aria-expanded={regionOpen}
                  aria-controls="identify-region-panel"
                  onClick={toggleRegions}
                >
                  {selection.region ? choiceName('region', selection.region, t, lang) : t.guide_any_region}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {active ? (
                  <div className="key-chips">
                    {chips.map((chip) => (
                      <button key={chip.axis} type="button" className="chip on" onClick={() => clearAxis(chip.axis)}>
                        {chip.name}
                        <span aria-hidden="true"> ×</span>
                      </button>
                    ))}
                    <button type="button" className="any-btn" onClick={() => write({ color: '', habitat: '', petal: '', region: '' })}>
                      {t.identify_start_over}
                    </button>
                  </div>
                ) : null}
              </div>
              {regionOpen ? (
                <div className="region-panel" id="identify-region-panel">
                  <h2>{t.guide_region_title}</h2>
                  <p className="key-note">{t.guide_region_body_plain}</p>
                  <div role="radiogroup" aria-label={t.guide_region_title}>
                    <button
                      type="button"
                      role="radio"
                      className="region-row"
                      aria-checked={!selection.region}
                      onClick={() => pickRegion('')}
                    >
                      <span className="radio" aria-hidden="true" />
                      <span className="lbl">{t.guide_any_region}</span>
                      <span className="num">{anyRegionCount.toLocaleString(lang || 'en')}</span>
                    </button>
                    {regionAll
                      ? REGION_GROUPS.map((group) => {
                          const regions = group.regions.filter(([id]) => regionShown(id));
                          if (!regions.length) return null;
                          return (
                            <div className="region-group" key={group.labelKey}>
                              <h3>{sentenceStart(t[group.labelKey], lang)}</h3>
                              {regions.map(([id]) => {
                                const count = regionCounts[id] || 0;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    role="radio"
                                    className="region-row"
                                    aria-checked={selection.region === id}
                                    onClick={() => pickRegion(id)}
                                  >
                                    <span className="radio" aria-hidden="true" />
                                    <span className="lbl">{choiceName('region', id, t, lang)}</span>
                                    <span className="num">{count.toLocaleString(lang || 'en')}</span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })
                      : FEATURED_REGIONS.filter(regionShown).map((id) => {
                          const count = regionCounts[id] || 0;
                          return (
                            <button
                              key={id}
                              type="button"
                              role="radio"
                              className="region-row"
                              aria-checked={selection.region === id}
                              onClick={() => pickRegion(id)}
                            >
                              <span className="radio" aria-hidden="true" />
                              <span className="lbl">{choiceName('region', id, t, lang)}</span>
                              <span className="num">{count.toLocaleString(lang || 'en')}</span>
                            </button>
                          );
                        })}
                  </div>
                  {regionAll ? null : (
                    <button type="button" className="region-all" onClick={() => setRegionAll(true)}>
                      {t.guide_all_regions}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
            {matches.length ? (
              <PlateGrid items={matches} lang={lang} taxonomy={taxonomy} />
            ) : (
              <p className="center-msg">{t.snack_no_flowers}</p>
            )}
          </section>
        </div>
      )}

      {!hold ? (
        <a className="identify-dock" href="#identify-results">
          {t.plants_count(matches.length)}
        </a>
      ) : null}

      <Footer lang={lang} t={t} />
    </div>
  );
}
