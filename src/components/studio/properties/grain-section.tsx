'use client';

import { useDesign } from '@/lib/studio/design';

export function GrainSection() {
  const { design, patchBg } = useDesign();
  return (
    <>
      <div className="flex items-baseline justify-between font-serif text-[16px] font-bold tracking-[-0.01em]">
        <span>Texture</span>
        <span className="font-mono text-[10.5px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
          {Math.round(design.bg.grain * 100)}%
        </span>
      </div>
      <div className="mt-3 flex h-[22px] items-center">
        <input
          className="editorial-slider"
          type="range"
          min={0}
          max={80}
          value={Math.round(design.bg.grain * 100)}
          onChange={(e) =>
            patchBg({ grain: Number(e.target.value) / 100 })
          }
        />
      </div>
    </>
  );
}
