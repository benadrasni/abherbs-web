import React from 'react';
import { Link } from 'react-router-dom';
import { displayName, headerPlate, plantPath } from '../lib';

export default function PlateGrid({ items, lang, genusLabel }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <Link key={item.name} className="cell" to={plantPath(item.name, lang)}>
          <div className="art">
            <img src={headerPlate(item)} alt="" />
          </div>
          <div className="n">{displayName(item.label, item.name)}</div>
          <div className="l latin">{item.name}</div>
          <div className="g">{genusLabel ? item.name.split(' ')[0] : item.family}</div>
        </Link>
      ))}
    </div>
  );
}
