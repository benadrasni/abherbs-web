import React from 'react';
import { Link } from 'react-router-dom';
import { displayName } from '../lib';

export default function TaxonTile({ to, name, label, count, t, iconSrc, italicLatin }) {
  const common = label ? displayName(label) : '';
  return (
    <Link className={iconSrc ? 'tile tile-with-icon' : 'tile'} to={to}>
      {iconSrc ? (
        <img
          className="tile-icon"
          src={iconSrc}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.hidden = true;
          }}
        />
      ) : null}
      <span className="tile-copy">
        <b className={!common && italicLatin ? 'latin' : undefined}>{common || name}</b>
        {common ? <span className="latin">{name}</span> : null}
        <span>{t.plants_count(count)}</span>
      </span>
    </Link>
  );
}
