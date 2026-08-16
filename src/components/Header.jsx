import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import languages from '../languages';
import { normPath, withLang } from '../lib';

export default function Header({ lang, t, onLang }) {
  const pathname = normPath(useLocation().pathname);
  const nav = [
    { to: withLang('/', lang), label: t.plants, match: pathname === '/' || pathname.startsWith('/plant') || pathname.startsWith('/family') || pathname.startsWith('/genus') || pathname.startsWith('/genera') },
    { to: withLang('/identify', lang), label: t.identify, match: pathname === '/identify' },
    { to: withLang('/about', lang), label: t.about, match: pathname === '/about', optional: true },
  ];

  return (
    <header className="site-bar">
      <Link className="mark" to={withLang('/', lang)}>{t.app_name}</Link>
      <nav className="site-nav">
        {nav.map((item) => (
          <Link key={item.label} className={item.match ? 'on' : item.optional ? 'optional' : ''} to={item.to}>
            {item.label}
          </Link>
        ))}
        <select className="lang-select" value={lang} onChange={(e) => onLang(e.target.value)} aria-label={t.language}>
          {Object.keys(languages).map((code) => (
            <option key={code} value={code}>{languages[code]}</option>
          ))}
        </select>
      </nav>
    </header>
  );
}
