'use client';

import { useDesign } from '@/lib/studio/design';
import { Switch } from '@/components/ui/switch';
import { ColorRow } from './background-section';

export function IconColorSection() {
  const { design, setDesign, patchContent } = useDesign();
  return (
    <>
      <ColorRow
        value={design.foreground}
        onChange={c => setDesign(d => ({ ...d, foreground: c }))}
      />
      {design.content.mode === 'icon' && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--color-paper-2)] px-3 py-2.5">
          <span className="text-[13px] font-medium text-[var(--color-ink)]">
            Filled icon
          </span>
          <Switch
            checked={design.content.filled}
            onCheckedChange={v => patchContent({ filled: v })}
          />
        </div>
      )}
    </>
  );
}
