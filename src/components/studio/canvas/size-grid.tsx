'use client';

import { useDesign } from '@/lib/studio/design';
import { AppIconHero } from './app-icon-hero';

const SIZES = [512, 192, 128, 96, 64, 32, 16];

export function SizeGrid() {
  const { design } = useDesign();
  return (
    <div className="mx-auto mt-10 max-w-[760px]">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 shadow-soft">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="inline-flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-[var(--color-ink)]">
              Size variations
            </h3>
            <Badge>{SIZES.length} sizes</Badge>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          {SIZES.map((px) => {
            const visual = Math.min(px, 96);
            return (
              <div key={px} className="flex flex-col items-center gap-2">
                <AppIconHero
                  design={design}
                  size={visual}
                  noShadow
                  style={{
                    boxShadow:
                      '0 2px 6px rgba(14,19,24,0.06), 0 8px 16px rgba(14,19,24,0.06)',
                  }}
                />
                <div className="text-[11px] font-medium text-[var(--color-ink-3)]">
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--color-paper-3)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-3)]">
      {children}
    </span>
  );
}
