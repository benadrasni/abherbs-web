import React, { useEffect, useState } from 'react';
import { photoUrl, plateFiles } from '../api';

export default function PlateImage({ rel, preferred = 'grid', alt = '', className, sizes }) {
  const files = plateFiles(rel);
  const want = photoUrl(preferred === 'master' ? files.master : files.grid);
  const fallback = photoUrl(files.legacy);
  const [src, setSrc] = useState(want || fallback);

  useEffect(() => {
    setSrc(want || fallback);
  }, [want, fallback]);

  if (!src) return null;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      onError={() => {
        if (fallback && src !== fallback) setSrc(fallback);
      }}
    />
  );
}
