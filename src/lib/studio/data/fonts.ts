export type FontCategory =
  | 'Sans'
  | 'Serif'
  | 'Display'
  | 'Mono'
  | 'Handwriting';

export type StudioFont = {
  name: string;
  cat: FontCategory;
  weight: number;
};

export const FONTS: StudioFont[] = [
  { name: 'Plus Jakarta Sans', cat: 'Sans', weight: 800 },
  { name: 'Inter', cat: 'Sans', weight: 700 },
  { name: 'Space Grotesk', cat: 'Sans', weight: 700 },
  { name: 'Outfit', cat: 'Sans', weight: 800 },
  { name: 'Bricolage Grotesque', cat: 'Display', weight: 800 },
  { name: 'Archivo Black', cat: 'Display', weight: 400 },
  { name: 'Playfair Display', cat: 'Serif', weight: 800 },
  { name: 'DM Serif Display', cat: 'Serif', weight: 400 },
  { name: 'Fraunces', cat: 'Serif', weight: 800 },
  { name: 'Lora', cat: 'Serif', weight: 700 },
  { name: 'JetBrains Mono', cat: 'Mono', weight: 700 },
  { name: 'DM Mono', cat: 'Mono', weight: 500 },
  { name: 'Caveat', cat: 'Handwriting', weight: 700 },
  { name: 'Pacifico', cat: 'Handwriting', weight: 400 },
];

export const FONT_CATS: Array<'All' | FontCategory> = [
  'All',
  'Sans',
  'Serif',
  'Display',
  'Mono',
  'Handwriting',
];

const ALWAYS_LOADED = new Set(['Inter', 'Fraunces', 'JetBrains Mono']);
const injectedFonts = new Set<string>();

/**
 * Lazily inject a Google Fonts stylesheet for a font we don't bundle via next/font.
 * Inter / Fraunces / JetBrains Mono are loaded by next/font in layout.tsx and skipped here.
 */
export function ensureFontLoaded(name: string, weight: number): void {
  if (typeof document === 'undefined') return;
  if (ALWAYS_LOADED.has(name)) return;
  const key = `${name}@${weight}`;
  if (injectedFonts.has(key)) return;
  injectedFonts.add(key);

  const family = name.replace(/ /g, '+');
  const href = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.studioFont = key;
  document.head.appendChild(link);
}

export function fontStack(name: string): string {
  return `'${name}', system-ui, sans-serif`;
}
