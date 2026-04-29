'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDesign } from '@/lib/studio/design';
import { CURATED_ICONS } from '@/lib/studio/data/icons';

type LucideIconMap = Record<
  string,
  React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    color?: string;
  }>
>;

export function LibraryTab() {
  const { design, patchContent } = useDesign();
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<LucideIconMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('lucide-react').then((mod) => {
      if (cancelled) return;
      const map = (mod as unknown as { icons: LucideIconMap }).icons;
      setIcons(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().toLowerCase();

  const filteredCurated = useMemo(
    () =>
      CURATED_ICONS.filter((i) =>
        q ? i.name.toLowerCase().includes(q) : true,
      ),
    [q],
  );

  const lucideNames = useMemo(() => {
    if (!icons) return [] as string[];
    const all = Object.keys(icons).sort((a, b) => a.localeCompare(b));
    if (!q) return all.slice(0, 300);
    return all.filter((n) => n.toLowerCase().includes(q)).slice(0, 300);
  }, [icons, q]);

  const isActiveCurated = (id: string) =>
    design.content.mode === 'icon' &&
    design.content.iconSource === 'curated' &&
    design.content.iconId === id;

  const isActiveLucide = (name: string) =>
    design.content.mode === 'icon' &&
    design.content.iconSource === 'lucide' &&
    design.content.iconId === name;

  return (
    <>
      <div className="px-[22px] pt-[18px]">
        <div className="flex h-[38px] items-center gap-2 border border-[var(--color-rule)] px-3.5 focus-within:border-[var(--color-ink)]">
          <Search className="h-3.5 w-3.5 text-[var(--color-ink-3)]" />
          <input
            placeholder="Search icons"
            className="flex-1 bg-transparent text-[12px] tracking-[0.02em] outline-none placeholder:text-[var(--color-ink-3)] placeholder:italic"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <SectionTitle index={1}>Curated</SectionTitle>
      <div className="editorial-scroll mx-1 grid grid-cols-5 border-t border-[var(--color-rule)]">
        {filteredCurated.map((ico) => (
          <button
            key={ico.id}
            type="button"
            title={ico.name}
            onClick={() =>
              patchContent({
                mode: 'icon',
                iconSource: 'curated',
                iconId: ico.id,
                iconName: ico.name,
                iconPath: ico.svg,
              })
            }
            className={`grid aspect-square cursor-pointer place-items-center border-r border-b border-[var(--color-rule)] transition-colors [&:nth-child(5n)]:border-r-0 ${
              isActiveCurated(ico.id)
                ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px]"
            >
              <path d={ico.svg} />
            </svg>
          </button>
        ))}
      </div>

      <SectionTitle index={2}>Lucide library</SectionTitle>
      <div className="editorial-scroll mx-1 grid max-h-[40vh] grid-cols-5 overflow-y-auto border-t border-[var(--color-rule)]">
        {lucideNames.map((name) => {
          const Icon = icons?.[name];
          if (!Icon) return null;
          const active = isActiveLucide(name);
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() =>
                patchContent({
                  mode: 'icon',
                  iconSource: 'lucide',
                  iconId: name,
                  iconName: name,
                  iconPath: undefined,
                })
              }
              className={`grid aspect-square cursor-pointer place-items-center border-r border-b border-[var(--color-rule)] transition-colors [&:nth-child(5n)]:border-r-0 ${
                active
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          );
        })}
        {!icons && (
          <div className="col-span-5 p-6 text-center font-mono text-[10px] tracking-[0.12em] text-[var(--color-ink-3)] uppercase">
            Loading library…
          </div>
        )}
      </div>
    </>
  );
}

function SectionTitle({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[18px] flex items-baseline justify-between border-t border-[var(--color-rule)] px-[22px] pt-[22px] pb-2.5 font-mono text-[10px] font-medium tracking-[0.16em] text-[var(--color-ink-3)] uppercase">
      <span>
        <span className="mr-2 text-[var(--color-ink-4)]">
          {index.toString().padStart(2, '0')} /
        </span>
        {children}
      </span>
    </div>
  );
}
