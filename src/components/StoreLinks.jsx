import { trackStore } from '../analytics';
import { APP_STORE_URL, PLAY_URL } from '../lib';

export default function StoreLinks({ t }) {
  return (
    <div className="stores stores-lg">
      <a href={PLAY_URL} onClick={() => trackStore('google_play')}>
        <img className="store-badge" src="/images/google-play-badge.png" alt={t.store_play} />
      </a>
      <a href={APP_STORE_URL} onClick={() => trackStore('app_store')}>
        <img className="store-badge store-badge-apple" src="/images/app-store-badge.svg" alt={t.store_apple} />
      </a>
    </div>
  );
}
