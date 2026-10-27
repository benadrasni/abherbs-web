// A vernacular that is missing, or that copies the scientific name, is not a second name.
export function spokenName(label, latin) {
  const name = String(label || '').trim();
  const scientific = String(latin || '').trim();
  if (!name || name === scientific) return '';
  return name;
}
