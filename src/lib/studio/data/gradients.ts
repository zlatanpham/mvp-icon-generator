export type GradientPreset = {
  id: string;
  name: string;
  colors: string[];
  angle: number;
};

export const GRADIENTS: GradientPreset[] = [
  { id: 'g1', name: 'Tangerine', colors: ['#FF6B35', '#F7931E'], angle: 135 },
  { id: 'g2', name: 'Berry', colors: ['#8E2DE2', '#4A00E0'], angle: 135 },
  { id: 'g3', name: 'Lagoon', colors: ['#0093E9', '#80D0C7'], angle: 160 },
  { id: 'g4', name: 'Mint', colors: ['#00DBDE', '#FC00FF'], angle: 90 },
  { id: 'g5', name: 'Coral', colors: ['#FF512F', '#F09819'], angle: 135 },
  { id: 'g6', name: 'Lilac', colors: ['#A18CD1', '#FBC2EB'], angle: 180 },
  {
    id: 'g7',
    name: 'Aurora',
    colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
    angle: 135,
  },
  { id: 'g8', name: 'Forest', colors: ['#134E5E', '#71B280'], angle: 135 },
];
