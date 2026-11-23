import { useEffect, useMemo } from 'react';
import Footer from '../components/Footer';
import TaxonTile from '../components/TaxonTile';
import { taxonLabel } from '../api';
import { catalogHold, countByGenus, displayName, genusPath } from '../lib';

export default function GeneraPage({ lang, t, headers, taxonomy, status }) {
  useEffect(() => {
    document.title = `${t.genera} — ${t.app_name}`;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    if (t.seo_genera) tag.setAttribute('content', t.seo_genera);
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
  const hold = catalogHold(status, t);

  return (
    <div className="page">
      <div className="home-hero">
        <div>
          <div className="kicker">{t.flowering_plants}</div>
          <h1 className="common">{t.genera}</h1>
        </div>
        <div className="muted">{hold ?? genera.length}</div>
      </div>
      <div className={hold ? 'pending-slot' : undefined}>
        {hold ? (
          <p className="center-msg">{hold}</p>
        ) : (
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
        )}
      </div>
      <Footer lang={lang} t={t} />
    </div>
  );
}
