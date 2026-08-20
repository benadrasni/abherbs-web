import React, { useEffect, useMemo } from 'react';
import Footer from '../components/Footer';
import TaxonTile from '../components/TaxonTile';
import { familyIconUrl, taxonLabel } from '../api';
import { countByFamily, displayName, familyPath } from '../lib';

export default function FamiliesPage({ lang, t, headers, taxonomy }) {
  useEffect(() => {
    document.title = `${t.families} — ${t.app_name}`;
  }, [t]);
  const families = useMemo(
    () =>
      countByFamily(headers).sort((a, b) =>
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
          <h1 className="common">{t.families}</h1>
        </div>
        <div className="muted">{families.length}</div>
      </div>
      <section className="band">
        <div className="tiles">
          {families.map((f) => (
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
      </section>
      <Footer lang={lang} t={t} />
    </div>
  );
}
