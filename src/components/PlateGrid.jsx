import { Link } from 'react-router-dom';
import PlateImage from './PlateImage';
import { familyIconUrl, taxonLabel } from '../api';
import { displayName, genusOf, genusPath, headerPlateRel, listPath, plantPath } from '../lib';

export function PlateCell({ item, lang, genusLabel, taxonomy, genusWord }) {
  if (item.genus) {
    const rel = headerPlateRel(item);
    return (
      <Link className="cell" to={genusPath(item.genus, lang)}>
        <div className="art">
          {rel ? <PlateImage rel={rel} preferred="grid" alt="" /> : null}
        </div>
        {item.state ? <div className="year state">{item.state}</div> : item.year ? <div className="year">{item.year}</div> : null}
        <div className="n latin">{item.genus}</div>
        <div className="g">{genusWord || ''}</div>
      </Link>
    );
  }
  const taxon = genusLabel ? genusOf(item.name) : item.family;
  const common = taxonLabel(taxonomy, taxon);
  return (
    <Link className="cell" to={plantPath(item.name, lang)}>
      <div className="art">
        <PlateImage rel={headerPlateRel(item)} preferred="grid" alt="" />
      </div>
      {item.state ? <div className="year state">{item.state}</div> : item.year ? <div className="year">{item.year}</div> : null}
      <div className="n">{displayName(item.label, item.name)}</div>
      <div className="l latin">{item.name}</div>
      <div className="g">{common ? displayName(common) : taxon}</div>
    </Link>
  );
}

export function ListCell({ list, lang, t }) {
  const cover = list && list.cover;
  const familyIcon = cover && cover.familyIcon && cover.family;
  return (
    <Link className="cell" to={listPath(list.name, lang)}>
      <div className="art">
        {familyIcon ? (
          <img src={familyIconUrl(cover.family)} alt="" />
        ) : cover ? (
          <PlateImage rel={headerPlateRel(cover)} preferred="grid" alt="" />
        ) : null}
      </div>
      <div className="n">{list.name}</div>
      <div className="g">{t.plants_count(list.count)}</div>
    </Link>
  );
}

export default function PlateGrid({ items, lang, genusLabel, taxonomy, genusWord }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <PlateCell
          key={`${item.state || item.year || ''}:${item.name}`}
          item={item}
          lang={lang}
          genusLabel={genusLabel}
          taxonomy={taxonomy}
          genusWord={genusWord}
        />
      ))}
    </div>
  );
}
