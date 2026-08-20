import React, { useEffect, useMemo } from 'react';
import Footer from '../components/Footer';
import TaxonTile from '../components/TaxonTile';
import { taxonLabel } from '../api';
import { countByGenus, displayName, genusPath } from '../lib';

export default function GeneraPage({ lang, t, headers, taxonomy }) {
  useEffect(() => {
    document.title = `${t.genera} — ${t.app_name}`;
  }, [t]);
  const genera = useMemo(
    () =>
      countByGenus(headers).sort((a, b) =>
        displayName(taxonLabel(taxonomy, a.name), a.name).localeCompare(
          displayName(taxonLabel(taxonomy, b.name), b.name),
          lang
        )
      ),
    [headers, taxonomy, lang]
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
      </section>
      <Footer lang={lang} t={t} />
    </div>
  );
}
