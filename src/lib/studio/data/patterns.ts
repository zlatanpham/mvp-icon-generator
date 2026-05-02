import type { PatternId } from '../design';

export type PatternDef = {
  id: PatternId;
  name: string;
};

export const PATTERNS: PatternDef[] = [
  { id: 'none', name: 'None' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'diag', name: 'Diagonal' },
  { id: 'circles', name: 'Circles' },
  { id: 'cross', name: 'Cross' },
  { id: 'waves', name: 'Waves' },
];

/**
 * Reference canvas dimension the pattern tiles are sized against. Renderers
 * scale the tile by `containerDim / PATTERN_REFERENCE_SIZE` so a 32×32 favicon
 * and a 1024×1024 icon show the same pattern density.
 */
export const PATTERN_REFERENCE_SIZE = 320;

/**
 * Build the inline SVG markup for a tiled pattern. Used both for DOM `background-image`
 * data URLs and for canvas painting (rasterized via Image).
 */
export function patternSvgMarkup(
  pattern: Exclude<PatternId, 'none'>,
  color: string,
): { svg: string; tile: { w: number; h: number } } {
  switch (pattern) {
    case 'dots':
      return {
        tile: { w: 20, h: 20 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='3' cy='3' r='1.4' fill='${color}'/></svg>`,
      };
    case 'grid':
      return {
        tile: { w: 24, h: 24 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M24 0H0V24' fill='none' stroke='${color}' stroke-width='1'/></svg>`,
      };
    case 'stripes':
      return {
        tile: { w: 12, h: 12 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M0 0h6v12H0z' fill='${color}'/></svg>`,
      };
    case 'diag':
      return {
        tile: { w: 14, h: 14 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><path d='M-2 16L16 -2 M-2 4L4 -2 M10 16L16 10' fill='none' stroke='${color}' stroke-width='1.4'/></svg>`,
      };
    case 'circles':
      return {
        tile: { w: 40, h: 40 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='14' fill='none' stroke='${color}' stroke-width='1.4'/></svg>`,
      };
    case 'cross':
      return {
        tile: { w: 20, h: 20 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 6v8 M6 10h8' stroke='${color}' stroke-width='1.2' fill='none' stroke-linecap='round'/></svg>`,
      };
    case 'waves':
      return {
        tile: { w: 40, h: 14 },
        svg: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M0 7 Q10 0 20 7 T40 7' fill='none' stroke='${color}' stroke-width='1.4'/></svg>`,
      };
  }
}
