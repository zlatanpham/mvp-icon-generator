'use client';

import { useDesign } from '@/lib/studio/design';
import { ColorRow, SwatchGrid } from './background-section';

export function IconColorSection() {
  const { design, setDesign, patchContent } = useDesign();
  return (
    <>
      <ColorRow
        value={design.foreground}
        onChange={(c) => setDesign((d) => ({ ...d, foreground: c }))}
      />
      <div className="h-2.5" />
      <SwatchGrid
        current={design.foreground}
        onPick={(c) => setDesign((d) => ({ ...d, foreground: c }))}
      />
      {design.content.mode === 'icon' && (
        <div className="mt-3 flex items-center justify-between py-2 font-serif text-[14px] italic">
          <span>Filled icon</span>
          <button
            type="button"
            onClick={() => patchContent({ filled: !design.content.filled })}
            aria-pressed={design.content.filled}
            className={`relative h-[22px] w-11 cursor-pointer border border-[var(--color-ink)] transition-colors ${
              design.content.filled ? 'bg-[var(--color-ink)]' : 'bg-transparent'
            }`}
          >
            <span
              className={`absolute top-[3px] h-[14px] w-[14px] transition-transform ${
                design.content.filled
                  ? 'left-[3px] translate-x-[22px] bg-[var(--color-paper)]'
                  : 'left-[3px] bg-[var(--color-ink)]'
              }`}
            />
          </button>
        </div>
      )}
    </>
  );
}
