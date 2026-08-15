import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function AboutPage({ lang, t, loc }) {
  useEffect(() => {
    document.title = `${t.about} — ${t.app_name}`;
  }, [t]);

  return (
    <div className="page">
      <div className="wrap prose">
        <h1 className="common">{t.about}</h1>
        <Block title={loc.about_purpose_title} html={loc.about_purpose_text} />
        <Block title={loc.about_sources_title} html={loc.about_sources_text} />
        <Block title={loc.about_credits_title} html={loc.about_credits_text} />
      </div>
      <Footer lang={lang} t={t} />
    </div>
  );
}

function Block({ title, html }) {
  if (!html) return null;
  return (
    <section>
      {title ? <h2>{title}</h2> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
