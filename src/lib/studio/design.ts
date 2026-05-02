'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { createElement } from 'react';
import { useProjects } from './projects';
import {
  emptyEntry,
  popRedo,
  popUndo,
  pushPast,
  type HistoryEntry,
} from './history';

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

type DesignSetter = (updater: SetStateAction<Design>) => void;

type DesignContext = {
  design: Design;
  setDesign: DesignSetter;
  patchBg: (patch: Partial<DesignBg>) => void;
  patchGradient: (patch: Partial<DesignBg['gradient']>) => void;
  patchContent: (patch: Partial<DesignContent>) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

const Ctx = createContext<DesignContext | null>(null);

type HistoryMap = Map<string, HistoryEntry>;

export function DesignProvider({ children }: { children: ReactNode }) {
  const { current, updateCurrentDesign } = useProjects();
  const design = current.design;
  const projectId = current.id;

  const [history, setHistory] = useState<HistoryMap>(() => new Map());

  const setDesign = useCallback<DesignSetter>(
    updater => {
      updateCurrentDesign(updater);
      setHistory(prev => {
        const next: HistoryMap = new Map(prev);
        next.set(projectId, pushPast(prev.get(projectId), design, Date.now()));
        return next;
      });
    },
    [design, projectId, updateCurrentDesign],
  );

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

  const entry = history.get(projectId) ?? emptyEntry();
  const canUndo = entry.past.length > 0;
  const canRedo = entry.future.length > 0;

  const undo = useCallback(() => {
    const result = popUndo(history.get(projectId), design);
    if (!result) return;
    updateCurrentDesign(result.design);
    setHistory(prev => {
      const next: HistoryMap = new Map(prev);
      next.set(projectId, result.entry);
      return next;
    });
  }, [history, design, projectId, updateCurrentDesign]);

  const redo = useCallback(() => {
    const result = popRedo(history.get(projectId), design);
    if (!result) return;
    updateCurrentDesign(result.design);
    setHistory(prev => {
      const next: HistoryMap = new Map(prev);
      next.set(projectId, result.entry);
      return next;
    });
  }, [history, design, projectId, updateCurrentDesign]);

  useEffect(() => {
    function isUndo(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      return mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z';
    }
    function isRedo(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z')
        return true;
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'y')
        return true;
      return false;
    }
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (isRedo(e)) {
        e.preventDefault();
        redo();
      } else if (isUndo(e)) {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return createElement(
    Ctx.Provider,
    {
      value: {
        design,
        setDesign,
        patchBg,
        patchGradient,
        patchContent,
        canUndo,
        canRedo,
        undo,
        redo,
      },
    },
    children,
  );
}

export function useDesign(): DesignContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
