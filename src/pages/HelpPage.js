import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function HelpPage({ lang, t, loc }) {
  useEffect(() => {
    document.title = `${t.help} — ${t.app_name}`;
  }, [t]);

  const blocks = [1, 2, 3, 4, 5].map((n) => ({
    title: loc[`help${n}_title`],
    html: loc[`help${n}_text`],
  }));

  return (
    <div className="page">
      <div className="wrap prose">
        <h1 className="common">{t.help}</h1>
        <div className="video">
          <iframe
            title={t.help}
            src="https://www.youtube.com/embed/8xL7QMXT0WE"
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        {blocks.map((b) =>
          b.html ? (
            <section key={b.title}>
              <h2>{b.title}</h2>
              <ul dangerouslySetInnerHTML={{ __html: b.html }} />
            </section>
          ) : null
        )}
      </div>
      <Footer lang={lang} t={t} />
    </div>
  );
}
