import React, { useEffect, useRef, useState } from 'react';

export default function Lightbox({
  items,
  index = 0,
  onClose,
  onIndexChange,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);
  const indexRef = useRef(index);
  const countRef = useRef(0);
  const onIndexChangeRef = useRef(onIndexChange);
  const onCloseRef = useRef(onClose);

  const list = items && items.length ? items : null;
  const count = list ? list.length : 0;
  const safeIndex = count ? ((index % count) + count) % count : 0;
  const item = list ? list[safeIndex] : null;
  const src = item && item.src;
  const fallbackSrc = item && item.fallbackSrc;
  const caption = item && item.caption;
  const canNav = count > 1;
  const open = Boolean(src);

  indexRef.current = safeIndex;
  countRef.current = count;
  onIndexChangeRef.current = onIndexChange;
  onCloseRef.current = onClose;

  const go = (delta) => {
    const n = countRef.current;
    if (n <= 1 || !onIndexChangeRef.current) return;
    const next = (indexRef.current + delta + n) % n;
    onIndexChangeRef.current(next);
  };

  useEffect(() => {
    if (!open) return undefined;
    prevFocus.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
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

  useEffect(() => {
    if (!list || list.length < 2) return undefined;
    const neighbors = [list[(safeIndex - 1 + list.length) % list.length], list[(safeIndex + 1) % list.length]];
    neighbors.forEach((it) => {
      if (!it || !it.src) return;
      const img = new Image();
      img.src = it.src;
    });
    return undefined;
  }, [list, safeIndex]);

  const [shown, setShown] = useState(src);
  useEffect(() => {
    setShown(src);
  }, [src]);

  if (!open) return null;
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
      {canNav ? (
        <button
          type="button"
          className="lightbox-nav lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label={prevLabel}
        >
          <span aria-hidden="true">‹</span>
        </button>
      ) : null}
      {canNav ? (
        <button
          type="button"
          className="lightbox-nav lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label={nextLabel}
        >
          <span aria-hidden="true">›</span>
        </button>
      ) : null}
      <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
        <img
          src={shown}
          alt={caption || ''}
          onError={() => {
            if (fallbackSrc && shown !== fallbackSrc) setShown(fallbackSrc);
          }}
        />
        {caption ? <p aria-live="polite">{caption}</p> : null}
      </div>
    </div>
  );
}
