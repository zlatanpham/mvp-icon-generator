'use client';

import type { CSSProperties } from 'react';
import type { PatternId } from '@/lib/studio/design';
import {
  PATTERN_REFERENCE_SIZE,
  patternSvgMarkup,
} from '@/lib/studio/data/patterns';

type Props = {
  pattern: PatternId;
  color: string;
  opacity: number;
  /**
   * Container's reference dimension (typically `min(width, height)` in px) used
   * to scale the pattern tile so density stays consistent across icon sizes.
   * Omit to fall back to the SVG's intrinsic tile size.
   */
  size?: number;
};

export function PatternOverlay({ pattern, color, opacity, size }: Props) {
  if (pattern === 'none') return null;
  const { svg, tile } = patternSvgMarkup(pattern, color);
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  const style: CSSProperties = {
    backgroundImage: url,
    opacity,
  };
  if (size) {
    const scale = size / PATTERN_REFERENCE_SIZE;
    style.backgroundSize = `${tile.w * scale}px ${tile.h * scale}px`;
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={style}
    />
  );
}
