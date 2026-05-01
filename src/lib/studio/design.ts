'use client';

import {
  createContext,
  useCallback,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { createElement } from 'react';
import { useProjects } from './projects';

export type BgType =
  | 'solid'
  | 'linear'
  | 'radial'
  | 'conic'
  | 'mesh'
  | 'pattern'
  | 'noise';

export type PatternId =
  | 'none'
  | 'dots'
  | 'grid'
  | 'stripes'
  | 'diag'
  | 'circles'
  | 'cross'
  | 'waves';

export type ContentMode = 'icon' | 'letters';
export type IconSource = 'curated' | 'lucide' | 'uploaded';

export type DesignBg = {
  type: BgType;
  color: string;
  gradient: { colors: string[]; angle: number };
  pattern: PatternId;
  patternColor: string;
  patternOpacity: number;
  grain: number;
};

export type DesignContent = {
  mode: ContentMode;
  iconSource: IconSource;
  iconId: string;
  iconName: string;
  iconPath?: string;
  uploadedSvgId?: string;
  filled: boolean;
  letters: string;
  font: string;
  fontWeight: number;
};

export type Design = {
  name: string;
  bg: DesignBg;
  foreground: string;
  radius: number;
  contentSize: number;
  content: DesignContent;
};

export const INITIAL_DESIGN: Design = {
  name: 'Atlas',
  bg: {
    type: 'solid',
    color: '#15140F',
    gradient: { colors: ['#B0413E', '#8E2C29'], angle: 135 },
    pattern: 'none',
    patternColor: '#F7F3E9',
    patternOpacity: 0.18,
    grain: 0.18,
  },
  foreground: '#F7F3E9',
  radius: 22,
  contentSize: 55,
  content: {
    mode: 'icon',
    iconSource: 'curated',
    iconId: 'spark',
    iconName: 'Spark',
    iconPath: 'M12 2L14 9.5L21.5 11L14.5 13L12 21L10 13L2.5 11L10.5 9.5Z',
    filled: true,
    letters: 'A',
    font: 'Fraunces',
    fontWeight: 900,
  },
};

type DesignSetter = Dispatch<SetStateAction<Design>>;

type DesignContext = {
  design: Design;
  setDesign: DesignSetter;
  patchBg: (patch: Partial<DesignBg>) => void;
  patchGradient: (patch: Partial<DesignBg['gradient']>) => void;
  patchContent: (patch: Partial<DesignContent>) => void;
};

const Ctx = createContext<DesignContext | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const { current, updateCurrentDesign } = useProjects();
  const design = current.design;
  const setDesign = updateCurrentDesign;

  const patchBg = useCallback(
    (patch: Partial<DesignBg>) =>
      setDesign(d => ({ ...d, bg: { ...d.bg, ...patch } })),
    [setDesign],
  );

  const patchGradient = useCallback(
    (patch: Partial<DesignBg['gradient']>) =>
      setDesign(d => ({
        ...d,
        bg: { ...d.bg, gradient: { ...d.bg.gradient, ...patch } },
      })),
    [setDesign],
  );

  const patchContent = useCallback(
    (patch: Partial<DesignContent>) =>
      setDesign(d => ({ ...d, content: { ...d.content, ...patch } })),
    [setDesign],
  );

  return createElement(
    Ctx.Provider,
    { value: { design, setDesign, patchBg, patchGradient, patchContent } },
    children,
  );
}

export function useDesign(): DesignContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
