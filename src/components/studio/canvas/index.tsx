'use client';

import { useState } from 'react';
import {
  Grid2x2,
  Smartphone,
  AppWindow,
  Maximize2,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import { useDesign, INITIAL_DESIGN } from '@/lib/studio/design';
import { backgroundCss } from '@/lib/studio/render/background-css';
import { AppIconHero } from './app-icon-hero';
import { SizeGrid } from './size-grid';
import { PhonePreview } from './phone-preview';
import { BrowserPreview } from './browser-preview';

type Surface = 'sizes' | 'phone' | 'browser';

export function Canvas() {
  const { design, setDesign } = useDesign();
  const [surface, setSurface] = useState<Surface>('sizes');
  const [zoom, setZoom] = useState(100);

  const handleReset = () => setDesign(INITIAL_DESIGN);
  const handleFullscreen = () => {
    const el = document.querySelector<HTMLElement>('[data-canvas-pane]');
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <main
      data-canvas-pane
      className="relative flex min-h-0 flex-col overflow-hidden bg-[var(--color-bg)]"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-3 shadow-[0_1px_0_0_rgba(255,255,255,1)]">
        <div className="flex items-center gap-1">
          <SurfaceTab
            active={surface === 'sizes'}
            onClick={() => setSurface('sizes')}
            icon={<Grid2x2 className="h-4 w-4" />}
            label="Size grid"
          />
          <SurfaceTab
            active={surface === 'phone'}
            onClick={() => setSurface('phone')}
            icon={<Smartphone className="h-4 w-4" />}
            label="Phone"
          />
          <SurfaceTab
            active={surface === 'browser'}
            onClick={() => setSurface('browser')}
            icon={<AppWindow className="h-4 w-4" />}
            label="Browser"
          />
        </div>
        <div className="flex items-center gap-2">
          <IconButton title="Reset" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </IconButton>
          <div className="flex h-9 items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]"
              aria-label="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="grid h-full min-w-[44px] place-items-center px-1 text-[12px] font-semibold tabular-nums text-[var(--color-ink)]">
              {zoom}%
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]"
              aria-label="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <IconButton title="Fullscreen" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="bg-canvas-stage editorial-scroll relative flex-1 overflow-y-auto px-10 pt-12 pb-12">
        {/* Decorative floating shapes — soft, low-opacity, far behind everything */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 left-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
          style={{ background: 'linear-gradient(135deg, #8b3dff, #c13ff7)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 right-12 h-40 w-40 rounded-full opacity-25 blur-2xl"
          style={{ background: 'linear-gradient(135deg, #ff6cab, #ffd166)' }}
        />

        <div className="relative mx-auto grid max-w-[760px] place-items-center">
          {/* Ambient halo — large blurred copy of the icon's own background */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[420px] w-[420px] rounded-full opacity-35 blur-3xl"
            style={{ background: backgroundCss(design.bg) }}
          />
          <AppIconHero size={320} style={{ transform: `scale(${zoom / 100})` }} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-[12px] text-[var(--color-ink-3)]">
          <span className="font-semibold text-[var(--color-ink)]">{design.name}</span>
          <span className="text-[var(--color-ink-4)]">·</span>
          <span>
            {design.content.mode === 'letters'
              ? design.content.font
              : design.content.iconName || 'Custom'}
          </span>
          <span className="text-[var(--color-ink-4)]">·</span>
          <span className="capitalize">{design.bg.type}</span>
        </div>

        {surface === 'sizes' && <SizeGrid />}
        {surface === 'phone' && <PhonePreview />}
        {surface === 'browser' && <BrowserPreview />}
      </div>
    </main>
  );
}

function SurfaceTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
          : 'text-[var(--color-ink-3)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]"
    >
      {children}
    </button>
  );
}
