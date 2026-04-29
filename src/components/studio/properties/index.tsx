'use client';

import { useDesign } from '@/lib/studio/design';
import { BackgroundSection } from './background-section';
import { IconColorSection } from './icon-color-section';
import { ShapeSection } from './shape-section';
import { PatternSection } from './pattern-section';
import { GrainSection } from './grain-section';

export function Properties() {
  const { design } = useDesign();
  return (
    <aside
      className="editorial-scroll flex min-h-0 flex-col overflow-y-auto border-l border-[var(--color-line)] bg-[var(--color-paper)]"
      style={{ width: 'var(--rail-r)' }}
    >
      <div className="border-b border-[var(--color-line)] px-[22px] pt-[18px] pb-4">
        <div className="font-serif text-[24px] leading-none font-black tracking-[-0.025em]">
          The{' '}
          <em className="font-medium text-[var(--color-accent)] italic">
            Properties
          </em>
        </div>
        <div className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-[var(--color-ink-3)] uppercase">
          Background · Shape · Texture
        </div>
      </div>

      <div className="flex-1">
        <PropSection index={1} title="Background">
          <BackgroundSection />
        </PropSection>
        <PropSection index={2} title="Icon color">
          <IconColorSection />
        </PropSection>
        <PropSection index={3} title="Shape">
          <ShapeSection />
        </PropSection>
        <PropSection index={4} title="Pattern overlay">
          <PatternSection />
        </PropSection>
        <PropSection index={5} title="Grain">
          <GrainSection />
        </PropSection>
        <div className="px-[22px] py-4 text-center font-serif text-[11px] text-[var(--color-ink-3)] italic">
          Crafted from {design.content.mode === 'letters' ? 'glyphs' : 'paths'}{' '}
          · in your browser
        </div>
      </div>
    </aside>
  );
}

function PropSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative border-b border-[var(--color-rule)] px-[22px] py-[18px] last:border-b-0">
      <span className="absolute top-[18px] right-[22px] font-mono text-[9px] tracking-[0.12em] text-[var(--color-ink-4)]">
        {index.toString().padStart(2, '0')}
      </span>
      <div className="mb-3 pr-8 font-serif text-[16px] font-bold tracking-[-0.01em] text-[var(--color-ink)]">
        {title}
      </div>
      {children}
    </section>
  );
}
