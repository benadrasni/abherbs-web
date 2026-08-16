import React, { useEffect, useRef } from 'react';

export default function Lightbox({ src, caption, onClose }) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!src) return undefined;
    prevFocus.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [src, onClose]);

  if (!src) return null;
  return (
    <div
      ref={rootRef}
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={caption || undefined}
      tabIndex={-1}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        ×
      </button>
      <img src={src} alt={caption || ''} />
      {caption ? <p>{caption}</p> : null}
    </div>
  );
}
