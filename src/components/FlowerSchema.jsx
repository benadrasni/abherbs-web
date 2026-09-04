import React, { useEffect, useRef } from 'react';

const PART_COUNT = 17;

export function flowerParts(t) {
  const parts = [];
  for (let i = 1; i <= PART_COUNT; i += 1) {
    const label = t[`legend_flower_${i}`];
    if (label) parts.push({ n: i, label });
  }
  return parts;
}

export default function FlowerSchema({ t, open, onClose }) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const parts = flowerParts(t);
  const title = t.flower_schema_title;

  useEffect(() => {
    if (!open) return undefined;
    prevFocus.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = rootRef.current;
      if (!root) return;
      const nodes = [...root.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
        (el) => !el.hasAttribute('disabled')
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = window.requestAnimationFrame(() => {
      (closeRef.current || rootRef.current)?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      const back = prevFocus.current;
      if (back && typeof back.focus === 'function') back.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      ref={rootRef}
      className="schema"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="flower-schema-title"
      tabIndex={-1}
    >
      <div className="schema-card" onClick={(e) => e.stopPropagation()}>
        <div className="schema-head">
          <h2 id="flower-schema-title">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className="schema-close"
            onClick={onClose}
            aria-label={t.close}
          >
            ×
          </button>
        </div>
        {t.flower_schema_lede ? <p className="schema-lede">{t.flower_schema_lede}</p> : null}
        <div className="schema-body">
          <figure className="schema-fig">
            <img src="/images/Mature_flower_numbered.webp" alt="" />
          </figure>
          <ol className="schema-list">
            {parts.map((part) => (
              <li key={part.n} value={part.n}>
                <span className="n" aria-hidden="true">
                  {part.n}
                </span>
                <span>{part.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
