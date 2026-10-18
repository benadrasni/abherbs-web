const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const dot = { fill: 'currentColor' };

function HabitatGlyph({ id }) {
  return (
    <svg className="habitat-glyph" viewBox="0 0 44 44" aria-hidden="true">
      {id === '1' ? (
        <>
          <path
            d="M4 36h36 M9 36c0-6 1-10 3-14 M13 36c0-5-1-9-4-12 M20 36c0-8 2-13 5-17 M26 36c0-6-2-10-5-13 M33 36c0-6 1-9 3-12 M36 36c-1-5-3-7-6-9"
            {...stroke}
          />
          <circle cx="25" cy="17" r="2.5" {...stroke} />
          <circle cx="12" cy="20" r="2" {...stroke} />
        </>
      ) : null}
      {id === '3' ? (
        <>
          <path
            d="M4 30c4-3 8 3 12 0s8 3 12 0 8 3 12 0 M4 37c4-3 8 3 12 0s8 3 12 0 8 3 12 0 M14 28V12 M20 28V8 M26 28V13"
            {...stroke}
          />
          <rect x="18.5" y="8" width="3" height="7" rx="1.5" {...dot} />
        </>
      ) : null}
      {id === '4' ? (
        <path
          d="M14 6 6 20h5l-6 10h18l-6-10h5z M14 30v8 M30 10l-7 12h4l-5 9h16l-5-9h4z M30 31v7 M4 38h36"
          {...stroke}
        />
      ) : null}
      {id === '5' ? <path d="M3 38 15 14l6 9 5-7 15 22z M12 20l3-6 3 5" {...stroke} /> : null}
      {id === '7' ? (
        <>
          <circle cx="31" cy="12" r="4.5" {...stroke} />
          <path
            d="M31 3.5v2 M31 18.5v2 M22.5 12h2 M37.5 12h2 M25 6l1.4 1.4 M35.6 16.6 37 18 M25 18l1.4-1.4 M35.6 7.4 37 6 M4 36h36 M12 36c-1-5-3-8-6-10 M14 36c0-6 1-10 3-13 M16 36c1-4 3-7 6-8 M28 36c0-3 1-6 3-7 M30 36c-1-3-2-5-4-6"
            {...stroke}
          />
        </>
      ) : null}
      {id === '8' ? (
        <>
          <path
            d="M4 22h36 M17 38 21 22 M29 38 23 22 M23 38l-.5-3 M22.3 31.5l-.3-2.5 M21.9 26.5l-.1-1.5 M9 38v-9 M9 34c-2-1-3-2-3-4 M35 38v-7 M38 38v-5"
            {...stroke}
          />
          <circle cx="9" cy="27" r="2.5" {...stroke} />
          <circle cx="35" cy="29.5" r="1.8" {...stroke} />
        </>
      ) : null}
      {id === '9' ? (
        <>
          <ellipse cx="29" cy="35" rx="11" ry="3" {...stroke} />
          <path d="M4 38h11 M10 38V19 M10 23l-4-3 M10 28l4-3 M10 33l-4-3 M26 32V18 M32 32V21" {...stroke} />
          <circle cx="6" cy="20" r="1.2" {...dot} />
          <circle cx="14" cy="25" r="1.2" {...dot} />
          <circle cx="6" cy="30" r="1.2" {...dot} />
          <circle cx="10" cy="17.5" r="1.2" {...dot} />
          <circle cx="26" cy="16" r="2.6" {...stroke} />
          <circle cx="32" cy="19" r="2.6" {...stroke} />
        </>
      ) : null}
      {id === '10' ? (
        <>
          <circle cx="33" cy="10" r="4" {...stroke} />
          <path
            d="M4 27c5-9 13-11 20-5 3 2 5 3 8 3 M13 21v-5 M13 18l-2-2 M13 18l2-3 M4 33c4-3 8 3 12 0s8 3 12 0 8 3 12 0 M4 39c4-3 8 3 12 0s8 3 12 0 8 3 12 0"
            {...stroke}
          />
        </>
      ) : null}
    </svg>
  );
}

function PetalGlyph({ id }) {
  if (id === '4') {
    const petal = {
      fill: 'var(--cream)',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };
    return (
      <svg className="petal-glyph" viewBox="0 0 72 72" aria-hidden="true">
        <path d="M36 38c-12-2-22-10-18-22 6-4 14 2 18 12 4-10 12-16 18-12 4 12-6 20-18 22z" {...petal} />
        <path d="M36 40c-8 2-16 8-16 20 8 4 16-2 16-10 0 8 8 14 16 10 0-12-8-18-16-20z" {...petal} />
        <path d="M36 30v12" fill="none" stroke="#85603c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const count = id === '1' ? 4 : id === '2' ? 5 : 16;
  const rx = id === '1' ? 10 : id === '2' ? 9 : 3.6;
  const offset = id === '3' ? 17 : 15;
  const petals = [];
  for (let i = 0; i < count; i += 1) {
    petals.push((i * 360) / count);
  }
  return (
    <svg className="petal-glyph" viewBox="0 0 72 72" aria-hidden="true">
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx="36"
          cy={36 - offset}
          rx={rx}
          ry="14"
          fill="var(--cream)"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={'rotate(' + deg + ' 36 36)'}
        />
      ))}
      <circle cx="36" cy="36" r="6" fill="#e0b340" stroke="#85603c" strokeWidth="1.2" />
    </svg>
  );
}

export { HabitatGlyph, PetalGlyph };
