import type { Design, DesignBg } from './design';
import { patternSvgMarkup } from './data/patterns';
import { grainSvgMarkup } from './render/grain-svg';

/**
 * Foreground payload prepared by the caller (e.g. icon-generator.ts).
 * Keeping the painter pure of React/DOM-icon-loading concerns means it can be
 * unit-tested with simple SVG strings or rendered text data.
 */
export type PreparedForeground =
  | {
      kind: 'svg';
      /** A complete <svg ...>...</svg> string with viewBox set, already tinted. */
      svgString: string;
    }
  | {
      kind: 'text';
      letters: string;
      font: string;
      weight: number;
      color: string;
    };

export type PaintOptions = {
  size: number;
  /** Override design.radius (0–50). Used by maskable icons (radius=0). */
  radiusPct?: number;
  /** Override design.contentSize (20–90). Used by maskable safe-area (≤80). */
  contentSizePct?: number;
  /** Skip the rounded-corner clip (used when caller already painted a flat bg). */
  noClip?: boolean;
};

const TWO_PI = Math.PI * 2;
const DEG = Math.PI / 180;

/**
 * Paint a Design into a canvas. The caller sets canvas.width/height to opts.size
 * before calling.
 */
export async function paintDesignToCanvas(
  ctx: CanvasRenderingContext2D,
  design: Design,
  fg: PreparedForeground,
  opts: PaintOptions,
): Promise<void> {
  const s = opts.size;
  const radius = (opts.radiusPct ?? design.radius) * (s / 100);
  const contentSize = opts.contentSizePct ?? design.contentSize;

  ctx.clearRect(0, 0, s, s);
  ctx.save();
  if (!opts.noClip) {
    roundedRectPath(ctx, 0, 0, s, s, radius);
    ctx.clip();
  }

  await paintBackground(ctx, design.bg, s);

  if (design.bg.pattern !== 'none') {
    await paintPatternOverlay(
      ctx,
      design.bg.pattern,
      design.bg.patternColor,
      design.bg.patternOpacity,
      s,
    );
  }
  if (design.bg.grain > 0) {
    await paintGrainOverlay(ctx, design.bg.grain, s);
  }

  await paintForeground(ctx, fg, s, contentSize);

  ctx.restore();
}

/**
 * Convenience: paint into a fresh canvas and return a PNG Blob.
 */
export async function paintDesignToBlob(
  design: Design,
  fg: PreparedForeground,
  opts: PaintOptions,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = opts.size;
  canvas.height = opts.size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');
  await paintDesignToCanvas(ctx, design, fg, opts);
  return canvasToBlob(canvas);
}

// ============================================================================
// Background
// ============================================================================

async function paintBackground(
  ctx: CanvasRenderingContext2D,
  bg: DesignBg,
  s: number,
): Promise<void> {
  switch (bg.type) {
    case 'solid':
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, s, s);
      return;
    case 'linear':
      paintLinearGradient(ctx, bg.gradient.colors, bg.gradient.angle, s);
      return;
    case 'radial':
      paintRadialGradient(ctx, bg.gradient.colors, s);
      return;
    case 'conic':
      paintConicGradient(ctx, bg.gradient.colors, bg.gradient.angle, s);
      return;
    case 'mesh':
      paintMeshGradient(ctx, bg.gradient.colors, s);
      return;
    case 'pattern':
    case 'noise':
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, s, s);
      return;
  }
}

function paintLinearGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  angleDeg: number,
  s: number,
): void {
  // CSS linear-gradient: 0deg = up, increasing clockwise.
  const rad = angleDeg * DEG;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  // CSS spec: gradient line length covers projection of corners onto the line.
  const L = (Math.abs(s * dx) + Math.abs(s * dy)) / 1;
  const cx = s / 2;
  const cy = s / 2;
  const x0 = cx - (dx * L) / 2;
  const y0 = cy - (dy * L) / 2;
  const x1 = cx + (dx * L) / 2;
  const y1 = cy + (dy * L) / 2;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  addEvenStops(grad, colors);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
}

function paintRadialGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  s: number,
): void {
  // Mockup uses `radial-gradient(circle at 30% 30%, …)` (farthest-corner default).
  const cx = 0.3 * s;
  const cy = 0.3 * s;
  const r = Math.hypot(s - cx, s - cy);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  addEvenStops(grad, colors);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
}

function paintConicGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  angleDeg: number,
  s: number,
): void {
  const cx = s / 2;
  const cy = s / 2;
  // CSS `from 0deg` starts at top (north). Canvas conic 0 rad points east.
  const startAngle = (angleDeg - 90) * DEG;
  // Modern browsers (Chrome/Safari/Firefox 2024+) support createConicGradient.
  const maybeConic = (
    ctx as CanvasRenderingContext2D & {
      createConicGradient?: (
        startAngle: number,
        x: number,
        y: number,
      ) => CanvasGradient;
    }
  ).createConicGradient;
  if (typeof maybeConic === 'function') {
    const grad = maybeConic.call(ctx, startAngle, cx, cy);
    const closed = [...colors, colors[0]];
    addEvenStops(grad, closed);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    return;
  }
  // Fallback: scan with thin pie slices.
  const slices = 360;
  const r = Math.hypot(s, s);
  for (let i = 0; i < slices; i++) {
    const t = i / slices;
    const next = (i + 1) / slices;
    const a0 = startAngle + t * TWO_PI;
    const a1 = startAngle + next * TWO_PI;
    ctx.fillStyle = sampleStops(colors, t, true);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1 + 0.002);
    ctx.closePath();
    ctx.fill();
  }
}

function paintMeshGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  s: number,
): void {
  const a = colors[0];
  const b = colors[1] ?? a;
  const c = colors[2] ?? a;
  // Solid base (matches CSS where the last image is at the bottom).
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, s, s);
  // Bottom-up: paint blob3, blob2, blob1 so blob1 ends up on top.
  paintMeshBlob(ctx, c, 0.5 * s, 0.88 * s, 0.55 * s);
  paintMeshBlob(ctx, b, 0.82 * s, 0.3 * s, 0.55 * s);
  paintMeshBlob(ctx, a, 0.18 * s, 0.22 * s, 0.55 * s);
}

function paintMeshBlob(
  ctx: CanvasRenderingContext2D,
  color: string,
  cx: number,
  cy: number,
  r: number,
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

function addEvenStops(grad: CanvasGradient, colors: string[]): void {
  if (colors.length === 0) return;
  if (colors.length === 1) {
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[0]);
    return;
  }
  colors.forEach((c, i) => {
    grad.addColorStop(i / (colors.length - 1), c);
  });
}

function sampleStops(
  colors: string[],
  t: number,
  closeLoop = false,
): string {
  // Used only by the conic fallback. Linear interpolation between adjacent stops.
  const list = closeLoop ? [...colors, colors[0]] : colors;
  const segs = list.length - 1;
  if (segs <= 0) return list[0];
  const x = t * segs;
  const i = Math.min(Math.floor(x), segs - 1);
  const f = x - i;
  return mixHex(list[i], list[i + 1], f);
}

function mixHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const c = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${c})`;
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// Pattern + grain overlays
// ============================================================================

async function paintPatternOverlay(
  ctx: CanvasRenderingContext2D,
  pattern: Exclude<DesignBg['pattern'], 'none'>,
  color: string,
  opacity: number,
  s: number,
): Promise<void> {
  const { svg } = patternSvgMarkup(pattern, color);
  const img = await loadSvgImage(svg);
  const css = ctx.createPattern(img, 'repeat');
  if (!css) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
}

async function paintGrainOverlay(
  ctx: CanvasRenderingContext2D,
  amount: number,
  s: number,
): Promise<void> {
  const img = await loadSvgImage(grainSvgMarkup());
  ctx.save();
  ctx.globalAlpha = Math.min(1, amount);
  ctx.globalCompositeOperation = 'overlay';
  // Tile by drawing repeatedly — simpler and equivalent to the DOM background-repeat.
  const tile = 200;
  for (let y = 0; y < s; y += tile) {
    for (let x = 0; x < s; x += tile) {
      ctx.drawImage(img, x, y, tile, tile);
    }
  }
  ctx.restore();
}

// ============================================================================
// Foreground (icon SVG or text glyph)
// ============================================================================

async function paintForeground(
  ctx: CanvasRenderingContext2D,
  fg: PreparedForeground,
  s: number,
  contentSizePct: number,
): Promise<void> {
  const drawable = s * (contentSizePct / 100);
  const padding = (s - drawable) / 2;

  if (fg.kind === 'svg') {
    const img = await loadSvgImage(fg.svgString);
    ctx.drawImage(img, padding, padding, drawable, drawable);
    return;
  }

  // text — match the DOM preview which uses fontSize = size * (contentSize/100) * 0.6
  let fontSize = drawable * 0.6;
  // Wait for the font, and shrink-to-fit if measured width still exceeds the safe area.
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.load(`${fg.weight} ${fontSize}px "${fg.font}"`);
    } catch {
      /* best-effort */
    }
  }
  ctx.fillStyle = fg.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const setFont = (px: number) => {
    ctx.font = `${fg.weight} ${px}px "${fg.font}", system-ui, sans-serif`;
  };
  setFont(fontSize);
  const safe = drawable;
  const measured = ctx.measureText(fg.letters || 'A').width;
  if (measured > safe) {
    fontSize *= safe / measured;
    setFont(fontSize);
  }
  ctx.fillText(fg.letters || 'A', s / 2, s / 2 + fontSize * 0.05);
}

// ============================================================================
// Helpers
// ============================================================================

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png');
  });
}
