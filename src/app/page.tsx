'use client';

import { DesignProvider } from '@/lib/studio/design';
import { Topbar } from '@/components/studio/topbar';
import { Sidebar } from '@/components/studio/sidebar';
import { Canvas } from '@/components/studio/canvas';
import { Properties } from '@/components/studio/properties';

export default function Home() {
  return (
    <DesignProvider>
      <div
        className="grid h-screen"
        style={{ gridTemplateRows: 'var(--topbar-h) 1fr' }}
      >
        <Topbar />
        <div
          className="grid min-h-0"
          style={{
            gridTemplateColumns: 'var(--rail-l) 1fr var(--rail-r)',
          }}
        >
          <Sidebar />
          <Canvas />
          <Properties />
        </div>
      </div>
    </DesignProvider>
  );
}
