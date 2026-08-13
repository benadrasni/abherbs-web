import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { familyIconUrl } from '../api';
import { countByFamily, familyPath } from '../lib';

export default function FamiliesPage({ lang, t, headers }) {
  useEffect(() => {
    document.title = `${t.families} — ${t.app_name}`;
  }, [t]);
  const families = useMemo(
    () => countByFamily(headers).sort((a, b) => a.name.localeCompare(b.name)),
    [headers]
  );

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">{t.flowering_plants}</div>
          <h1 className="common">{t.families}</h1>
        </div>
        <div className="muted">{families.length}</div>
      </div>
      <section className="band">
        <div className="tiles">
          {families.map((f) => (
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
      </section>
      <Footer lang={lang} t={t} />
    </div>
  );
}
