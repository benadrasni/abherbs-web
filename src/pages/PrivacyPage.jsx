import { useEffect, useState } from 'react';
import { allowAnalytics, analyticsState, refuseAnalytics, subscribeAnalytics } from '../analytics';
import Footer from '../components/Footer';

const APP_PRIVACY_URL =
  'https://storage.googleapis.com/abherbs-resources/misc/PrivacyPolicyofWhatsthatflower.htm';

export default function PrivacyPage({ lang, t }) {
  const [state, setState] = useState(analyticsState);

  useEffect(() => subscribeAnalytics(setState), []);

  useEffect(() => {
    document.title = `${t.privacy} — ${t.app_name}`;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', t.seo_privacy);
  }, [t]);

  return (
    <div className="page">
      <div className="wrap prose">
        <h1 className="common">{t.privacy}</h1>
        <p>
          {t.privacy_lead}{' '}
          <a href={APP_PRIVACY_URL} target="_blank" rel="noreferrer">{t.privacy_app_link}</a>
        </p>
        <h2>{t.privacy_analytics_title}</h2>
        <p>{t.privacy_analytics}</p>
        <h2>{t.privacy_choice_title}</h2>
        <p>{t.privacy_choice}</p>
        {state.ready ? <p>{state.on ? t.privacy_status_on : t.privacy_status_off}</p> : null}
        <div className="ga-actions">
          <button
            type="button"
            className="ga-choice"
            aria-pressed={state.ready && state.on}
            onClick={allowAnalytics}
          >
            {t.ga_allow}
          </button>
          <button
            type="button"
            className="ga-choice"
            aria-pressed={state.ready && !state.on}
            onClick={refuseAnalytics}
          >
            {t.ga_refuse}
          </button>
        </div>
        <h2>{t.privacy_lang_title}</h2>
        <p>{t.privacy_lang}</p>
        <p>
          {t.privacy_contact}{' '}
          <a href="mailto:support@whatsthatflower.com">support@whatsthatflower.com</a>
        </p>
      </div>
      <Footer lang={lang} t={t} />
    </div>
  );
}
