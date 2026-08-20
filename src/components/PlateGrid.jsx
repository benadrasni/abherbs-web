import React from 'react';
import { Link } from 'react-router-dom';
import PlateImage from './PlateImage';
import { taxonLabel } from '../api';
import { displayName, genusOf, headerPlateRel, plantPath } from '../lib';

export default function PlateGrid({ items, lang, genusLabel, taxonomy }) {
  return (
    <div className="grid">
      {items.map((item) => {
        const taxon = genusLabel ? genusOf(item.name) : item.family;
        const common = taxonLabel(taxonomy, taxon);
        return (
          <Link key={item.name} className="cell" to={plantPath(item.name, lang)}>
            <div className="art">
              <PlateImage rel={headerPlateRel(item)} preferred="grid" alt="" />
            </div>
            <div className="n">{displayName(item.label, item.name)}</div>
            <div className="l latin">{item.name}</div>
            <div className="g">{common ? displayName(common) : taxon}</div>
          </Link>
        );
      })}
    </div>
  );
}
