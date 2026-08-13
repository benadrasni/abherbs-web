import React, { useEffect } from 'react';

export default function Lightbox({ src, caption, onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <img src={src} alt={caption || ''} />
      {caption ? <p>{caption}</p> : null}
    </div>
  );
}
