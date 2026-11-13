import { useEffect, useState } from 'react';
import { photoUrl, plateFiles } from '../api';

export default function PlateImage({ rel, preferred = 'grid', alt = '', eager = false }) {
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
      src={src}
      alt={alt}
      width="800"
      height="1200"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      onError={() => {
        if (fallback && src !== fallback) setSrc(fallback);
      }}
    />
  );
}
