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
      <div className="px-4 pt-4">
        <label className="mb-2 block text-[12px] font-semibold text-[var(--color-ink-3)]">
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
          className="block w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-4 text-center text-[36px] leading-none font-bold tracking-[-0.02em] outline-none transition-colors focus:border-[var(--color-accent)] focus:bg-white"
        />
        <div className="mt-2 text-center text-[12px] text-[var(--color-ink-3)]">
          1–3 characters work best
        </div>
      </div>

      <div className="px-4 pt-3 pb-2">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 transition-colors focus-within:border-[var(--color-accent)] focus-within:bg-white">
          <Search className="h-4 w-4 text-[var(--color-ink-4)]" />
          <input
            placeholder="Search Google Fonts"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-ink-4)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="editorial-scroll flex gap-1.5 overflow-x-auto px-4 pt-1 pb-3">
        {FONT_CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap transition-colors ${
              cat === c
                ? 'bg-[var(--color-ink)] text-white'
                : 'bg-[var(--color-paper-3)] text-[var(--color-ink-3)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 px-3 pb-4">
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
              className={`flex items-center justify-between rounded-lg px-3 py-3 text-left transition-colors ${
                active
                  ? 'bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-paper-3)]'
              }`}
            >
              <div
                className="text-[28px] leading-none font-bold tracking-[-0.02em] text-[var(--color-ink)]"
                style={{
                  fontFamily: fontStack(f.name),
                  fontWeight: f.weight,
                }}
              >
                {(design.content.letters || 'Aa').slice(0, 2)}
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {f.name}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--color-ink-3)]">
                  {f.cat}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-[12px] text-[var(--color-ink-3)]">
            No fonts match
          </div>
        )}
      </div>
    </>
  );
}
