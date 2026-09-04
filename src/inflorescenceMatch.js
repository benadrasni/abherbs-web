export const INFLORESCENCE_TYPES = [
  'raceme',
  'spike',
  'spadix',
  'corymb',
  'umbel',
  'compound_umbel',
  'capitulum',
  'head',
  'panicle',
  'compound_spike',
  'cyme',
  'helicoid',
  'rhipidium',
  'scorpioid',
  'scorpioid_thyrse',
  'dichasial_thyrse',
  'double_scorpioid_thyrse',
];

/** Botanical names and inflected forms. Longer phrases beat shorter ones. */
export const INFLORESCENCE_SYNONYMS = {
  raceme: ['racemes', 'raceme', 'racemose', 'strapce', 'strapcovit', 'strapec', 'hrozen', 'hrozny', 'traube'],
  spike: ['spikes', 'spike', 'spicate', 'klasy', 'klasovit', 'klas', 'ähre'],
  spadix: ['spadices', 'spadix', 'šúľky', 'šúľok', 'šúľka', 'palice', 'kolben'],
  corymb: ['corymbs', 'corymbose', 'corymb', 'chocholíky', 'chocholíkov', 'chocholík', 'doldentraube'],
  umbel: ['umbels', 'umbellate', 'umbel', 'okolíčk', 'okolíky', 'okolík', 'dolde'],
  compound_umbel: [
    'compound umbels',
    'compound umbel',
    'secondary umbels',
    'zložený okolík',
    'zložené okolíky',
    'složený okolík',
    'složené okolíky',
    'doppeldolde',
  ],
  capitulum: [
    'flowering heads',
    'flowering head',
    'flower-heads',
    'flower-head',
    'flower heads',
    'flower head',
    'capitula',
    'capitulum',
    'capitules',
    'capitule',
    'úbory',
    'úborov',
    'úbor',
    'körbchen',
  ],
  head: ['spherical head', 'globose head', 'dense head', 'heads', 'head', 'hlávky', 'hlávka', 'köpfchen'],
  panicle: ['panicles', 'paniculate', 'panicle', 'metliny', 'metlina', 'laty', 'lata', 'rispe'],
  compound_spike: ['compound spikes', 'compound spike', 'zložený klas', 'zložené klasy', 'složený klas', 'zusammengesetzte ähre'],
  cyme: ['dichasium', 'dichasia', 'cymes', 'cyme', 'vidlice', 'vidlica', 'vidlan', 'vrcholíky', 'vrcholík'],
  helicoid: ['helicoid cymes', 'helicoid cyme', 'helicoid', 'bostryx', 'skrutec', 'šroubel', 'schraubel'],
  rhipidium: ['rhipidia', 'rhipidium', 'vejáriky', 'vejárik', 'vějířek', 'fächel'],
  scorpioid: [
    'scorpioid cymes',
    'scorpioid cyme',
    'scorpioid',
    'cincinnus',
    'závinky',
    'závinkov',
    'závinok',
    'závinek',
    'vijany',
    'vijan',
    'wickel',
  ],
  scorpioid_thyrse: ['scorpioid thyrsus', 'scorpioid thyrse', 'thyrsus', 'thyrse', 'wickel-zymus'],
  dichasial_thyrse: ['dichasial thyrsus', 'dichasial thyrse', 'thyrsoid', 'dichasialer zymus'],
  double_scorpioid_thyrse: [
    'double scorpioid thyrse',
    'double scorpioid thyrsus',
    'dvojzávinok',
    'dvojitý vijan',
    'doppelwickel',
  ],
};

function normalize(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .toLocaleLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLetter(ch) {
  return !!ch && /\p{L}/u.test(ch);
}

function leftoverLetters(hay, end) {
  let n = 0;
  for (let i = end; i < hay.length; i += 1) {
    if (!isLetter(hay[i])) break;
    n += 1;
  }
  return n;
}

function bestTermHit(hay, term) {
  const needle = normalize(term);
  if (needle.length < 4) return null;
  let from = 0;
  let best = null;
  while (from <= hay.length - needle.length) {
    const at = hay.indexOf(needle, from);
    if (at < 0) break;
    const before = at === 0 ? '' : hay[at - 1];
    if (isLetter(before)) {
      from = at + 1;
      continue;
    }
    const extra = leftoverLetters(hay, at + needle.length);
    const score = extra > 2 ? needle.length * 0.45 : needle.length;
    if (!best || score > best.score || (score === best.score && at < best.at)) {
      best = { score, at };
    }
    from = at + 1;
  }
  return best;
}

export function closestInflorescenceType(text, t) {
  const hay = normalize(text);
  if (!hay) return null;
  let winner = null;
  INFLORESCENCE_TYPES.forEach((key) => {
    const terms = [...(INFLORESCENCE_SYNONYMS[key] || [])];
    const label = t && t[`legend_inflorescence_${key}`];
    if (label && label.length >= 4) terms.push(label);
    terms.forEach((term) => {
      const hit = bestTermHit(hay, term);
      if (!hit) return;
      if (
        !winner ||
        hit.score > winner.score ||
        (hit.score === winner.score && hit.at < winner.at)
      ) {
        winner = { key, score: hit.score, at: hit.at };
      }
    });
  });
  return winner ? winner.key : null;
}

export function inflorescenceTypeList(plant) {
  const raw = plant && plant.inflorescenceType;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (raw && typeof raw === 'object') {
    return Object.keys(raw)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw[key])
      .filter(Boolean);
  }
  return [];
}

export function matchedInflorescenceKeys(plant, text, t) {
  const stored = inflorescenceTypeList(plant);
  if (stored.length) return stored;
  const closest = closestInflorescenceType(text, t);
  return closest ? [closest] : [];
}
