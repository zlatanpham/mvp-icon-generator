import type { BgType } from '../design';

export type BgTypeDef = {
  id: BgType;
  label: string;
};

export const BG_TYPES: BgTypeDef[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'noise', label: 'Grain' },
];
