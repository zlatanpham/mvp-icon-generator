'use client';

import { useDesign } from '@/lib/studio/design';
import { backgroundCss } from '@/lib/studio/render/background-css';
import { PatternOverlay } from '@/components/studio/overlays/pattern-overlay';
import { GrainOverlay } from '@/components/studio/overlays/grain-overlay';
import { AppIconHero } from './app-icon-hero';

// Phone bezel: 230×460 with 8px padding ⇒ inner screen = 214×444.
// Splash export: iconSize = min(width, height) * 0.3 * 1.5 for portrait phones
// (icon-generator.ts paintSplashScreen).
const SPLASH_INNER_MIN = 214;
const SPLASH_ICON_SIZE = Math.round(SPLASH_INNER_MIN * 0.3 * 1.5);

// Home screen tiles use a fixed iOS-style radius — every app on the home
// screen, including the designed icon, should look like a real iOS tile, not
// reflect the user's design.radius (which controls the standalone export).
const TILE_SIZE = 38;
const TILE_RADIUS_PX = 10;
const TILE_RADIUS_PCT = (TILE_RADIUS_PX / TILE_SIZE) * 100;

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
  return (
    <div className="mx-auto mt-10 max-w-[760px]">
      <div className="shadow-soft rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="inline-flex items-baseline gap-2">
            <h3 className="text-[16px] font-bold text-[var(--color-ink)]">
              On a phone
            </h3>
            <Badge>iOS</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6">
          <PhoneFigure label="Home screen">
            <PhoneDeviceFrame>
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
                  <PhoneAppCell design={design} label={design.name} />
                  {APPS.slice(0, 11).map(a => (
                    <div key={a} className="flex flex-col items-center gap-1">
                      <div
                        className="border border-white/10 backdrop-blur"
                        style={{
                          width: TILE_SIZE,
                          height: TILE_SIZE,
                          background: 'rgba(255,255,255,0.18)',
                          borderRadius: TILE_RADIUS_PX,
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
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: TILE_RADIUS_PX,
                      }}
                    />
                  ))}
                  <PhoneDockTile design={design} />
                </div>
              </div>
            </PhoneDeviceFrame>
          </PhoneFigure>

          <PhoneFigure label="Splash screen">
            <PhoneDeviceFrame>
              <div
                className="relative grid h-full w-full place-items-center overflow-hidden"
                style={{
                  background: backgroundCss(design.bg),
                  borderRadius: 30,
                }}
              >
                <PatternOverlay
                  pattern={design.bg.pattern}
                  color={design.bg.patternColor}
                  opacity={design.bg.patternOpacity}
                />
                <GrainOverlay amount={design.bg.grain} />
                <div className="relative z-[2]">
                  <AppIconHero
                    design={design}
                    size={SPLASH_ICON_SIZE}
                    strokeWidth={1.8}
                    noShadow
                    bare
                  />
                </div>
              </div>
            </PhoneDeviceFrame>
          </PhoneFigure>
        </div>
      </div>
    </div>
  );
}

function PhoneDeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative p-2"
      style={{
        width: 230,
        height: 460,
        background: 'linear-gradient(160deg, #2A2A30, #1A1A1F)',
        borderRadius: 38,
        boxShadow:
          '0 20px 50px rgba(14,19,24,0.18), inset 0 0 0 1px rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  );
}

function PhoneFigure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-[11px] font-medium text-[var(--color-ink-3)]">
        {label}
      </span>
    </div>
  );
}

function PhoneAppCell({
  design,
  label,
}: {
  design: ReturnType<typeof useDesign>['design'];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AppIconHero
        design={design}
        size={TILE_SIZE}
        radiusPct={TILE_RADIUS_PCT}
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
}: {
  design: ReturnType<typeof useDesign>['design'];
}) {
  return (
    <AppIconHero
      design={design}
      size={TILE_SIZE}
      radiusPct={TILE_RADIUS_PCT}
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
