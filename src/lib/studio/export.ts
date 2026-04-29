import type { Design } from './design';

/**
 * Trigger the full PWA export for a Design. Implementation lives in
 * `src/lib/icon-generator.ts`; this thin wrapper keeps studio code decoupled
 * from the export internals.
 */
export async function exportDesign(design: Design): Promise<void> {
  const { generateDesignZip } = await import('@/lib/icon-generator');
  const zip = await generateDesignZip(design);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(design.name) || 'icons'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
