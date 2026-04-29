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

  return (
    <header
      className="border-canva-strip z-10 flex items-center gap-4 bg-[var(--color-paper)] px-5"
      style={{ height: 'var(--topbar-h)' }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-canva-gradient text-white">
          <span className="text-[13px] font-extrabold leading-none">A</span>
        </div>
        <div className="text-[18px] font-extrabold tracking-[-0.01em] text-[var(--color-ink)]">
          Atelier
        </div>
      </div>

      <div className="ml-2 flex items-center gap-2 text-[13px] text-[var(--color-ink-3)]">
        <span>/</span>
        <input
          aria-label="File name"
          className="w-[200px] rounded-md border border-transparent bg-transparent px-2 py-1 text-[14px] font-medium text-[var(--color-ink)] outline-none transition-colors hover:border-[var(--color-line)] focus:border-[var(--color-accent)] focus:bg-white"
          value={design.name}
          onChange={(e) => setDesign((d) => ({ ...d, name: e.target.value }))}
        />
      </div>

      <div className="ml-auto">
        <button
          onClick={handleExport}
          disabled={busy}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-canva-gradient px-5 text-[13px] font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-progress disabled:opacity-70"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{busy ? 'Exporting…' : 'Export'}</span>
        </button>
      </div>
    </header>
  );
}
