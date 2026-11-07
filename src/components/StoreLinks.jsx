import { trackStore } from '../analytics';
import { APP_STORE_URL, PLAY_URL } from '../lib';

export default function StoreLinks({
  t,
  playUrl = PLAY_URL,
  appStoreUrl = APP_STORE_URL,
  onStore = trackStore,
}) {
  return (
    <div className="stores stores-lg">
      <a href={playUrl} onClick={() => onStore('google_play')}>
        <img className="store-badge" src="/images/google-play-badge.png" alt={t.store_play} />
      </a>
      <a href={appStoreUrl} onClick={() => onStore('app_store')}>
        <img className="store-badge store-badge-apple" src="/images/app-store-badge.svg" alt={t.store_apple} />
      </a>
    </div>
  );
}
