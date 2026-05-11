"use client";

// Deterministic generative avatar — same seed always produces the same pattern.
// Inspired by Boring Avatars / Claude's gravatar-style icons.
//
// Pass `seed` (e.g. the user's email or id) and you get a unique colorful
// composition of layered blobs clipped to a circle.

const PALETTES = [
  ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72CB', '#FF8FA3'],
  ['#FF8C42', '#FFB627', '#A5D8FF', '#7048E8', '#F783AC', '#5EEAD4'],
  ['#06D6A0', '#118AB2', '#FFD166', '#EF476F', '#073B4C', '#FF8C42'],
  ['#5EEAD4', '#075056', '#F59E0B', '#FBBF24', '#262626', '#14B8A6'],
  ['#A8E6CF', '#FFAAA5', '#FF8B94', '#FFD3B6', '#D8E2DC', '#6A4C93'],
  ['#7209B7', '#F72585', '#4361EE', '#4CC9F0', '#FFD60A', '#06D6A0'],
  ['#FF5E5B', '#00CECB', '#FFED66', '#A56AFC', '#FF8C42', '#1A1A1A'],
  ['#0D9488', '#14B8A6', '#5EEAD4', '#FBBF24', '#F59E0B', '#FB7185'],
  ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06D6A0'],
  ['#22D3EE', '#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#FB7185'],
];

function hash(str) {
  let h = 5381;
  const s = String(str || 'anon');
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function pick(seed, offset, min, max) {
  const h = hash(`${seed}-${offset}`);
  return min + (h % (max - min));
}

export default function MarbleAvatar({ seed = '', size = 36, className = '', style = {} }) {
  const h = hash(seed);
  const palette = PALETTES[h % PALETTES.length];

  // Pick 5 unique colors from the palette, ordered deterministically.
  const colors = [];
  const used = new Set();
  for (let i = 0; i < 5; i++) {
    let idx = hash(`${seed}-color-${i}`) % palette.length;
    let tries = 0;
    while (used.has(idx) && tries < palette.length) {
      idx = (idx + 1) % palette.length;
      tries++;
    }
    used.add(idx);
    colors.push(palette[idx]);
  }

  // Four overlapping shapes — randomised positions, sizes, rotations.
  const blob1 = {
    cx: pick(seed, 'b1cx', 8, 28),
    cy: pick(seed, 'b1cy', 8, 28),
    rx: pick(seed, 'b1rx', 16, 28),
    ry: pick(seed, 'b1ry', 12, 22),
    rot: pick(seed, 'b1rot', 0, 360),
  };
  const blob2 = {
    cx: pick(seed, 'b2cx', 6, 30),
    cy: pick(seed, 'b2cy', 6, 30),
    rx: pick(seed, 'b2rx', 12, 22),
    ry: pick(seed, 'b2ry', 8, 18),
    rot: pick(seed, 'b2rot', 0, 360),
  };
  const blob3 = {
    cx: pick(seed, 'b3cx', 8, 28),
    cy: pick(seed, 'b3cy', 8, 28),
    r: pick(seed, 'b3r', 6, 13),
  };
  const stripeAngle = pick(seed, 'stripe', 0, 180);

  const id = `marble-${h}`;
  const gradId1 = `grad1-${h}`;
  const gradId2 = `grad2-${h}`;

  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <mask id={id}>
          <rect width="36" height="36" rx="36" ry="36" fill="white" />
        </mask>
        <linearGradient id={gradId1} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
        <linearGradient id={gradId2} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={colors[2]} />
          <stop offset="100%" stopColor={colors[3]} />
        </linearGradient>
      </defs>
      <g mask={`url(#${id})`}>
        {/* Background gradient */}
        <rect width="36" height="36" fill={`url(#${gradId1})`} />

        {/* Soft blob 1 — large oval */}
        <ellipse
          cx={blob1.cx}
          cy={blob1.cy}
          rx={blob1.rx}
          ry={blob1.ry}
          fill={`url(#${gradId2})`}
          opacity="0.9"
          transform={`rotate(${blob1.rot} ${blob1.cx} ${blob1.cy})`}
        />

        {/* Slim accent stripe */}
        <ellipse
          cx="18"
          cy="18"
          rx="26"
          ry="5"
          fill={colors[4]}
          opacity="0.55"
          transform={`rotate(${stripeAngle} 18 18)`}
        />

        {/* Soft blob 2 */}
        <ellipse
          cx={blob2.cx}
          cy={blob2.cy}
          rx={blob2.rx}
          ry={blob2.ry}
          fill={colors[2]}
          opacity="0.75"
          transform={`rotate(${blob2.rot} ${blob2.cx} ${blob2.cy})`}
        />

        {/* Bright accent dot */}
        <circle
          cx={blob3.cx}
          cy={blob3.cy}
          r={blob3.r}
          fill={colors[3]}
          opacity="0.95"
        />

        {/* Tiny highlight */}
        <circle
          cx={blob3.cx - 2}
          cy={blob3.cy - 2}
          r={blob3.r * 0.35}
          fill="#ffffff"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
