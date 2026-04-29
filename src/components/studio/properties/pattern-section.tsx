'use client';

import { useDesign } from '@/lib/studio/design';
import { PATTERNS } from '@/lib/studio/data/patterns';
import { backgroundCss } from '@/lib/studio/render/background-css';
import { PatternOverlay } from '@/components/studio/overlays/pattern-overlay';
import { Slider } from '@/components/ui/slider';

export function PatternSection() {
  const { design, patchBg } = useDesign();
  const bg = design.bg;

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {PATTERNS.map((p) => {
          const active = bg.pattern === p.id;
          const cellBg =
            p.id === 'none' ? 'var(--color-paper-2)' : backgroundCss(bg);
          return (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => patchBg({ pattern: p.id })}
              className={`relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border transition-all ${
                active
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
                  : 'border-[var(--color-line)] hover:border-[var(--color-ink-4)] hover:shadow-soft'
              }`}
              style={{ background: cellBg }}
            >
              {p.id === 'none' ? (
                <span className="text-[10px] font-bold text-[var(--color-ink-3)]">
                  None
                </span>
              ) : (
                <PatternOverlay
                  pattern={p.id}
                  color={design.foreground}
                  opacity={0.5}
                />
              )}
            </button>
          );
        })}
      </div>

      {bg.pattern !== 'none' && (
        <>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-[var(--color-ink)]">
              Pattern opacity
            </span>
            <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-3)]">
              {Math.round(bg.patternOpacity * 100)}%
            </span>
          </div>
          <div className="mt-3">
            <Slider
              value={[Math.round(bg.patternOpacity * 100)]}
              onValueChange={(v) =>
                patchBg({ patternOpacity: (v[0] ?? 0) / 100 })
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
        </>
      )}
    </>
  );
}
