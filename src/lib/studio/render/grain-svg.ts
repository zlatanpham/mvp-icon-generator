/**
 * Build a fractal-noise SVG and return both the markup (for canvas rasterization)
 * and a data URL (for DOM background-image overlays). The SVG uses feTurbulence,
 * which the browser rasterizes when used as an image source.
 */
export function grainSvgMarkup(): string {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.55'/></svg>`;
}

export function grainDataUrl(): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(grainSvgMarkup())}")`;
}
