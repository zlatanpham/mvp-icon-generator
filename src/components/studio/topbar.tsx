'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useDesign } from '@/lib/studio/design';
import { exportDesign } from '@/lib/studio/export';

export function Topbar() {
  const { design, setDesign } = useDesign();
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await exportDesign(design);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. See console for details.');
    } finally {
      setBusy(false);
    }
  };

  const year = new Date().getFullYear();

  return (
    <header
      className="z-10 flex items-center gap-[18px] border-b border-[var(--color-line)] bg-[var(--color-paper)] px-[22px]"
      style={{ height: 'var(--topbar-h)' }}
    >
      <div className="flex items-baseline gap-2.5">
        <div className="text-[26px] leading-none font-serif font-black italic tracking-[-0.04em] text-[var(--color-ink)]">
          Atelier
          <span className="ml-0.5 text-[var(--color-accent)]">·</span>
        </div>
        <div className="self-center border-l border-[var(--color-rule)] pl-3 font-mono text-[9.5px] tracking-[0.16em] text-[var(--color-ink-3)] uppercase">
          No. 02 · Vol. {year}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2.5 font-mono text-[12px] tracking-[0.04em] text-[var(--color-ink-3)] uppercase">
        <span>Workspace</span>
        <span className="text-[var(--color-ink-4)]">—</span>
        <input
          aria-label="File name"
          className="w-[180px] border-b border-transparent bg-transparent py-0.5 font-serif text-[16px] font-medium tracking-[-0.02em] text-[var(--color-ink)] italic normal-case outline-none focus:border-[var(--color-ink)]"
          value={design.name}
          onChange={(e) => setDesign((d) => ({ ...d, name: e.target.value }))}
        />
      </div>

      <button
        onClick={handleExport}
        disabled={busy}
        className="ml-[18px] inline-flex h-[34px] cursor-pointer items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-ink)] px-[18px] font-mono text-[12px] font-medium tracking-[0.10em] text-[var(--color-paper)] uppercase transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] disabled:cursor-progress disabled:opacity-70"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{busy ? 'Exporting…' : 'Export'}</span>
      </button>
    </header>
  );
}
