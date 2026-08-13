import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import StoreLinks from '../components/StoreLinks';
import { withLang } from '../lib';

export default function IdentifyPage({ lang, t }) {
  useEffect(() => {
    document.title = `${t.identify} — ${t.app_name}`;
  }, [t]);

  const steps = [t.identify_step_1, t.identify_step_2, t.identify_step_3, t.identify_step_4];

  return (
    <div className="page">
      <div className="identify">
        <div className="kicker">{t.app_name}</div>
        <h1 className="common">{t.get_the_app}</h1>
        <p className="lede">{t.get_lede}</p>
        <ol className="identify-steps">
          {steps.map((step, i) => (
            <li key={step}>
              <span className="kicker">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="muted">{t.identify_then}</p>
        <StoreLinks t={t} />
        <p>
          <Link to={withLang('/', lang)}>{t.browse_plants}</Link>
        </p>
      </div>
      <Footer lang={lang} t={t} />
    </div>
  );
}
