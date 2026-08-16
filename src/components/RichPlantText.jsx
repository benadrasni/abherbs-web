import React from 'react';

/** Render the same `<b>…</b>` markers the Flutter plant page uses. Not HTML. */
export default function RichPlantText({ value }) {
  const text = String(value || '');
  if (!text.includes('<b>')) return text;
  const parts = text.split('<b>');
  return parts.map((part, i) => {
    if (i === 0) return part;
    const close = part.indexOf('</b>');
    if (close < 0) {
      return <strong key={i}>{part}</strong>;
    }
    return (
      <span key={i}>
        <strong>{part.slice(0, close)}</strong>
        {part.slice(close + 4)}
      </span>
    );
  });
}
