'use client';

import { useDesign } from '@/lib/studio/design';

export function ShapeSection() {
  const { design, setDesign } = useDesign();
  return (
    <>
      <div className="flex items-baseline justify-between font-serif text-[16px] font-bold tracking-[-0.01em]">
        <span>Corner radius</span>
        <span className="font-mono text-[10.5px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
          {design.radius}%
        </span>
      </div>
      <div className="mt-3 flex h-[22px] items-center">
        <input
          className="editorial-slider"
          type="range"
          min={0}
          max={50}
          value={design.radius}
          onChange={(e) =>
            setDesign((d) => ({ ...d, radius: Number(e.target.value) }))
          }
        />
      </div>

      <div className="h-3.5" />

      <div className="flex items-baseline justify-between font-serif text-[16px] font-bold tracking-[-0.01em]">
        <span>Content size</span>
        <span className="font-mono text-[10.5px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
          {design.contentSize}%
        </span>
      </div>
      <div className="mt-3 flex h-[22px] items-center">
        <input
          className="editorial-slider"
          type="range"
          min={20}
          max={90}
          value={design.contentSize}
          onChange={(e) =>
            setDesign((d) => ({ ...d, contentSize: Number(e.target.value) }))
          }
        />
      </div>
    </>
  );
}
