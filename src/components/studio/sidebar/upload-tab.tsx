'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { SvgProcessor, type UploadedSvg } from '@/lib/svg-processor';
import { SvgStorage } from '@/lib/svg-storage';
import { useDesign } from '@/lib/studio/design';

const MAX_RECENT = 8;

export function UploadTab() {
  const { design, patchContent } = useDesign();
  const [recent, setRecent] = useState<UploadedSvg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage on mount. The lint rule for "setState in
    // effect" doesn't apply here — we're syncing in from an external store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(SvgStorage.loadUploadedSvgs());
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const result = await SvgProcessor.processSvgFile(file);
      if (!result.isValid) {
        setError(result.error ?? 'Invalid SVG');
        return;
      }
      const uploaded = SvgProcessor.createUploadedSvg(file, result);
      const next = [
        uploaded,
        ...recent.filter(r => r.id !== uploaded.id),
      ].slice(0, MAX_RECENT);
      SvgStorage.saveUploadedSvgs(next);
      setRecent(next);
      patchContent({
        mode: 'icon',
        iconSource: 'uploaded',
        iconId: uploaded.id,
        iconName: uploaded.name,
        uploadedSvgId: uploaded.id,
        iconPath: undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onSelect = (id: string) => {
    const item = recent.find(r => r.id === id);
    if (!item) return;
    patchContent({
      mode: 'icon',
      iconSource: 'uploaded',
      iconId: item.id,
      iconName: item.name,
      uploadedSvgId: item.id,
      iconPath: undefined,
    });
  };

  const onRemove = (id: string) => {
    const next = SvgStorage.removeUploadedSvg(id, recent);
    setRecent(next);
    if (
      design.content.iconSource === 'uploaded' &&
      design.content.uploadedSvgId === id
    ) {
      patchContent({
        mode: 'icon',
        iconSource: 'curated',
        iconId: 'spark',
        iconName: 'Spark',
        iconPath: 'M12 2L14 9.5L21.5 11L14.5 13L12 21L10 13L2.5 11L10.5 9.5Z',
        uploadedSvgId: undefined,
      });
    }
  };

  return (
    <>
      <label
        className={`relative mx-4 mt-4 mb-3 block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
            : 'border-[var(--color-line)] bg-[var(--color-paper-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]'
        }`}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
      >
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-[14px] font-semibold text-[var(--color-ink)]">
          Drop a file or browse
        </div>
        <div className="mt-1 text-[12px] text-[var(--color-ink-3)]">
          {busy ? 'Processing…' : 'Use your own logo or icon'}
        </div>
        <div className="mt-3 text-[11px] font-medium text-[var(--color-ink-4)]">
          SVG · 2 MB max
        </div>
        <input
          type="file"
          accept=".svg,image/svg+xml"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
          disabled={busy}
        />
      </label>

      {error && (
        <div className="mx-4 mb-2 rounded-md border border-[var(--color-destructive)] bg-red-50 p-2 text-[12px] text-[var(--color-destructive)]">
          {error}
        </div>
      )}

      <div className="px-4 pt-3 pb-2 text-[12px] font-semibold text-[var(--color-ink-3)]">
        Recent uploads
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pb-4">
        {Array.from({ length: MAX_RECENT }).map((_, i) => {
          const item = recent[i];
          if (!item) {
            return (
              <div
                key={i}
                className="grid aspect-square place-items-center rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-paper-2)] text-[var(--color-ink-4)]"
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </div>
            );
          }
          const active =
            design.content.iconSource === 'uploaded' &&
            design.content.uploadedSvgId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative grid aspect-square place-items-center overflow-hidden rounded-md border transition ${
                active
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
                  : 'border-[var(--color-line)] hover:border-[var(--color-ink-4)]'
              }`}
              style={{
                backgroundColor: 'var(--color-paper-2)',
                backgroundImage:
                  'linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
              }}
            >
              <button
                type="button"
                title={item.name}
                onClick={() => onSelect(item.id)}
                className="grid h-full w-full cursor-pointer place-items-center"
                dangerouslySetInnerHTML={{
                  __html: item.sanitizedSvg.replace(
                    /<svg([^>]*)>/i,
                    '<svg$1 width="20" height="20" style="max-width:60%;max-height:60%;color:var(--color-ink)">',
                  ),
                }}
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                title="Remove"
                aria-label="Remove uploaded icon"
                className="shadow-soft absolute top-1 right-1 hidden cursor-pointer rounded-full bg-white p-0.5 text-[var(--color-ink-3)] group-hover:block hover:text-[var(--color-destructive)]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
