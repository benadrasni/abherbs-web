import React from 'react';
import { Link } from 'react-router-dom';
import PlateImage from './PlateImage';
import { taxonLabel } from '../api';
import { displayName, genusOf, headerPlateRel, listPath, plantPath } from '../lib';

export function PlateCell({ item, lang, genusLabel, taxonomy }) {
  const taxon = genusLabel ? genusOf(item.name) : item.family;
  const common = taxonLabel(taxonomy, taxon);
  return (
    <Link className="cell" to={plantPath(item.name, lang)}>
      <div className="art">
        <PlateImage rel={headerPlateRel(item)} preferred="grid" alt="" />
      </div>
      <div className="n">{displayName(item.label, item.name)}</div>
      <div className="l latin">{item.name}</div>
      <div className="g">{common ? displayName(common) : taxon}</div>
    </Link>
  );
}

export function ListCell({ list, lang, t }) {
  const cover = list && list.cover;
  return (
    <Link className="cell" to={listPath(list.name, lang)}>
      <div className="art">
        {cover ? <PlateImage rel={headerPlateRel(cover)} preferred="grid" alt="" /> : null}
      </div>
      <div className="n">{list.name}</div>
      <div className="g">{t.plants_count(list.count)}</div>
    </Link>
  );
}

export default function PlateGrid({ items, lang, genusLabel, taxonomy }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <PlateCell
          key={item.name}
          item={item}
          lang={lang}
          genusLabel={genusLabel}
          taxonomy={taxonomy}
        />
      ))}
    </div>
  );
}
