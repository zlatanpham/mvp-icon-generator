'use client';

import { useDesign } from '@/lib/studio/design';
import { AppIconHero } from './app-icon-hero';

const SIZES = [512, 192, 128, 96, 64, 32, 16];

export function SizeGrid() {
  const { design } = useDesign();
  return (
    <div className="mx-auto mt-9 max-w-[760px]">
      <div className="mb-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] p-[22px_24px]">
        <div className="mb-[18px] flex items-baseline justify-between border-b border-[var(--color-rule)] pb-3">
          <div className="inline-flex items-baseline gap-3 font-serif text-[22px] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
            Size variations
            <span className="border border-[var(--color-rule)] px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-[var(--color-ink-3)] uppercase">
              {SIZES.length} sizes
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-[18px] py-1">
          {SIZES.map((px) => {
            const visual = Math.min(px, 96);
            return (
              <div key={px} className="flex flex-col items-center gap-2.5">
                <AppIconHero
                  design={design}
                  size={visual}
                  noShadow
                  style={{
                    boxShadow: '0 4px 12px rgba(21,20,15,0.10)',
                  }}
                />
                <div className="font-mono text-[9.5px] tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
                  {px}×{px}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
