'use client';

import { grainDataUrl } from '@/lib/studio/render/grain-svg';

type Props = { amount: number };

export function GrainOverlay({ amount }: Props) {
  if (amount <= 0) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] mix-blend-overlay"
      style={{
        backgroundImage: grainDataUrl(),
        opacity: amount,
      }}
    />
  );
}
