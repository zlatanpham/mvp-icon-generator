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
      <div className="px-4 pt-4">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 transition-colors focus-within:border-[var(--color-accent)] focus-within:bg-white">
          <Search className="h-4 w-4 text-[var(--color-ink-4)]" />
          <input
            placeholder="Search icons"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-ink-4)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <SectionTitle>Curated</SectionTitle>
      <div className="grid grid-cols-5 gap-1 px-3">
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
            className={`grid aspect-square cursor-pointer place-items-center rounded-md transition-colors ${
              isActiveCurated(ico.id)
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]'
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

      <SectionTitle>All icons</SectionTitle>
      <div className="grid grid-cols-5 gap-1 px-3 pb-4">
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
              className={`grid aspect-square cursor-pointer place-items-center rounded-md transition-colors ${
                active
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          );
        })}
        {!icons && (
          <div className="col-span-5 py-6 text-center text-[12px] text-[var(--color-ink-3)]">
            Loading library…
          </div>
        )}
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5 pb-2 text-[12px] font-semibold text-[var(--color-ink-3)]">
      {children}
    </div>
  );
}
