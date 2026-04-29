'use client';

import { useDesign, type BgType } from '@/lib/studio/design';
import { BG_TYPES } from '@/lib/studio/data/bg-types';
import { SWATCHES } from '@/lib/studio/data/swatches';
import { GRADIENTS } from '@/lib/studio/data/gradients';
import { backgroundCss } from '@/lib/studio/render/background-css';
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
      <div className="mb-3.5 grid grid-cols-4 border border-[var(--color-rule)]">
        {BG_TYPES.map((t, i) => (
          <BgTypeButton
            key={t.id}
            id={t.id}
            label={t.label}
            active={isActive(t.id)}
            onClick={() => onTypeClick(t.id)}
            isLastRow={i >= 4}
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
  isLastRow,
}: {
  id: BgType;
  label: string;
  active: boolean;
  onClick: () => void;
  isLastRow: boolean;
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
      className={`relative grid aspect-square cursor-pointer place-items-center overflow-hidden border-r border-b border-[var(--color-rule)] [&:nth-child(4n)]:border-r-0 ${
        isLastRow ? 'border-b-0' : ''
      } ${active ? 'bg-[var(--color-ink)]' : 'bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)]'}`}
    >
      <div
        className="h-1/2 w-3/5 overflow-hidden"
        style={swatchStyle}
      />
      <div
        className="absolute right-0 bottom-1 left-0 text-center font-mono text-[8px] font-medium tracking-[0.12em] uppercase"
        style={{
          color: active ? 'var(--color-paper)' : 'var(--color-ink-3)',
        }}
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
      <div className="mt-2.5 mb-1.5 font-serif text-[13px] font-bold tracking-[-0.01em]">
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
    <div className="flex items-center gap-2.5 border border-[var(--color-rule)] bg-transparent p-2 px-2.5 focus-within:border-[var(--color-ink)]">
      <div
        className="h-[26px] w-[26px] flex-shrink-0 border border-[var(--color-ink)]"
        style={{ background: value }}
      />
      <input
        className="flex-1 bg-transparent font-mono text-[12px] tracking-[0.06em] text-[var(--color-ink)] uppercase outline-none"
        value={value.replace('#', '').toUpperCase()}
        onChange={(e) => {
          const v = e.target.value.replace('#', '');
          onChange('#' + v);
        }}
      />
      <span className="border-l border-[var(--color-rule)] pl-2.5 font-mono text-[11px] text-[var(--color-ink-3)]">
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
    <div className="grid grid-cols-8 border border-[var(--color-rule)]">
      {SWATCHES.map((c, i) => {
        const active = current.toUpperCase() === c.toUpperCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            title={c}
            style={{ background: c }}
            className={`relative aspect-square cursor-pointer border-r border-[var(--color-rule)] transition-transform [&:nth-child(8n)]:border-r-0 hover:z-[2] hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.20)] ${
              active
                ? 'z-[1] [box-shadow:inset_0_0_0_2px_var(--color-ink),inset_0_0_0_4px_var(--color-paper)]'
                : ''
            } ${i >= SWATCHES.length - 8 ? '' : 'border-b border-[var(--color-rule)]'}`}
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
      <div className="mb-3 flex items-center gap-2.5">
        {type === 'linear' && (
          <button
            type="button"
            onClick={() => onChange({ angle: (angle + 45) % 360 })}
            title="Rotate angle by 45°"
            className="relative h-14 w-14 flex-shrink-0 cursor-pointer rounded-full border border-[var(--color-ink)]"
          >
            <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)]" />
            <span
              className="absolute top-1/2 left-1/2 h-px w-1/2 origin-left bg-[var(--color-ink)]"
              style={{ transform: `rotate(${angle - 90}deg)` }}
            />
          </button>
        )}
        <div className="flex-1">
          <div className="mb-1 font-mono text-[10px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
            {type === 'linear'
              ? `Angle · ${angle}°`
              : type === 'mesh'
                ? 'Mesh blobs'
                : type === 'conic'
                  ? 'Conic spin'
                  : 'Radial'}
          </div>
          <div
            className="relative mt-1 h-[22px] overflow-visible border border-[var(--color-ink)]"
            style={{
              background: `linear-gradient(90deg, ${colors.join(', ')})`,
            }}
          >
            {colors.map((c, i) => (
              <div
                key={i}
                className="absolute top-full mt-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 cursor-pointer border border-[var(--color-ink)]"
                style={{
                  left: `${(i / Math.max(1, colors.length - 1)) * 100}%`,
                  background: c,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 mb-2 font-serif text-[13px] font-bold tracking-[-0.01em]">
        Gradient palettes
      </div>
      <div className="flex flex-col border border-[var(--color-rule)]">
        {GRADIENTS.map((g) => {
          const active = JSON.stringify(g.colors) === JSON.stringify(colors);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange({ colors: g.colors, angle: g.angle })}
              className={`flex w-full cursor-pointer items-center gap-3 border-b border-[var(--color-rule)] px-3 py-2.5 text-left transition-colors last:border-b-0 ${
                active
                  ? 'bg-[var(--color-ink)]'
                  : 'hover:bg-[var(--color-paper-2)]'
              }`}
            >
              <div className="flex h-6 flex-1 overflow-hidden">
                {g.colors.map((c, i) => (
                  <span
                    key={i}
                    className="flex-1"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div
                className="min-w-[80px] font-serif text-[13px] font-medium tracking-[-0.01em] italic"
                style={{
                  color: active ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
              >
                {g.name}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-center font-mono text-[9px] tracking-[0.14em] text-[var(--color-ink-3)] uppercase">
        Click the angle pad to rotate · pick a palette below
      </div>

      {/* fallback: switch back to solid */}
      <SolidShortcut />
    </>
  );
}

function SolidShortcut() {
  // Helper to keep solid color editable even while in a gradient bg type:
  // gradients reuse design.bg.gradient.colors, but the user might want to swap
  // into solid quickly. We expose a small swatch row tied to bg.color here.
  const { design, patchBg } = useDesign();
  return (
    <div className="mt-4">
      <div className="mb-1.5 font-mono text-[10px] font-medium tracking-[0.10em] text-[var(--color-ink-3)] uppercase">
        Base color (also used by Pattern)
      </div>
      <SwatchGrid current={design.bg.color} onPick={(c) => patchBg({ color: c })} />
    </div>
  );
}
