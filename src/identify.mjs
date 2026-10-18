/** Four-step flower key. Codes match the field-guide v3 filter. */

export const COLORS = [
  { id: '1', labelKey: 'color_white' },
  { id: '2', labelKey: 'color_yellow' },
  { id: '3', labelKey: 'color_red' },
  { id: '4', labelKey: 'color_blue' },
  { id: '5', labelKey: 'color_green' },
];

export const HABITATS = [
  { id: '4', labelKey: 'guide_habitat_forest', examplesKey: 'guide_habitat_forest_examples' },
  { id: '1', labelKey: 'guide_habitat_meadow', examplesKey: 'guide_habitat_meadow_examples' },
  { id: '7', labelKey: 'guide_habitat_dry', examplesKey: 'guide_habitat_dry_examples' },
  { id: '8', labelKey: 'guide_habitat_fields', examplesKey: 'guide_habitat_fields_examples' },
  { id: '3', labelKey: 'guide_habitat_water', examplesKey: 'guide_habitat_water_examples' },
  { id: '9', labelKey: 'guide_habitat_heath', examplesKey: 'guide_habitat_heath_examples' },
  { id: '5', labelKey: 'guide_habitat_rock', examplesKey: 'guide_habitat_rock_examples' },
  { id: '10', labelKey: 'guide_habitat_coast', examplesKey: 'guide_habitat_coast_examples' },
];

export const PETALS = [
  { id: '1', labelKey: 'petal_4' },
  { id: '2', labelKey: 'petal_5' },
  { id: '3', labelKey: 'petal_many' },
  { id: '4', labelKey: 'petal_zygomorphic' },
];

export const REGION_GROUPS = [
  {
    labelKey: 'europe',
    regions: [
      ['10', 'northern_europe'],
      ['11', 'middle_europe'],
      ['12', 'southwestern_europe'],
      ['13', 'southeastern_europe'],
      ['14', 'eastern_europe'],
    ],
  },
  {
    labelKey: 'africa',
    regions: [
      ['20', 'northern_africa'],
      ['21', 'macaronesia'],
      ['22', 'west_tropical_africa'],
      ['23', 'west_central_tropical_africa'],
      ['24', 'northeast_tropical_africa'],
      ['25', 'east_tropical_africa'],
      ['26', 'south_tropical_africa'],
      ['27', 'southern_africa'],
      ['28', 'middle_atlantic_ocean'],
      ['29', 'western_indian_ocean'],
    ],
  },
  {
    labelKey: 'asia_temperate',
    regions: [
      ['30', 'siberia'],
      ['31', 'russian_far_east'],
      ['32', 'middle_asia'],
      ['33', 'caucasus'],
      ['34', 'western_asia'],
      ['35', 'arabian_peninsula'],
      ['36', 'china'],
      ['37', 'mongolia'],
      ['38', 'eastern_asia'],
    ],
  },
  {
    labelKey: 'asia_tropical',
    regions: [
      ['40', 'indian_subcontinent'],
      ['41', 'indochina'],
      ['42', 'malesia'],
      ['43', 'papuasia'],
    ],
  },
  {
    labelKey: 'australasia',
    regions: [
      ['50', 'australia'],
      ['51', 'new_zealand'],
    ],
  },
  {
    labelKey: 'pacific',
    regions: [
      ['60', 'southwestern_pacific'],
      ['61', 'south_central_pacific'],
      ['62', 'northwestern_pacific'],
      ['63', 'north_central_pacific'],
    ],
  },
  {
    labelKey: 'northern_america',
    regions: [
      ['70', 'subarctic_america'],
      ['71', 'western_canada'],
      ['72', 'eastern_canada'],
      ['73', 'northwestern_usa'],
      ['74', 'north_central_usa'],
      ['75', 'northeastern_usa'],
      ['76', 'southwestern_usa'],
      ['77', 'south_central_usa'],
      ['78', 'southeastern_usa'],
      ['79', 'mexico'],
    ],
  },
  {
    labelKey: 'southern_america',
    regions: [
      ['80', 'central_america'],
      ['81', 'caribbean'],
      ['82', 'northern_south_america'],
      ['83', 'western_south_america'],
      ['84', 'brazil'],
      ['85', 'southern_south_america'],
    ],
  },
  {
    labelKey: 'guide_region_antarctic',
    regions: [
      ['90', 'subantarctic_islands'],
      ['91', 'antarctic_continent'],
    ],
  },
];

/** Same short list the field guide shows before “All regions”. */
export const FEATURED_REGIONS = ['10', '11', '12', '13', '14', '75', '77', '78'];

const AXES = ['color', 'habitat', 'petal', 'region'];

const FIELDS = {
  color: 'filterColor',
  habitat: 'filterHabitat',
  petal: 'filterPetal',
  region: 'filterDistribution',
};

function allowedSet(rows, idOf) {
  return new Set(rows.map(idOf));
}

const ALLOWED = {
  color: allowedSet(COLORS, (row) => row.id),
  habitat: allowedSet(HABITATS, (row) => row.id),
  petal: allowedSet(PETALS, (row) => row.id),
  region: allowedSet(
    REGION_GROUPS.flatMap((group) => group.regions),
    (row) => row[0]
  ),
};

const LABEL_KEYS = {};
COLORS.forEach((row) => {
  LABEL_KEYS['color:' + row.id] = row.labelKey;
});
HABITATS.forEach((row) => {
  LABEL_KEYS['habitat:' + row.id] = row.labelKey;
});
PETALS.forEach((row) => {
  LABEL_KEYS['petal:' + row.id] = row.labelKey;
});
REGION_GROUPS.forEach((group) => {
  group.regions.forEach(([id, labelKey]) => {
    LABEL_KEYS['region:' + id] = labelKey;
  });
});

export function filterCodes(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((code) => String(code)).filter((code) => code !== '');
  }
  if (typeof value === 'object') {
    return Object.keys(value).filter((key) => value[key]);
  }
  return [String(value)];
}

export function labelKeyFor(axis, id) {
  return LABEL_KEYS[axis + ':' + id] || '';
}

function readParam(params, key) {
  if (!params) return '';
  if (typeof params.get === 'function') return params.get(key) || '';
  const value = params[key];
  return value == null ? '' : String(value);
}

export function parseSelection(params) {
  const selection = {};
  AXES.forEach((axis) => {
    const value = readParam(params, axis);
    selection[axis] = ALLOWED[axis].has(value) ? value : '';
  });
  return selection;
}

export function selectionQuery(selection) {
  const params = new URLSearchParams();
  AXES.forEach((axis) => {
    if (selection && selection[axis]) params.set(axis, selection[axis]);
  });
  return params;
}

export function selectionActive(selection) {
  return AXES.some((axis) => selection && selection[axis]);
}

export function plantMatches(plant, selection) {
  if (!plant) return false;
  return AXES.every((axis) => {
    const chosen = selection && selection[axis];
    if (!chosen) return true;
    return filterCodes(plant[FIELDS[axis]]).includes(chosen);
  });
}

function matchesOtherAxes(plant, selection, axis) {
  return AXES.every((other) => {
    if (other === axis) return true;
    const chosen = selection && selection[other];
    if (!chosen) return true;
    return filterCodes(plant[FIELDS[other]]).includes(chosen);
  });
}

export function optionCounts(plants, selection, axis) {
  const ids = ALLOWED[axis];
  const counts = {};
  ids.forEach((id) => {
    counts[id] = 0;
  });
  (plants || []).forEach((plant) => {
    if (!matchesOtherAxes(plant, selection, axis)) return;
    filterCodes(plant[FIELDS[axis]]).forEach((code) => {
      if (ids.has(code)) counts[code] += 1;
    });
  });
  return counts;
}

export function attachFilters(headers, raw) {
  const byId = new Map();
  const byName = new Map();
  const rows = [];
  if (Array.isArray(raw)) {
    raw.forEach((row, index) => {
      if (!row || !row.name) return;
      const id = row.id != null ? Number(row.id) : index;
      rows.push({ ...row, id: Number.isNaN(id) ? index : id });
    });
  } else if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach((key) => {
      const row = raw[key];
      if (!row || !row.name) return;
      const fromRow = row.id != null ? Number(row.id) : Number(key);
      rows.push({ ...row, id: Number.isNaN(fromRow) ? key : fromRow });
    });
  }
  rows.forEach((row) => {
    byId.set(String(row.id), row);
    if (!byName.has(row.name)) byName.set(row.name, row);
  });
  return (headers || []).map((header) => {
    const row =
      (header && header.id != null && byId.get(String(header.id))) ||
      (header && byName.get(header.name));
    if (!row) return header;
    return {
      ...header,
      filterColor: row.filterColor,
      filterHabitat: row.filterHabitat,
      filterPetal: row.filterPetal,
      filterDistribution: row.filterDistribution,
    };
  });
}
