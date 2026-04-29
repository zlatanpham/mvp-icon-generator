import { patternSvgMarkup } from '../data/patterns';
import type { PatternId } from '../design';

export function patternDataUrl(
  pattern: Exclude<PatternId, 'none'>,
  color: string,
): string {
  const { svg } = patternSvgMarkup(pattern, color);
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
