'use client';

import { useDesign } from '@/lib/studio/design';
import { PATTERNS } from '@/lib/studio/data/patterns';
import { backgroundCss } from '@/lib/studio/render/background-css';
import { PatternOverlay } from '@/components/studio/overlays/pattern-overlay';

export function PatternSection() {
  const { design, patchBg } = useDesign();
  const bg = design.bg;

  return (
    <>
      <div className="flex items-baseline justify-between font-serif text-[16px] font-bold tracking-[-0.01em]">
        <span>Overlay</span>
        <span className="font-mono text-[10.5px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
          {bg.pattern === 'none' ? 'off' : bg.pattern}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 border border-[var(--color-rule)]">
        {PATTERNS.map((p, i) => {
          const isLastRow = i >= 4;
          const active = bg.pattern === p.id;
          const cellBg =
            p.id === 'none'
              ? 'var(--color-paper-2)'
              : backgroundCss(bg);
          return (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => patchBg({ pattern: p.id })}
              className={`relative aspect-square cursor-pointer overflow-hidden border-r border-[var(--color-rule)] [&:nth-child(4n)]:border-r-0 ${
                isLastRow ? '' : 'border-b border-[var(--color-rule)]'
              } ${active ? '[box-shadow:inset_0_0_0_2px_var(--color-ink)]' : 'hover:bg-[var(--color-paper-3)]'}`}
              style={{ background: cellBg }}
            >
              {p.id === 'none' ? (
                <span className="font-mono text-[9px] font-bold tracking-[0.06em] text-[var(--color-ink-3)] uppercase">
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
          <div className="h-3" />
          <div className="flex items-baseline justify-between font-serif text-[14px] font-bold tracking-[-0.01em]">
            <span>Pattern opacity</span>
            <span className="font-mono text-[10.5px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
              {Math.round(bg.patternOpacity * 100)}%
            </span>
          </div>
          <div className="mt-3 flex h-[22px] items-center">
            <input
              className="editorial-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(bg.patternOpacity * 100)}
              onChange={(e) =>
                patchBg({ patternOpacity: Number(e.target.value) / 100 })
              }
            />
          </div>
        </>
      )}
    </>
  );
}
