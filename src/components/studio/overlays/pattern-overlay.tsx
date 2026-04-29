'use client';

import type { PatternId } from '@/lib/studio/design';
import { patternDataUrl } from '@/lib/studio/render/pattern-svg';

type Props = {
  pattern: PatternId;
  color: string;
  opacity: number;
};

export function PatternOverlay({ pattern, color, opacity }: Props) {
  if (pattern === 'none') return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        backgroundImage: patternDataUrl(pattern, color),
        opacity,
      }}
    />
  );
}
