'use client';

import { useDesign, type BgType } from '@/lib/studio/design';
import { BG_TYPES } from '@/lib/studio/data/bg-types';
import { SWATCHES } from '@/lib/studio/data/swatches';
import { GRADIENTS } from '@/lib/studio/data/gradients';
import { patternDataUrl } from '@/lib/studio/render/pattern-svg';

export function BackgroundSection() {
  const { design, patchBg, patchGradient } = useDesign();
  const bg = design.bg;

  const onTypeClick = (id: BgType) => {
    if (id === 'noise') {
      patchBg({ grain: bg.grain > 0 ? 0 : 0.4 });
      return;
    }
    if (id === 'pattern') {
      patchBg({ pattern: bg.pattern === 'none' ? 'dots' : 'none' });
      return;
    }
    patchBg({ type: id });
  };

  const isActive = (id: BgType) => {
    if (id === 'noise') return bg.grain > 0;
    if (id === 'pattern') return bg.pattern !== 'none';
    return bg.type === id;
  };

  const isGradientType =
    bg.type === 'linear' ||
    bg.type === 'radial' ||
    bg.type === 'conic' ||
    bg.type === 'mesh';

  return (
    <>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {BG_TYPES.map((t) => (
          <BgTypeButton
            key={t.id}
            id={t.id}
            label={t.label}
            active={isActive(t.id)}
            onClick={() => onTypeClick(t.id)}
          />
        ))}
      </div>

      {bg.type === 'solid' && (
        <SolidControls
          value={bg.color}
          onChange={(c) => patchBg({ color: c })}
        />
      )}

      {isGradientType && (
        <GradientControls
          colors={bg.gradient.colors}
          angle={bg.gradient.angle}
          type={bg.type}
          onChange={(p) => patchGradient(p)}
        />
      )}
    </>
  );
}

function BgTypeButton({
  id,
  label,
  active,
  onClick,
}: {
  id: BgType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  let swatchStyle: React.CSSProperties = {};
  switch (id) {
    case 'solid':
      swatchStyle = { background: '#1A1A1F' };
      break;
    case 'linear':
      swatchStyle = { background: 'linear-gradient(135deg, #FF6B35, #F7931E)' };
      break;
    case 'radial':
      swatchStyle = {
        background: 'radial-gradient(circle at 30% 30%, #00DBDE, #4A00E0)',
      };
      break;
    case 'conic':
      swatchStyle = {
        background:
          'conic-gradient(from 0deg, #FF6B6B, #4FACFE, #84CC16, #FF6B6B)',
      };
      break;
    case 'mesh':
      swatchStyle = {
        background:
          'radial-gradient(at 20% 20%, #FF80AB 0px, transparent 60%), radial-gradient(at 80% 30%, #80D8FF 0px, transparent 60%), radial-gradient(at 50% 90%, #FBBF24 0px, transparent 60%), #8B5CF6',
      };
      break;
    case 'pattern':
      swatchStyle = {
        background: '#1A1A1F',
        backgroundImage: patternDataUrl('dots', '#F7F3E9'),
      };
      break;
    case 'noise':
      swatchStyle = { background: 'linear-gradient(135deg, #6366F1, #EC4899)' };
      break;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-between rounded-lg border p-1.5 transition-all ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)]'
          : 'border-[var(--color-line)] bg-[var(--color-paper-2)] hover:border-[var(--color-ink-4)] hover:shadow-soft'
      }`}
    >
      <div
        className="h-7 w-7 rounded-md"
        style={swatchStyle}
      />
      <div
        className={`text-[9.5px] font-semibold ${
          active ? 'text-[var(--color-accent-2)]' : 'text-[var(--color-ink-3)]'
        }`}
      >
        {label}
      </div>
    </button>
  );
}

function SolidControls({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <>
      <ColorRow value={value} onChange={onChange} />
      <div className="mt-3 mb-2 text-[12px] font-semibold text-[var(--color-ink-3)]">
        Swatches
      </div>
      <SwatchGrid current={value} onPick={onChange} />
    </>
  );
}

export function ColorRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] p-2 transition-colors focus-within:border-[var(--color-accent)] focus-within:bg-white">
      <div
        className="h-6 w-6 flex-shrink-0 rounded-md"
        style={{
          background: value,
          boxShadow: 'inset 0 0 0 1px rgba(14,19,24,.1)',
        }}
      />
      <input
        className="flex-1 bg-transparent font-mono text-[12px] tracking-[0.04em] text-[var(--color-ink)] uppercase outline-none"
        value={value.replace('#', '').toUpperCase()}
        onChange={(e) => {
          const v = e.target.value.replace('#', '');
          onChange('#' + v);
        }}
      />
      <span className="border-l border-[var(--color-line)] pl-2 font-mono text-[11px] text-[var(--color-ink-3)]">
        100%
      </span>
    </div>
  );
}

export function SwatchGrid({
  current,
  onPick,
}: {
  current: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {SWATCHES.map((c) => {
        const active = current.toUpperCase() === c.toUpperCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            title={c}
            style={{ background: c }}
            className={`aspect-square cursor-pointer rounded-md transition-transform hover:scale-110 ${
              active
                ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-paper)]'
                : 'shadow-[inset_0_0_0_1px_rgba(14,19,24,.08)]'
            }`}
          />
        );
      })}
    </div>
  );
}

function GradientControls({
  colors,
  angle,
  type,
  onChange,
}: {
  colors: string[];
  angle: number;
  type: BgType;
  onChange: (p: { colors?: string[]; angle?: number }) => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        {type === 'linear' && (
          <button
            type="button"
            onClick={() => onChange({ angle: (angle + 45) % 360 })}
            title="Rotate angle by 45°"
            className="relative h-12 w-12 flex-shrink-0 cursor-pointer rounded-full border border-[var(--color-line)] bg-[var(--color-paper-2)] transition-colors hover:border-[var(--color-accent)]"
          >
            <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)]" />
            <span
              className="absolute top-1/2 left-1/2 h-px w-1/2 origin-left bg-[var(--color-ink)]"
              style={{ transform: `rotate(${angle - 90}deg)` }}
            />
          </button>
        )}
        <div className="flex-1">
          <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-ink-3)]">
            {type === 'linear'
              ? `Angle · ${angle}°`
              : type === 'mesh'
                ? 'Mesh blobs'
                : type === 'conic'
                  ? 'Conic spin'
                  : 'Radial'}
          </div>
          <div
            className="relative h-7 overflow-visible rounded-md"
            style={{
              background: `linear-gradient(90deg, ${colors.join(', ')})`,
              boxShadow: 'inset 0 0 0 1px rgba(14,19,24,.08)',
            }}
          >
            {colors.map((c, i) => (
              <div
                key={i}
                className="absolute top-full mt-1.5 h-3 w-3 -translate-x-1/2 rounded-full ring-2 ring-white"
                style={{
                  left: `${(i / Math.max(1, colors.length - 1)) * 100}%`,
                  background: c,
                  boxShadow:
                    '0 0 0 1px rgba(14,19,24,.15), 0 2px 4px rgba(14,19,24,.1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 mb-2 text-[12px] font-semibold text-[var(--color-ink-3)]">
        Gradient palettes
      </div>
      <div className="flex flex-col gap-1">
        {GRADIENTS.map((g) => {
          const active = JSON.stringify(g.colors) === JSON.stringify(colors);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange({ colors: g.colors, angle: g.angle })}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                active
                  ? 'bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-paper-3)]'
              }`}
            >
              <div className="flex h-5 flex-1 overflow-hidden rounded-md">
                {g.colors.map((c, i) => (
                  <span
                    key={i}
                    className="flex-1"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div
                className={`min-w-[80px] text-[13px] font-semibold ${
                  active ? 'text-[var(--color-accent-2)]' : 'text-[var(--color-ink)]'
                }`}
              >
                {g.name}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
