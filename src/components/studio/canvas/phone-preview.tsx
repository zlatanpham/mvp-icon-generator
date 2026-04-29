'use client';

import { useDesign } from '@/lib/studio/design';
import { AppIconHero } from './app-icon-hero';

const APPS = [
  'Mail',
  'Maps',
  'Music',
  'Chat',
  'Camera',
  'Notes',
  'Health',
  'Photos',
  'Wallet',
  'Books',
  'Files',
];

export function PhonePreview() {
  const { design } = useDesign();
  const tileRadiusPct = design.radius * 0.45;
  return (
    <div className="mx-auto mt-10 max-w-[760px]">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 shadow-soft">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="inline-flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-[var(--color-ink)]">
              On a phone home screen
            </h3>
            <Badge>iOS</Badge>
          </div>
        </div>

        <div
          className="relative mx-auto p-2"
          style={{
            width: 230,
            height: 460,
            background: 'linear-gradient(160deg, #2A2A30, #1A1A1F)',
            borderRadius: 38,
            boxShadow:
              '0 20px 50px rgba(14,19,24,0.18), inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden p-[18px_14px]"
            style={{
              background:
                'linear-gradient(180deg, #6E7E8A, #4A5360 60%, #3A2D34)',
              borderRadius: 30,
            }}
          >
            <div className="flex items-center justify-between px-1.5 pb-[18px] text-[11px] font-semibold text-white">
              <span>9:41</span>
              <span className="opacity-80">●●● 100%</span>
            </div>

            <div className="grid grid-cols-4 gap-x-3 gap-y-3.5 p-1">
              <PhoneAppCell
                design={design}
                tileRadiusPct={tileRadiusPct}
                label={design.name}
              />
              {APPS.slice(0, 11).map((a) => (
                <div key={a} className="flex flex-col items-center gap-1">
                  <div
                    className="h-[38px] w-[38px] border border-white/10 backdrop-blur"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      borderRadius: 10,
                    }}
                  />
                  <span className="text-[8.5px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    {a}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="absolute right-3.5 bottom-3.5 left-3.5 flex h-[60px] items-center justify-around border border-white/10 px-3"
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 22,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[38px] w-[38px]"
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: 10,
                  }}
                />
              ))}
              <PhoneDockTile design={design} tileRadiusPct={tileRadiusPct} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneAppCell({
  design,
  tileRadiusPct,
  label,
}: {
  design: ReturnType<typeof useDesign>['design'];
  tileRadiusPct: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AppIconHero
        design={design}
        size={38}
        radiusPct={tileRadiusPct}
        strokeWidth={1.8}
        noShadow
        style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.20)' }}
      />
      <span className="text-[8.5px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        {label}
      </span>
    </div>
  );
}

function PhoneDockTile({
  design,
  tileRadiusPct,
}: {
  design: ReturnType<typeof useDesign>['design'];
  tileRadiusPct: number;
}) {
  return (
    <AppIconHero
      design={design}
      size={38}
      radiusPct={tileRadiusPct}
      strokeWidth={1.8}
      noShadow
    />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--color-paper-3)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-3)]">
      {children}
    </span>
  );
}
