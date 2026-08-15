import React from 'react';
import { Link } from 'react-router-dom';
import { withLang } from '../lib';

export default function Footer({ lang, t, extra }) {
  return (
    <footer className="site-foot">
      <span>{extra || t.app_name}</span>
      <span>
        <Link to={withLang('/about', lang)}>{t.about}</Link>
        {' · '}
        <Link to={withLang('/help', lang)}>{t.help}</Link>
      </span>
    </footer>
  );
}
