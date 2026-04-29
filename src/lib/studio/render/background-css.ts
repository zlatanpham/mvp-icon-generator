import type { DesignBg } from '../design';

/**
 * Convert a Design.bg object into a CSS `background` string for DOM previews.
 * Mirrors the logic of canvas-painter so on-screen previews match exports.
 */
export function backgroundCss(bg: DesignBg): string {
  const { type, color, gradient } = bg;
  const colors = gradient.colors;

  switch (type) {
    case 'linear':
      return `linear-gradient(${gradient.angle}deg, ${colors.join(', ')})`;
    case 'radial':
      return `radial-gradient(circle at 30% 30%, ${colors.join(', ')})`;
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg at 50% 50%, ${colors.join(
        ', ',
      )}, ${colors[0]})`;
    case 'mesh': {
      const [a, b, c] = colors;
      return [
        `radial-gradient(at 18% 22%, ${a} 0px, transparent 55%)`,
        `radial-gradient(at 82% 30%, ${b ?? a} 0px, transparent 55%)`,
        `radial-gradient(at 50% 88%, ${c ?? a} 0px, transparent 55%)`,
        a,
      ].join(', ');
    }
    case 'pattern':
    case 'noise':
    case 'solid':
    default:
      return color;
  }
}
