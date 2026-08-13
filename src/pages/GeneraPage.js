import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { countByGenus, genusPath } from '../lib';

export default function GeneraPage({ lang, t, headers }) {
  useEffect(() => {
    document.title = `${t.genera} — ${t.app_name}`;
  }, [t]);
  const genera = useMemo(
    () => countByGenus(headers).sort((a, b) => a.name.localeCompare(b.name, 'la')),
    [headers]
  );

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">{t.flowering_plants}</div>
          <h1 className="common">{t.genera}</h1>
        </div>
        <div className="muted">{genera.length}</div>
      </div>
      <section className="band">
        <div className="tiles">
          {genera.map((g) => (
            <Link key={g.name} className="tile" to={genusPath(g.name, lang)}>
              <b className="latin">{g.name}</b>
              <span>{t.plants_count(g.count)}</span>
            </Link>
          ))}
        </div>
      </section>
      <Footer lang={lang} t={t} />
    </div>
  );
}
