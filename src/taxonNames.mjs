export function taxonNames(taxonomy, latin) {
  if (!taxonomy || !latin) return [];
  const raw = taxonomy[latin];
  if (raw == null) return [];
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? [name] : [];
  }
  const values = Array.isArray(raw)
    ? raw
    : Object.keys(raw)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => raw[key]);
  return values
    .filter((name) => typeof name === 'string' && name.trim())
    .map((name) => name.trim());
}

export function taxonVernaculars(taxonomy, latin) {
  // Prefer the first name that is not a case-only copy of the Latin name.
  // When that copy is the only vernacular (Iris → iris), it stays the title.
  const exact = String(latin || '').trim();
  const names = taxonNames(taxonomy, latin).filter((name) => name !== exact);
  const key = exact.toLowerCase();
  const realAt = names.findIndex((name) => name.toLowerCase() !== key);
  if (realAt <= 0) return names;
  return [names[realAt], ...names.slice(0, realAt), ...names.slice(realAt + 1)];
}

export function taxonLabel(taxonomy, latin) {
  return taxonVernaculars(taxonomy, latin)[0] || '';
}
