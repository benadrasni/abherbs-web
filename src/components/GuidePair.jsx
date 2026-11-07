import { Link } from 'react-router-dom';
import { trackSister } from '../analytics';
import {
  MUSHROOM_APP_STORE_URL,
  MUSHROOM_PLAY_URL,
  mushroomIdentifyUrl,
  withLang,
} from '../lib';
import StoreLinks from './StoreLinks';

export default function GuidePair({ lang, t, place }) {
  return (
    <div className="guide-pair">
      <div className="guide-card">
        <h2>{t.get_the_app}</h2>
        <p className="lede">{t.get_lede}</p>
        <p className="guide-link">
          <Link to={withLang('/identify', lang)}>{t.about_identify_here}</Link>
        </p>
        <StoreLinks t={t} />
      </div>
      <div className="guide-card">
        <h2>{t.mushroom_app}</h2>
        <p className="lede">{t.mushroom_lede}</p>
        <p className="guide-link">
          <a href={mushroomIdentifyUrl(lang)} onClick={() => trackSister(place)}>{t.mushroom_open}</a>
        </p>
        <StoreLinks
          t={t}
          playUrl={MUSHROOM_PLAY_URL}
          appStoreUrl={MUSHROOM_APP_STORE_URL}
          onStore={(store) => trackSister(store, store === 'google_play' ? 'play.google.com' : 'apps.apple.com')}
        />
      </div>
    </div>
  );
}
