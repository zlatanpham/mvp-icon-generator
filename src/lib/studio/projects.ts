'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { INITIAL_DESIGN, type Design } from './design';

export type Project = {
  id: string;
  design: Design;
  createdAt: number;
  updatedAt: number;
};

type ProjectsState = {
  projects: Project[];
  currentId: string;
};

const STORAGE_KEY = 'instant-icon-projects';
const LEGACY_STORAGE_KEYS = [
  'instanticon-projects',
  'mvp-icon-generator-projects',
];
const STORAGE_VERSION = 1;

type StorageWrapper = {
  version: number;
  state: ProjectsState;
};

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function freshProject(name?: string): Project {
  const now = Date.now();
  return {
    id: makeId(),
    design: name ? { ...INITIAL_DESIGN, name } : { ...INITIAL_DESIGN },
    createdAt: now,
    updatedAt: now,
  };
}

function seedState(): ProjectsState {
  const p = freshProject();
  return { projects: [p], currentId: p.id };
}

export const ProjectStore = {
  load(): ProjectsState {
    if (typeof window === 'undefined') return seedState();
    try {
      let raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        // One-time migration from any pre-rename key.
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacy = window.localStorage.getItem(legacyKey);
          if (legacy !== null) {
            window.localStorage.setItem(STORAGE_KEY, legacy);
            window.localStorage.removeItem(legacyKey);
            raw = legacy;
            break;
          }
        }
      }
      if (!raw) return seedState();
      const parsed = JSON.parse(raw) as StorageWrapper | ProjectsState;
      const state = isWrapper(parsed) ? parsed.state : parsed;
      if (!state.projects?.length) return seedState();
      const currentId = state.projects.some(p => p.id === state.currentId)
        ? state.currentId
        : state.projects[0].id;
      return { projects: state.projects, currentId };
    } catch (err) {
      console.error('Failed to load projects from storage:', err);
      return seedState();
    }
  },

  save(state: ProjectsState): void {
    if (typeof window === 'undefined') return;
    try {
      const wrapper: StorageWrapper = { version: STORAGE_VERSION, state };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (err) {
      console.error('Failed to save projects to storage:', err);
    }
  },
};

function isWrapper(v: unknown): v is StorageWrapper {
  return (
    typeof v === 'object' &&
    v !== null &&
    'version' in v &&
    'state' in v &&
    typeof (v as { version: unknown }).version === 'number'
  );
}

export type ProjectsContextValue = {
  projects: Project[];
  currentId: string;
  current: Project;
  selectProject: (id: string) => void;
  createProject: (name?: string) => string;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string;
  updateCurrentDesign: (updater: SetStateAction<Design>) => void;
  replaceProjects: (next: Project[], nextCurrentId?: string) => void;
};

const Ctx = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectsState>(() => seedState());
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Hydrate from localStorage on mount only. We cannot read storage in the
    // useState initializer because this provider lives inside a `'use client'`
    // tree that Next.js still pre-renders on the server, and a different
    // initial value on server vs. client would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(ProjectStore.load());
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    ProjectStore.save(state);
  }, [state]);

  const current = useMemo(() => {
    return (
      state.projects.find(p => p.id === state.currentId) ?? state.projects[0]
    );
  }, [state.projects, state.currentId]);

  const selectProject = useCallback((id: string) => {
    setState(s => {
      if (!s.projects.some(p => p.id === id)) return s;
      return { ...s, currentId: id };
    });
  }, []);

  const createProject = useCallback((name?: string) => {
    const p = freshProject(name);
    setState(s => ({
      projects: [p, ...s.projects],
      currentId: p.id,
    }));
    return p.id;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState(s => {
      const remaining = s.projects.filter(p => p.id !== id);
      if (remaining.length === 0) {
        const fresh = freshProject();
        return { projects: [fresh], currentId: fresh.id };
      }
      const currentId = s.currentId === id ? remaining[0].id : s.currentId;
      return { projects: remaining, currentId };
    });
  }, []);

  const duplicateProject = useCallback((id: string) => {
    let newId = '';
    setState(s => {
      const source = s.projects.find(p => p.id === id);
      if (!source) return s;
      const now = Date.now();
      const copy: Project = {
        id: makeId(),
        design: { ...source.design, name: `${source.design.name} copy` },
        createdAt: now,
        updatedAt: now,
      };
      newId = copy.id;
      return { projects: [copy, ...s.projects], currentId: copy.id };
    });
    return newId;
  }, []);

  const updateCurrentDesign = useCallback((updater: SetStateAction<Design>) => {
    setState(s => {
      const idx = s.projects.findIndex(p => p.id === s.currentId);
      if (idx === -1) return s;
      const prev = s.projects[idx];
      const nextDesign =
        typeof updater === 'function'
          ? (updater as (d: Design) => Design)(prev.design)
          : updater;
      if (nextDesign === prev.design) return s;
      const nextProject: Project = {
        ...prev,
        design: nextDesign,
        updatedAt: Date.now(),
      };
      const nextProjects = [...s.projects];
      nextProjects[idx] = nextProject;
      return { ...s, projects: nextProjects };
    });
  }, []);

  const replaceProjects = useCallback(
    (next: Project[], nextCurrentId?: string) => {
      setState(() => {
        if (next.length === 0) {
          const fresh = freshProject();
          return { projects: [fresh], currentId: fresh.id };
        }
        const currentId =
          nextCurrentId && next.some(p => p.id === nextCurrentId)
            ? nextCurrentId
            : next[0].id;
        return { projects: next, currentId };
      });
    },
    [],
  );

  const value: ProjectsContextValue = {
    projects: state.projects,
    currentId: state.currentId,
    current,
    selectProject,
    createProject,
    deleteProject,
    duplicateProject,
    updateCurrentDesign,
    replaceProjects,
  };

  return createElement(Ctx.Provider, { value }, children);
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
