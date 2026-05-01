'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  applyResolution,
  type ImportConflict,
  type Resolution,
} from '@/lib/studio/projects-io';
import type { Project } from '@/lib/studio/projects';
import { useProjects } from '@/lib/studio/projects';

export type ImportStats = {
  added: number;
  skipped: number;
  replaced: number;
  merged: number;
  duplicated: number;
};

export type ImportRun = {
  conflicts: ImportConflict[];
  staged: Project[];
  stats: ImportStats;
};

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  // Pre-classified work with conflicts to resolve. When non-null the dialog
  // walks the user through resolutions then commits.
  pendingRun: ImportRun | null;
  // A finished import summary (no conflicts case). When non-null the dialog
  // just shows the totals and a Done button.
  committed: ImportStats | null;
};

type RunState = {
  conflicts: ImportConflict[];
  conflictIndex: number;
  staged: Project[];
  stats: ImportStats;
};

export function ImportDialog({
  open,
  onOpenChange,
  pendingRun,
  committed: initialCommitted,
}: Props) {
  const { projects, replaceProjects } = useProjects();
  const [run, setRun] = useState<RunState | null>(() =>
    pendingRun
      ? {
          conflicts: pendingRun.conflicts,
          conflictIndex: 0,
          staged: pendingRun.staged,
          stats: pendingRun.stats,
        }
      : null,
  );
  const [committed, setCommitted] = useState<ImportStats | null>(
    initialCommitted ?? null,
  );
  const [applyToAll, setApplyToAll] = useState(false);

  const handleResolve = (resolution: Resolution) => {
    if (!run) return;

    let working = run.staged;
    let i = run.conflictIndex;
    const stats = { ...run.stats };

    const applyOne = (conf: ImportConflict, res: Resolution) => {
      working = applyResolution(working, conf, res);
      switch (res) {
        case 'skip':
          stats.skipped += 1;
          break;
        case 'duplicate':
          stats.duplicated += 1;
          break;
        case 'replace':
          stats.replaced += 1;
          break;
        case 'merge':
          stats.merged += 1;
          break;
      }
    };

    if (applyToAll) {
      for (; i < run.conflicts.length; i++) {
        applyOne(run.conflicts[i], resolution);
      }
    } else {
      applyOne(run.conflicts[i], resolution);
      i += 1;
    }

    if (i >= run.conflicts.length) {
      replaceProjects(working, projects[0]?.id);
      setCommitted(stats);
      setRun(null);
    } else {
      setRun({ ...run, conflictIndex: i, staged: working, stats });
    }
  };

  const isDone = committed !== null;
  const currentConflict = run?.conflicts[run.conflictIndex];
  const remaining = run ? run.conflicts.length - run.conflictIndex : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) onOpenChange(false);
        else onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isDone ? 'Import complete' : 'Resolve import conflict'}
          </DialogTitle>
          <DialogDescription>
            {isDone
              ? 'See what changed in your library below.'
              : run
                ? `Conflict ${run.conflictIndex + 1} of ${run.conflicts.length} — choose how to handle this project.`
                : 'Reading file…'}
          </DialogDescription>
        </DialogHeader>

        {!isDone && currentConflict && run && (
          <div className="space-y-4">
            <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 text-[13px]">
              <ConflictRow
                label="Existing"
                project={currentConflict.existing}
              />
              <div className="my-2 border-t border-[var(--color-line)]" />
              <ConflictRow
                label="Incoming"
                project={currentConflict.incoming}
              />
              <div className="mt-3 text-[12px] text-[var(--color-ink-3)]">
                {currentConflict.kind === 'id-data'
                  ? 'Same project id, different design.'
                  : 'Same project name, different design.'}
              </div>
            </div>

            {remaining > 1 && (
              <label className="flex items-center gap-2 text-[12px] text-[var(--color-ink-3)]">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={e => setApplyToAll(e.target.checked)}
                />
                Apply my next choice to all {remaining} remaining conflicts
              </label>
            )}

            <DialogFooter>
              <button
                type="button"
                onClick={() => handleResolve('skip')}
                className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => handleResolve('duplicate')}
                className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
              >
                Duplicate as new
              </button>
              {currentConflict.kind === 'id-data' && (
                <button
                  type="button"
                  onClick={() => handleResolve('replace')}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)]"
                >
                  Replace
                </button>
              )}
              {currentConflict.kind === 'name-data' && (
                <button
                  type="button"
                  onClick={() => handleResolve('merge')}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)]"
                >
                  Merge into existing
                </button>
              )}
            </DialogFooter>
          </div>
        )}

        {isDone && committed && (
          <div className="space-y-4">
            <ul className="space-y-1 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 text-[13px]">
              <SummaryRow label="Added" value={committed.added} />
              <SummaryRow
                label="Skipped (already present)"
                value={committed.skipped}
              />
              <SummaryRow label="Replaced" value={committed.replaced} />
              <SummaryRow label="Merged" value={committed.merged} />
              <SummaryRow label="Duplicated" value={committed.duplicated} />
            </ul>
            <DialogFooter>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)]"
              >
                Done
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConflictRow({ label, project }: { label: string; project: Project }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[11px] tracking-wide text-[var(--color-ink-4)] uppercase">
          {label}
        </div>
        <div className="text-[14px] font-medium text-[var(--color-ink)]">
          {project.design.name || 'Untitled'}
        </div>
      </div>
      <div
        aria-hidden
        className="h-10 w-10 shrink-0 rounded-md border border-[var(--color-line)]"
        style={{ background: project.design.bg.color }}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-[var(--color-ink-3)]">{label}</span>
      <span className="font-semibold text-[var(--color-ink)]">{value}</span>
    </li>
  );
}
