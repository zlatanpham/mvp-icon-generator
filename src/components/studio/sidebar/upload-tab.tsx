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
      const next = [uploaded, ...recent.filter((r) => r.id !== uploaded.id)].slice(
        0,
        MAX_RECENT,
      );
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
    const item = recent.find((r) => r.id === id);
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
        iconPath:
          'M12 2L14 9.5L21.5 11L14.5 13L12 21L10 13L2.5 11L10.5 9.5Z',
        uploadedSvgId: undefined,
      });
    }
  };

  return (
    <>
      <label
        className={`relative mt-[18px] mr-[22px] mb-3.5 ml-[22px] block cursor-pointer border border-dashed p-[38px_18px] text-center transition-colors ${
          dragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
            : 'border-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
      >
        <div className="mx-auto mb-3.5 grid h-10 w-10 place-items-center border border-[var(--color-ink)] text-[var(--color-ink)]">
          <Upload className="h-[18px] w-[18px]" />
        </div>
        <div className="font-serif text-[18px] font-bold tracking-[-0.01em]">
          Drop a file or browse
        </div>
        <div className="mt-1 font-serif text-[13px] text-[var(--color-ink-3)] italic">
          {busy ? 'Processing…' : 'Use your own logo or icon'}
        </div>
        <div className="mt-3.5 font-mono text-[9.5px] tracking-[0.18em] text-[var(--color-ink-3)] uppercase">
          SVG · 2 MB max
        </div>
        <input
          type="file"
          accept=".svg,image/svg+xml"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
          disabled={busy}
        />
      </label>

      {error && (
        <div className="mx-[22px] mb-2 border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-2 text-[11px] text-[var(--color-accent-2)]">
          {error}
        </div>
      )}

      <div className="mt-[18px] flex items-baseline justify-between border-t border-[var(--color-rule)] px-[22px] pt-[22px] pb-2.5 font-mono text-[10px] font-medium tracking-[0.16em] text-[var(--color-ink-3)] uppercase">
        <span>
          <span className="mr-2 text-[var(--color-ink-4)]">02 /</span>
          Recent uploads
        </span>
      </div>

      <div className="mx-[22px] grid grid-cols-4 gap-px bg-[var(--color-rule)]">
        {Array.from({ length: MAX_RECENT }).map((_, i) => {
          const item = recent[i];
          if (!item) {
            return (
              <div
                key={i}
                className="grid aspect-square place-items-center bg-[var(--color-paper-2)] text-[var(--color-ink-3)]"
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
              className={`group relative grid aspect-square place-items-center bg-[var(--color-paper-2)] ${
                active ? 'outline outline-[2px] outline-[var(--color-ink)]' : ''
              }`}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                title="Remove"
                aria-label="Remove uploaded icon"
                className="absolute top-1 right-1 hidden cursor-pointer rounded-sm bg-[var(--color-paper)] p-0.5 text-[var(--color-ink-3)] hover:text-[var(--color-accent)] group-hover:block"
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
