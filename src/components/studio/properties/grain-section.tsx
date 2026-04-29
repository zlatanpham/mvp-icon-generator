'use client';

import { useDesign } from '@/lib/studio/design';
import { Slider } from '@/components/ui/slider';

export function GrainSection() {
  const { design, patchBg } = useDesign();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-ink)]">
          Texture
        </span>
        <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-3)]">
          {Math.round(design.bg.grain * 100)}%
        </span>
      </div>
      <div className="mt-3">
        <Slider
          value={[Math.round(design.bg.grain * 100)]}
          onValueChange={(v) =>
            patchBg({ grain: (v[0] ?? 0) / 100 })
          }
          min={0}
          max={80}
          step={1}
        />
      </div>
    </>
  );
}
