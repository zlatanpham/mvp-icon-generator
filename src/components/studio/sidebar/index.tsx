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
      <div className="flex gap-1 border-b border-[var(--color-line)] p-2">
        <RailTab
          active={tab === 'library'}
          onClick={() => switchTab('library')}
          icon={<LayoutGrid className="h-4 w-4" />}
          label="Library"
        />
        <RailTab
          active={tab === 'letters'}
          onClick={() => switchTab('letters')}
          icon={<Type className="h-4 w-4" />}
          label="Letters"
        />
        <RailTab
          active={tab === 'upload'}
          onClick={() => switchTab('upload')}
          icon={<UploadIcon className="h-4 w-4" />}
          label="Upload"
        />
      </div>
      <div className="editorial-scroll flex flex-1 flex-col overflow-y-auto">
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
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]'
          : 'text-[var(--color-ink-3)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
