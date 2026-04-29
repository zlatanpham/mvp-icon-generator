'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDesign } from '@/lib/studio/design';
import {
  ensureFontLoaded,
  fontStack,
  FONTS,
  FONT_CATS,
  type FontCategory,
} from '@/lib/studio/data/fonts';

export function LettersTab() {
  const { design, patchContent } = useDesign();
  const [cat, setCat] = useState<'All' | FontCategory>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Pre-load every font that appears in the visible list — keeps previews legible.
    FONTS.forEach((f) => ensureFontLoaded(f.name, f.weight));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      FONTS.filter((f) => {
        if (cat !== 'All' && f.cat !== cat) return false;
        if (q && !f.name.toLowerCase().includes(q)) return false;
        return true;
      }),
    [cat, q],
  );

  return (
    <>
      <div className="mt-[18px] mr-[22px] mb-1.5 ml-[22px] border-none bg-transparent p-0">
        <label className="font-mono text-[10px] font-medium tracking-[0.16em] text-[var(--color-ink-3)] uppercase">
          Your letters
        </label>
        <input
          maxLength={3}
          value={design.content.letters}
          onChange={(e) =>
            patchContent({
              mode: 'letters',
              letters: e.target.value.toUpperCase(),
            })
          }
          placeholder="A"
          className="mt-2.5 block w-full border border-[var(--color-ink)] bg-[var(--color-paper-2)] px-[18px] py-4 text-center font-serif text-[38px] leading-none font-bold tracking-[-0.02em] outline-none focus:bg-white"
        />
        <div className="mt-2 text-center font-serif text-[11.5px] text-[var(--color-ink-3)] italic">
          1 – 3 characters work best
        </div>
      </div>

      <div className="mx-[22px] mt-1.5 mb-2 flex h-[34px] items-center gap-2 border border-[var(--color-rule)] px-3.5 focus-within:border-[var(--color-ink)]">
        <Search className="h-[13px] w-[13px] text-[var(--color-ink-3)]" />
        <input
          placeholder="Search Google Fonts"
          className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--color-ink-3)] placeholder:italic"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-1 flex gap-0 overflow-x-auto border-b border-[var(--color-rule)] px-[22px] pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FONT_CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`mr-3.5 cursor-pointer border-b py-1.5 pr-2.5 font-mono text-[10px] font-medium tracking-[0.10em] whitespace-nowrap uppercase transition-colors ${
              cat === c
                ? 'border-[var(--color-accent)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="editorial-scroll flex max-h-[55vh] flex-col overflow-y-auto px-1 pt-1 pb-[22px]">
        {filtered.map((f) => {
          const active = design.content.font === f.name;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() =>
                patchContent({
                  mode: 'letters',
                  font: f.name,
                  fontWeight: f.weight,
                })
              }
              className={`flex items-baseline justify-between border-b border-[var(--color-rule)] px-[18px] py-4 text-left transition-colors ${
                active
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'hover:bg-[var(--color-paper-2)]'
              }`}
            >
              <div
                className="text-[30px] leading-none font-bold tracking-[-0.02em]"
                style={{
                  fontFamily: fontStack(f.name),
                  fontWeight: f.weight,
                  color: active ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
              >
                {(design.content.letters || 'Aa').slice(0, 2)}
              </div>
              <div className="text-right">
                <div
                  className="font-serif text-[13px] font-medium tracking-[-0.01em] italic"
                  style={{
                    color: active
                      ? 'var(--color-paper-3)'
                      : 'var(--color-ink-2)',
                  }}
                >
                  {f.name}
                </div>
                <div
                  className="mt-0.5 font-mono text-[9.5px] tracking-[0.14em] uppercase"
                  style={{
                    color: active
                      ? 'var(--color-paper-3)'
                      : 'var(--color-ink-3)',
                  }}
                >
                  {f.cat}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-6 text-center font-mono text-[10px] tracking-[0.12em] text-[var(--color-ink-3)] uppercase">
            No fonts match
          </div>
        )}
      </div>
    </>
  );
}
