import React, { useEffect, useRef } from 'react';
import { INFLORESCENCE_TYPES } from '../inflorescenceMatch';

export { INFLORESCENCE_TYPES };

export function inflorescenceTypes(t) {
  return INFLORESCENCE_TYPES.map((key) => ({
    key,
    src: `/images/inflorescence_${key}.webp`,
    label: t[`legend_inflorescence_${key}`],
  })).filter((item) => item.label);
}

export default function InflorescenceSchema({ t, open, onClose, matchedKeys = [] }) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const types = inflorescenceTypes(t);
  const title = t.inflorescence_schema_title || t.inflorescence;
  const matched = new Set(matchedKeys);
  const primary = matchedKeys[0] || '';

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
      aria-labelledby="inflorescence-schema-title"
      tabIndex={-1}
    >
      <div className="schema-card schema-card-grid" onClick={(e) => e.stopPropagation()}>
        <div className="schema-head">
          <h2 id="inflorescence-schema-title">{title}</h2>
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
        <div className="schema-grid">
          {types.map((item) => {
            const isMatch = matched.has(item.key);
            const isPrimary = item.key === primary;
            return (
              <figure
                key={item.key}
                className={`schema-cell${isMatch ? ' is-match' : ''}${isPrimary ? ' is-primary' : ''}`}
                aria-current={isPrimary ? 'true' : undefined}
              >
                <img src={item.src} alt="" />
                <figcaption className="name">{item.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
