import { Link } from 'react-router-dom';
import { trackSister } from '../analytics';
import { mushroomUrl, withLang } from '../lib';

export default function Footer({ lang, t, extra }) {
  return (
    <footer className="site-foot">
      <span>{extra || t.app_name}</span>
      <span>
        <Link to={withLang('/identify', lang)}>{t.identify}</Link>
        {' · '}
        <Link to={withLang('/about', lang)}>{t.about}</Link>
        {' · '}
        <Link to={withLang('/help', lang)}>{t.help}</Link>
        {' · '}
        <Link to={withLang('/privacy', lang)}>{t.privacy}</Link>
        {' · '}
        <a href={mushroomUrl(lang)} onClick={() => trackSister('footer')}>{t.sister_site}</a>
      </span>
    </footer>
  );
}
