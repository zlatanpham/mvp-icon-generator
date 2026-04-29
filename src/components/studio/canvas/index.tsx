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
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-bg)] px-[26px] py-3">
        <div className="flex items-center gap-0">
          <SurfaceTab
            active={surface === 'sizes'}
            onClick={() => setSurface('sizes')}
            icon={<Grid2x2 className="h-[13px] w-[13px]" />}
            label="Size grid"
          />
          <SurfaceTab
            active={surface === 'phone'}
            onClick={() => setSurface('phone')}
            icon={<Smartphone className="h-[13px] w-[13px]" />}
            label="Phone"
          />
          <SurfaceTab
            active={surface === 'browser'}
            onClick={() => setSurface('browser')}
            icon={<AppWindow className="h-[13px] w-[13px]" />}
            label="Browser"
          />
        </div>
        <div className="flex items-center gap-1">
          <IconButton title="Reset" onClick={handleReset}>
            <RotateCcw className="h-[13px] w-[13px]" />
          </IconButton>
          <div className="flex h-[30px] items-center overflow-hidden border border-[var(--color-ink)]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="grid h-full w-[30px] cursor-pointer place-items-center text-[var(--color-ink-2)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
              aria-label="Zoom out"
            >
              <Minus className="h-[13px] w-[13px]" />
            </button>
            <div className="grid h-full min-w-[50px] place-items-center border-x border-[var(--color-ink)] px-2.5 font-mono text-[11px] font-medium tracking-[0.04em] tabular-nums text-[var(--color-ink)]">
              {zoom}%
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="grid h-full w-[30px] cursor-pointer place-items-center text-[var(--color-ink-2)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
              aria-label="Zoom in"
            >
              <Plus className="h-[13px] w-[13px]" />
            </button>
          </div>
          <IconButton title="Fullscreen" onClick={handleFullscreen}>
            <Maximize2 className="h-[13px] w-[13px]" />
          </IconButton>
        </div>
      </div>

      <div
        className="editorial-grid editorial-scroll relative flex-1 overflow-y-auto px-14 pt-10 pb-[60px]"
      >
        <div className="relative mx-auto mb-2 flex max-w-[760px] items-baseline justify-between border-b border-[var(--color-ink)] pb-3">
          <div className="font-serif text-[46px] leading-[0.95] font-black tracking-[-0.035em] text-[var(--color-ink)]">
            The Studio
            <br />
            for{' '}
            <em className="font-medium text-[var(--color-accent)] italic">
              Marks &amp; Icons
            </em>
          </div>
          <div className="text-right font-mono text-[10.5px] leading-[1.5] tracking-[0.14em] text-[var(--color-ink-3)] uppercase">
            <strong className="block font-medium text-[var(--color-ink)]">
              Issue №{new Date().getFullYear()}
            </strong>
            Spring Edition
            <br />
            Composed in browser
          </div>
        </div>

        <div className="relative mx-auto mt-6 mb-[18px] grid max-w-[760px] place-items-center">
          <AppIconHero size={320} style={{ transform: `scale(${zoom / 100})` }} />
        </div>

        <div className="flex items-center justify-center gap-3.5 font-mono text-[10px] tracking-[0.16em] text-[var(--color-ink-3)] uppercase">
          <span>{design.name}</span>
          <span className="h-px w-4 bg-[var(--color-rule)]" />
          <span>
            {design.content.mode === 'letters'
              ? design.content.font
              : design.content.iconName || 'Custom'}
          </span>
          <span className="h-px w-4 bg-[var(--color-rule)]" />
          <span>{design.bg.type}</span>
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
      className={`-mb-px inline-flex cursor-pointer items-center gap-2 px-3.5 py-2 font-mono text-[10.5px] font-medium tracking-[0.12em] uppercase transition-colors ${
        active
          ? 'border-b border-[var(--color-ink)] text-[var(--color-ink)]'
          : 'border-b border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
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
      className="grid h-8 w-8 cursor-pointer place-items-center text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]"
    >
      {children}
    </button>
  );
}
