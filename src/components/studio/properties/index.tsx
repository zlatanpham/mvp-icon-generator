'use client';

import { BackgroundSection } from './background-section';
import { IconColorSection } from './icon-color-section';
import { ShapeSection } from './shape-section';
import { PatternSection } from './pattern-section';
import { GrainSection } from './grain-section';

export function Properties() {
  return (
    <aside
      className="bg-rail-paper editorial-scroll flex min-h-0 flex-col overflow-y-auto border-l border-[var(--color-line)]"
      style={{ width: 'var(--rail-r)' }}
    >
      <div className="border-b border-[var(--color-line)] px-5 pt-5 pb-4">
        <div className="text-[18px] font-extrabold tracking-[-0.01em] text-[var(--color-ink)]">
          Customize
        </div>
        <div className="mt-1 text-[12px] text-[var(--color-ink-3)]">
          Background, shape, and texture
        </div>
      </div>

      <div className="flex-1">
        <PropSection title="Background">
          <BackgroundSection />
        </PropSection>
        <PropSection title="Icon color">
          <IconColorSection />
        </PropSection>
        <PropSection title="Shape">
          <ShapeSection />
        </PropSection>
        <PropSection title="Pattern overlay">
          <PatternSection />
        </PropSection>
        <PropSection title="Grain">
          <GrainSection />
        </PropSection>
      </div>
    </aside>
  );
}

function PropSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--color-line)] px-5 py-5 last:border-b-0">
      <div className="mb-3 text-[14px] font-bold text-[var(--color-ink)]">
        {title}
      </div>
      {children}
    </section>
  );
}
