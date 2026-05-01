import type { Design } from './design';
import type { Project } from './projects';

export const PROJECT_FILE_FORMAT = 'instant-icon-projects';
export const PROJECT_FILE_VERSION = 1;

export type ProjectFile = {
  format: typeof PROJECT_FILE_FORMAT;
  version: number;
  exportedAt: string;
  projects: Project[];
};

export type ConflictKind = 'id-data' | 'name-data';

export type ImportConflict = {
  kind: ConflictKind;
  incoming: Project;
  existing: Project;
};

export type Resolution = 'replace' | 'duplicate' | 'skip' | 'merge';

export type ClassifyResult = {
  toAdd: Project[];
  toSkip: Project[];
  conflicts: ImportConflict[];
};

export function buildProjectFile(projects: Project[]): ProjectFile {
  return {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    projects: projects.map(p => ({
      id: p.id,
      design: p.design,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  };
}

export function projectFileBlob(projects: Project[]): Blob {
  const payload = buildProjectFile(projects);
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
}

export type ParseResult =
  | { ok: true; projects: Project[] }
  | { ok: false; error: string };

export function parseProjectFile(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }
  if (!isObject(raw)) return { ok: false, error: 'Unexpected file shape.' };
  if (raw.format !== PROJECT_FILE_FORMAT) {
    return {
      ok: false,
      error: `Not an Instant Icon projects file (format=${String(raw.format)}).`,
    };
  }
  if (raw.version !== PROJECT_FILE_VERSION) {
    return {
      ok: false,
      error: `Unsupported file version: ${String(raw.version)}.`,
    };
  }
  const projects = raw.projects;
  if (!Array.isArray(projects)) {
    return { ok: false, error: 'File is missing a projects array.' };
  }
  const cleaned: Project[] = [];
  for (const p of projects) {
    if (!isProject(p)) {
      return { ok: false, error: 'A project entry has an invalid shape.' };
    }
    cleaned.push(p);
  }
  return { ok: true, projects: cleaned };
}

export function classifyIncoming(
  incoming: Project[],
  existing: Project[],
): ClassifyResult {
  const toAdd: Project[] = [];
  const toSkip: Project[] = [];
  const conflicts: ImportConflict[] = [];

  for (const inc of incoming) {
    const sameId = existing.find(e => e.id === inc.id);
    if (sameId) {
      if (designEqual(sameId.design, inc.design)) {
        toSkip.push(inc);
      } else {
        conflicts.push({ kind: 'id-data', incoming: inc, existing: sameId });
      }
      continue;
    }

    const nameMatch = existing.find(
      e => e.design.name.trim() === inc.design.name.trim(),
    );
    if (nameMatch) {
      if (designEqual(nameMatch.design, inc.design)) {
        toSkip.push(inc);
      } else {
        conflicts.push({
          kind: 'name-data',
          incoming: inc,
          existing: nameMatch,
        });
      }
      continue;
    }

    toAdd.push(inc);
  }

  return { toAdd, toSkip, conflicts };
}

export function applyResolution(
  projects: Project[],
  conflict: ImportConflict,
  resolution: Resolution,
): Project[] {
  const inc = conflict.incoming;
  const existing = conflict.existing;

  switch (resolution) {
    case 'skip':
      return projects;
    case 'duplicate': {
      const fresh: Project = {
        ...inc,
        id: regenerateId(),
        design:
          conflict.kind === 'name-data'
            ? { ...inc.design, name: `${inc.design.name} (imported)` }
            : inc.design,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return [fresh, ...projects];
    }
    case 'replace': {
      return projects.map(p =>
        p.id === existing.id
          ? {
              ...inc,
              id: existing.id,
              createdAt: existing.createdAt,
              updatedAt: Date.now(),
            }
          : p,
      );
    }
    case 'merge': {
      return projects.map(p =>
        p.id === existing.id
          ? {
              ...existing,
              design: { ...inc.design, name: existing.design.name },
              updatedAt: Date.now(),
            }
          : p,
      );
    }
  }
}

function regenerateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function designEqual(a: Design, b: Design): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isProject(v: unknown): v is Project {
  if (!isObject(v)) return false;
  if (typeof v.id !== 'string') return false;
  if (typeof v.createdAt !== 'number') return false;
  if (typeof v.updatedAt !== 'number') return false;
  if (!isObject(v.design)) return false;
  if (typeof (v.design as { name?: unknown }).name !== 'string') return false;
  return true;
}

export function downloadJsonBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
