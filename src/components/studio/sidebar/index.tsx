'use client';

import { useState } from 'react';
import { LayoutGrid, Type, Upload as UploadIcon } from 'lucide-react';
import { useDesign } from '@/lib/studio/design';
import { LibraryTab } from './library-tab';
import { LettersTab } from './letters-tab';
import { UploadTab } from './upload-tab';

type Tab = 'library' | 'letters' | 'upload';

export function Sidebar() {
  const { design, patchContent } = useDesign();
  const [tab, setTab] = useState<Tab>(
    design.content.mode === 'letters' ? 'letters' : 'library',
  );

  const switchTab = (next: Tab) => {
    setTab(next);
    if (next === 'letters' && design.content.mode !== 'letters') {
      patchContent({ mode: 'letters' });
    } else if (next !== 'letters' && design.content.mode === 'letters') {
      patchContent({ mode: 'icon' });
    }
  };

  return (
    <aside
      className="flex min-h-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-paper)]"
      style={{ width: 'var(--rail-l)' }}
    >
      <div className="flex border-b border-[var(--color-line)]">
        <RailTab
          active={tab === 'library'}
          onClick={() => switchTab('library')}
          icon={<LayoutGrid className="h-3.5 w-3.5" />}
          label="Library"
        />
        <RailTab
          active={tab === 'letters'}
          onClick={() => switchTab('letters')}
          icon={<Type className="h-3.5 w-3.5" />}
          label="Letters"
        />
        <RailTab
          active={tab === 'upload'}
          onClick={() => switchTab('upload')}
          icon={<UploadIcon className="h-3.5 w-3.5" />}
          label="Upload"
          last
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'library' && <LibraryTab />}
        {tab === 'letters' && <LettersTab />}
        {tab === 'upload' && <UploadTab />}
      </div>
    </aside>
  );
}

function RailTab({
  active,
  onClick,
  icon,
  label,
  last,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-2 py-3.5 font-mono text-[10.5px] font-medium tracking-[0.12em] uppercase transition-colors ${
        last ? '' : 'border-r border-[var(--color-line)]'
      } ${
        active
          ? 'bg-[var(--color-bg)] text-[var(--color-ink)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[var(--color-accent)]'
          : 'text-[var(--color-ink-3)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
