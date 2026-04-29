// === UI icons (Lucide-style stroke) — original drawings, used in app chrome ===
const Stroke = ({ d, w = 2 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const UI = {
  Search: () => <Stroke d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z M16 16l5 5" />,
  Close:  () => <Stroke d="M6 6l12 12 M18 6l-12 12" />,
  Plus:   () => <Stroke d="M12 5v14 M5 12h14" />,
  Minus:  () => <Stroke d="M5 12h14" />,
  Check:  () => <Stroke d="M5 12l5 5 9-11" />,
  Chevron:() => <Stroke d="M9 6l6 6-6 6" />,
  ChevDown:() => <Stroke d="M6 9l6 6 6-6" />,
  Reset:  () => <Stroke d="M3 12a9 9 0 1 0 3-7 M3 4v5h5" />,
  Maximize:() => <Stroke d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5" />,
  Phone:  () => <Stroke d="M7 2h10v20H7V2z M11 18h2" />,
  Browser:() => <Stroke d="M3 5h18v14H3V5z M3 9h18 M7 7v.01" />,
  Sizes:  () => <Stroke d="M4 4h6v6H4V4z M14 4h6v6h-6V4z M4 14h6v6H4v-6z M14 14h6v6h-6v-6z" />,
  Mac:    () => <Stroke d="M2 18h20 M5 4h14v14H5V4z" />,
  Library:() => <Stroke d="M4 4h7v7H4V4z M13 4h7v7h-7V4z M4 13h7v7H4v-7z M13 13h7v7h-7v-7z" />,
  Type:   () => <Stroke d="M4 7V4h16v3 M9 4v16 M15 20H9 M12 4v16" />,
  Upload: () => <Stroke d="M12 16V4 M6 10l6-6 6 6 M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />,
  Download:() => <Stroke d="M12 4v12 M6 10l6 6 6-6 M4 20h16" />,
  Sliders:() => <Stroke d="M4 7h6 M14 7h6 M4 17h10 M18 17h2 M10 4v6 M14 14v6" />,
  Share:  () => <Stroke d="M16 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M8 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M16 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M11 10l3-3 M11 14l3 3" />,
  Undo:   () => <Stroke d="M4 9h11a5 5 0 0 1 0 10H9 M4 9l4-4 M4 9l4 4" />,
  Redo:   () => <Stroke d="M20 9H9a5 5 0 0 0 0 10h6 M20 9l-4-4 M20 9l-4 4" />,
  Copy:   () => <Stroke d="M9 3h10v14H9V3z M5 7v14h12" />,
  Sparkle:() => <Stroke d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5 5l3 3 M16 16l3 3 M5 19l3-3 M16 8l3-3" />,
  Grid:   () => <Stroke d="M3 3h7v7H3V3z M14 3h7v7h-7V3z M3 14h7v7H3v-7z M14 14h7v7h-7v-7z" />,
  Crown:  () => <Stroke d="M3 8l4 4 5-7 5 7 4-4-2 12H5L3 8z M5 20h14" />,
  ZoomIn: () => <Stroke d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z M11 8v6 M8 11h6 M16 16l5 5" />,
  ZoomOut:() => <Stroke d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z M8 11h6 M16 16l5 5" />,
  Layers: () => <Stroke d="M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5 M3 17l9 5 9-5" />,
  Image:  () => <Stroke d="M3 4h18v16H3V4z M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M21 16l-6-6-9 9" />,
};

// === Background renderers ===
function renderBackground(bg) {
  const { type, color, gradient, pattern, patternColor, grain } = bg;
  let bgCss = color;
  if (type === 'linear') {
    bgCss = `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`;
  } else if (type === 'radial') {
    bgCss = `radial-gradient(circle at 30% 30%, ${gradient.colors.join(', ')})`;
  } else if (type === 'conic') {
    bgCss = `conic-gradient(from ${gradient.angle}deg at 50% 50%, ${gradient.colors.join(', ')}, ${gradient.colors[0]})`;
  } else if (type === 'mesh') {
    const [a, b, c] = gradient.colors;
    bgCss = `
      radial-gradient(at 18% 22%, ${a} 0px, transparent 55%),
      radial-gradient(at 82% 30%, ${b} 0px, transparent 55%),
      radial-gradient(at 50% 88%, ${c || a} 0px, transparent 55%),
      ${a}
    `;
  }
  return bgCss;
}

function PatternOverlay({ pattern, color = '#ffffff', opacity = 0.18 }) {
  if (!pattern || pattern === 'none') return null;
  const c = color;
  let svg;
  switch (pattern) {
    case 'dots':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='3' cy='3' r='1.4' fill='${c}'/></svg>`;
      break;
    case 'grid':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M24 0H0V24' fill='none' stroke='${c}' stroke-width='1'/></svg>`;
      break;
    case 'stripes':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M0 0h6v12H0z' fill='${c}'/></svg>`;
      break;
    case 'diag':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><path d='M-2 16L16 -2 M-2 4L4 -2 M10 16L16 10' fill='none' stroke='${c}' stroke-width='1.4'/></svg>`;
      break;
    case 'circles':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='14' fill='none' stroke='${c}' stroke-width='1.4'/></svg>`;
      break;
    case 'cross':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 6v8 M6 10h8' stroke='${c}' stroke-width='1.2' fill='none' stroke-linecap='round'/></svg>`;
      break;
    case 'waves':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M0 7 Q10 0 20 7 T40 7' fill='none' stroke='${c}' stroke-width='1.4'/></svg>`;
      break;
    default:
      return null;
  }
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return (
    <div className="pattern" style={{
      backgroundImage: url,
      opacity
    }} />
  );
}

function GrainOverlay({ amount }) {
  if (!amount) return null;
  const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.55'/></svg>`;
  return (
    <div className="noise" style={{
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
      opacity: amount,
    }} />
  );
}

// === The actual app icon component (used everywhere — hero, mini sizes, phone, browser) ===
function AppIcon({ design, size = 320, fontSize, scale = 1 }) {
  const { bg, content, foreground, radius, contentSize } = design;
  const bgCss = renderBackground(bg);
  const radiusPct = `${radius}%`;
  const innerSize = `${contentSize}%`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radiusPct,
        background: bgCss,
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <PatternOverlay pattern={bg.pattern} color={bg.patternColor} opacity={bg.patternOpacity} />
      <GrainOverlay amount={bg.grain} />
      {content.mode === 'icon' && (
        <div style={{ width: innerSize, height: innerSize, position: 'relative', zIndex: 2, display: 'grid', placeItems: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={foreground} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
            <path d={content.iconPath} fill={content.filled ? foreground : 'none'} />
          </svg>
        </div>
      )}
      {content.mode === 'letters' && (
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: foreground,
          fontFamily: `'${content.font}', sans-serif`,
          fontWeight: content.fontWeight,
          fontSize: fontSize ?? `${size * (contentSize / 100) * 0.55}px`,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}>
          {content.letters}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { UI, AppIcon, renderBackground, PatternOverlay, GrainOverlay });
