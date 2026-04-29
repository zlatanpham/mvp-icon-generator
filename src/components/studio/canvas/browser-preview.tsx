'use client';

import { useDesign } from '@/lib/studio/design';
import { AppIconHero } from './app-icon-hero';

export function BrowserPreview() {
  const { design } = useDesign();
  const faviconRadiusPct = design.radius * 0.5;
  return (
    <div className="mx-auto mt-9 max-w-[760px]">
      <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-[22px_24px]">
        <div className="mb-[18px] flex items-baseline justify-between border-b border-[var(--color-rule)] pb-3">
          <div className="inline-flex items-baseline gap-3 font-serif text-[22px] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
            In the browser tab
            <span className="border border-[var(--color-rule)] px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-[var(--color-ink-3)] uppercase">
              Favicon
            </span>
          </div>
        </div>

        <div className="overflow-hidden border border-[var(--color-ink)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2.5 border-b border-[var(--color-ink)] bg-[var(--color-paper-3)] px-3 py-2">
            <div className="flex gap-[5px]">
              <span
                className="h-[9px] w-[9px] rounded-full border border-[var(--color-ink)]"
                style={{ background: '#C44A47' }}
              />
              <span
                className="h-[9px] w-[9px] rounded-full border border-[var(--color-ink)]"
                style={{ background: '#E0AE3E' }}
              />
              <span
                className="h-[9px] w-[9px] rounded-full border border-[var(--color-ink)]"
                style={{ background: '#5BA86F' }}
              />
            </div>
            <div className="-mb-[9px] flex flex-1 items-center gap-0 pl-2.5">
              <BrowserTab active label={design.name}>
                <AppIconHero
                  design={design}
                  size={14}
                  radiusPct={faviconRadiusPct}
                  strokeWidth={2.4}
                  noShadow
                />
              </BrowserTab>
              <BrowserTab label="Mail · Inbox" iconColor="#FF6B6B" />
              <BrowserTab label="Calendar" iconColor="#4FACFE" />
            </div>
          </div>
          <div
            className="h-[90px]"
            style={{
              background:
                'linear-gradient(180deg, var(--color-paper-2), var(--color-paper-3))',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BrowserTab({
  active,
  label,
  iconColor,
  children,
}: {
  active?: boolean;
  label: string;
  iconColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative top-px -mb-[9px] flex max-w-[200px] items-center gap-1.5 border border-b-0 px-2.5 py-[5px] font-serif text-[11px] italic"
      style={{
        background: active
          ? 'var(--color-paper-2)'
          : 'var(--color-paper-3)',
        color: active ? 'var(--color-ink-2)' : 'var(--color-ink-3)',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-rule)',
      }}
    >
      <div className="grid h-[14px] w-[14px] flex-shrink-0 place-items-center overflow-hidden">
        {children ?? (
          <div
            className="h-full w-full"
            style={{ background: iconColor, borderRadius: 3 }}
          />
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
