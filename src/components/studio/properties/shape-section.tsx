'use client';

import { useDesign } from '@/lib/studio/design';
import { Slider } from '@/components/ui/slider';

export function ShapeSection() {
  const { design, setDesign } = useDesign();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-ink)]">
          Corner radius
        </span>
        <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-3)]">
          {design.radius}%
        </span>
      </div>
      <div className="mt-3 mb-5">
        <Slider
          value={[design.radius]}
          onValueChange={(v) =>
            setDesign((d) => ({ ...d, radius: v[0] ?? 0 }))
          }
          min={0}
          max={50}
          step={1}
        />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-ink)]">
          Content size
        </span>
        <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-3)]">
          {design.contentSize}%
        </span>
      </div>
      <div className="mt-3">
        <Slider
          value={[design.contentSize]}
          onValueChange={(v) =>
            setDesign((d) => ({ ...d, contentSize: v[0] ?? 20 }))
          }
          min={20}
          max={90}
          step={1}
        />
      </div>
    </>
  );
}
