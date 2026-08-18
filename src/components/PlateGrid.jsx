import React from 'react';
import { Link } from 'react-router-dom';
import PlateImage from './PlateImage';
import { displayName, headerPlateRel, plantPath } from '../lib';

export default function PlateGrid({ items, lang, genusLabel }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <Link key={item.name} className="cell" to={plantPath(item.name, lang)}>
          <div className="art">
            <PlateImage rel={headerPlateRel(item)} preferred="grid" alt="" />
          </div>
          <div className="n">{displayName(item.label, item.name)}</div>
          <div className="l latin">{item.name}</div>
          <div className="g">{genusLabel ? item.name.split(' ')[0] : item.family}</div>
        </Link>
      ))}
    </div>
  );
}
