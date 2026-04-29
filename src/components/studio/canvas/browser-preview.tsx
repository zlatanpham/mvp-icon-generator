'use client';

import { useDesign } from '@/lib/studio/design';
import { AppIconHero } from './app-icon-hero';

export function BrowserPreview() {
  const { design } = useDesign();
  const faviconRadiusPct = design.radius * 0.5;
  return (
    <div className="mx-auto mt-10 max-w-[760px]">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 shadow-soft">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="inline-flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-[var(--color-ink)]">
              In the browser tab
            </h3>
            <Badge>Favicon</Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)]">
          <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] bg-[var(--color-paper-3)] px-3 py-2">
            <div className="flex gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: '#FF5F57' }}
              />
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: '#FEBC2E' }}
              />
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: '#28C840' }}
              />
            </div>
            <div className="-mb-[9px] flex flex-1 items-center gap-1 pl-2.5">
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
      className="relative top-px -mb-[9px] flex max-w-[200px] items-center gap-1.5 rounded-t-md border border-b-0 px-2.5 py-[5px] text-[11px]"
      style={{
        background: active ? 'var(--color-paper-2)' : 'var(--color-paper-3)',
        color: active ? 'var(--color-ink-2)' : 'var(--color-ink-3)',
        borderColor: active ? 'var(--color-line)' : 'transparent',
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
      <span className="truncate">{label}</span>
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
