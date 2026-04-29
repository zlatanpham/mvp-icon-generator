// === Icon library (inline SVG path data) ===
// Custom geometric/abstract icons — drawn fresh for this tool, not lifted from any branded set
const ICONS = [
  { id: 'spark', name: 'Spark', svg: 'M12 2L14 9.5L21.5 11L14.5 13L12 21L10 13L2.5 11L10.5 9.5Z' },
  { id: 'orbit', name: 'Orbit', svg: 'M12 4 a8 8 0 1 0 0 16 a8 8 0 1 0 0 -16 M12 8 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8 M4 12 L8 12 M16 12 L20 12 M12 4 L12 8 M12 16 L12 20' },
  { id: 'bolt', name: 'Bolt', svg: 'M13 2L3 14h7l-1 8L19 10h-7l1-8z' },
  { id: 'heart', name: 'Heart', svg: 'M12 21s-7-4.5-9.5-9C1 8.5 3.5 4 8 4c2 0 3 1 4 2.5C13 5 14 4 16 4c4.5 0 7 4.5 5.5 8-2.5 4.5-9.5 9-9.5 9z' },
  { id: 'star', name: 'Star', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'cube', name: 'Cube', svg: 'M12 2l9 5v10l-9 5-9-5V7l9-5z M3 7l9 5 9-5 M12 12v10' },
  { id: 'leaf', name: 'Leaf', svg: 'M11 20A7 7 0 0 1 4 13c0-7 7-11 17-11 0 10-4 17-11 17 M5 22c1-3 4-6 7-7' },
  { id: 'flame', name: 'Flame', svg: 'M12 2c1 4 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-5C9 4 11 3 12 2z M12 22a6 6 0 0 0 6-6c0-2-1-3-2-4-1 2-2 3-4 3s-3-1-4-3c-1 1-2 2-2 4a6 6 0 0 0 6 6z' },
  { id: 'wave', name: 'Wave', svg: 'M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0 M2 6c2-4 4-4 6 0s4 4 6 0 4-4 6 0 M2 18c2-4 4-4 6 0s4 4 6 0 4-4 6 0' },
  { id: 'compass', name: 'Compass', svg: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16 8l-2 6-6 2 2-6 6-2z' },
  { id: 'cloud', name: 'Cloud', svg: 'M7 18a5 5 0 0 1 0-10 7 7 0 0 1 13 2 4 4 0 0 1 1 8H7z' },
  { id: 'rocket', name: 'Rocket', svg: 'M12 2c4 2 7 6 7 11l-3 3v3l-4-2-4 2v-3l-3-3c0-5 3-9 7-11z M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z' },
  { id: 'gem', name: 'Gem', svg: 'M6 3h12l3 6-9 12L3 9l3-6z M3 9h18 M9 3l-3 6 6 12 6-12-3-6 M9 3h6' },
  { id: 'puzzle', name: 'Puzzle', svg: 'M9 4a2 2 0 0 1 4 0v2h4v4a2 2 0 0 0 0 4v4h-4v-2a2 2 0 1 0-4 0v2H5v-4a2 2 0 0 1 0-4V6h4V4z' },
  { id: 'shield', name: 'Shield', svg: 'M12 2l8 3v7c0 5-4 9-8 10-4-1-8-5-8-10V5l8-3z' },
  { id: 'globe', name: 'Globe', svg: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2c3 3 5 7 5 10s-2 7-5 10c-3-3-5-7-5-10s2-7 5-10z' },
  { id: 'flask', name: 'Flask', svg: 'M9 2h6v5l5 11a3 3 0 0 1-3 4H7a3 3 0 0 1-3-4L9 7V2z M9 11h6' },
  { id: 'feather', name: 'Feather', svg: 'M21 3c-2 8-9 12-13 12L3 20l4-1c0-4 4-11 12-13 M14 10l-7 7' },
  { id: 'crown', name: 'Crown', svg: 'M3 8l4 4 5-7 5 7 4-4-2 12H5L3 8z M5 20h14' },
  { id: 'eye', name: 'Eye', svg: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { id: 'pin', name: 'Pin', svg: 'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { id: 'music', name: 'Music', svg: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
  { id: 'camera', name: 'Camera', svg: 'M3 7h4l2-3h6l2 3h4v13H3V7z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { id: 'book', name: 'Book', svg: 'M4 3h7a3 3 0 0 1 3 3v15a2 2 0 0 0-2-2H4V3z M20 3h-7a3 3 0 0 0-3 3v15a2 2 0 0 1 2-2h8V3z' },
  { id: 'flag', name: 'Flag', svg: 'M5 3v18 M5 4h13l-3 5 3 5H5' },
  { id: 'mail', name: 'Mail', svg: 'M3 5h18v14H3V5z M3 5l9 8 9-8' },
  { id: 'mic', name: 'Mic', svg: 'M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v4 M8 22h8' },
  { id: 'play', name: 'Play', svg: 'M5 3l16 9-16 9V3z' },
  { id: 'tag', name: 'Tag', svg: 'M3 12V3h9l9 9-9 9-9-9z M8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { id: 'mountain', name: 'Mountain', svg: 'M2 21l8-14 5 9 3-5 4 10H2z M9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
];

// === Curated palettes (mostly modern, color-rich) ===
const PALETTES = [
  { id: 'sunset', name: 'Sunset', colors: ['#FF6B6B', '#FFA94D', '#FFD93D'] },
  { id: 'ocean', name: 'Ocean', colors: ['#4FACFE', '#00C9FF', '#0FB1A6'] },
  { id: 'lavender', name: 'Lavender', colors: ['#8B5CF6', '#EC4899', '#F472B6'] },
  { id: 'forest', name: 'Forest', colors: ['#10B981', '#059669', '#064E3B'] },
  { id: 'peach', name: 'Peach', colors: ['#FFB199', '#FF6B6B', '#C44569'] },
  { id: 'midnight', name: 'Midnight', colors: ['#0F172A', '#1E293B', '#475569'] },
  { id: 'candy', name: 'Candy', colors: ['#FF80AB', '#FF80FF', '#80D8FF'] },
  { id: 'citrus', name: 'Citrus', colors: ['#FBBF24', '#84CC16', '#22D3EE'] },
  { id: 'mono', name: 'Mono', colors: ['#1A1A1F', '#52525B', '#A1A1AA'] },
  { id: 'rose', name: 'Rose Gold', colors: ['#FFB6A0', '#E9967A', '#B76E79'] },
];

// === Solid swatches (16) ===
const SWATCHES = [
  '#1A1A1F', '#FFFFFF', '#F472B6', '#EC4899',
  '#EF4444', '#F97316', '#F59E0B', '#FBBF24',
  '#84CC16', '#10B981', '#14B8A6', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'
];

// === Gradient presets ===
const GRADIENTS = [
  { id: 'g1', name: 'Tangerine', colors: ['#FF6B35', '#F7931E'], angle: 135 },
  { id: 'g2', name: 'Berry', colors: ['#8E2DE2', '#4A00E0'], angle: 135 },
  { id: 'g3', name: 'Lagoon', colors: ['#0093E9', '#80D0C7'], angle: 160 },
  { id: 'g4', name: 'Mint', colors: ['#00DBDE', '#FC00FF'], angle: 90 },
  { id: 'g5', name: 'Coral', colors: ['#FF512F', '#F09819'], angle: 135 },
  { id: 'g6', name: 'Lilac', colors: ['#A18CD1', '#FBC2EB'], angle: 180 },
  { id: 'g7', name: 'Aurora', colors: ['#3B82F6', '#8B5CF6', '#EC4899'], angle: 135 },
  { id: 'g8', name: 'Forest', colors: ['#134E5E', '#71B280'], angle: 135 },
];

// === Background type definitions ===
const BG_TYPES = [
  { id: 'solid', label: 'Solid' },
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'noise', label: 'Grain' },
];

// === Patterns ===
const PATTERNS = [
  { id: 'none', name: 'None' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'diag', name: 'Diagonal' },
  { id: 'circles', name: 'Circles' },
  { id: 'cross', name: 'Cross' },
  { id: 'waves', name: 'Waves' },
];

// === Fonts (Google Fonts loaded in index head) ===
const FONTS = [
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

const FONT_CATS = ['All', 'Sans', 'Serif', 'Display', 'Mono', 'Handwriting'];

Object.assign(window, { ICONS, PALETTES, SWATCHES, GRADIENTS, BG_TYPES, PATTERNS, FONTS, FONT_CATS });
