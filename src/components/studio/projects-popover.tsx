'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Plus,
  Copy,
  Trash2,
  FileDown,
  CheckSquare,
  Square,
  X,
  Check,
  FolderOpen,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProjects, type Project } from '@/lib/studio/projects';
import {
  classifyIncoming,
  downloadJsonBlob,
  parseProjectFile,
  projectFileBlob,
  slugifyName,
} from '@/lib/studio/projects-io';
import {
  ImportDialog,
  type ImportRun,
  type ImportStats,
} from './import-dialog';

export function ProjectsPopover() {
  const {
    projects,
    currentId,
    selectProject,
    createProject,
    deleteProject,
    duplicateProject,
    replaceProjects,
  } = useProjects();
  const [open, setOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importRun, setImportRun] = useState<ImportRun | null>(null);
  const [importCommitted, setImportCommitted] = useState<ImportStats | null>(
    null,
  );
  const [importKey, setImportKey] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const newNameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    if (creating) newNameInputRef.current?.focus();
  }, [creating]);

  const handleRowClick = (id: string) => {
    if (selectMode) {
      setSelected(s => {
        const next = new Set(s);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    selectProject(id);
    setOpen(false);
  };

  const startCreate = () => {
    setCreating(true);
    setNewName(suggestNextName(projects));
  };

  const cancelCreate = () => {
    setCreating(false);
    setNewName('');
  };

  const confirmCreate = () => {
    const name = newName.trim() || 'Untitled';
    createProject(name);
    setCreating(false);
    setNewName('');
    setOpen(false);
  };

  const handleExportOne = (p: Project) => {
    const blob = projectFileBlob([p]);
    const filename = `${slugifyName(p.design.name) || 'project'}.instant-icon.json`;
    downloadJsonBlob(blob, filename);
  };

  const handleExportSelected = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const picked = projects.filter(p => ids.includes(p.id));
    const blob = projectFileBlob(picked);
    const date = new Date().toISOString().slice(0, 10);
    downloadJsonBlob(blob, `instant-icon-projects-${date}.json`);
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setConfirmDelete(null);
  };

  const toggleSelectMode = () => {
    setSelectMode(m => !m);
    setSelected(new Set());
  };

  const allSelected =
    selectMode && projects.length > 0 && selected.size === projects.length;

  const toggleSelectAll = () => {
    setSelected(s => {
      if (s.size === projects.length) return new Set();
      return new Set(projects.map(p => p.id));
    });
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseProjectFile(text);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      const cls = classifyIncoming(result.projects, projects);
      const stats: ImportStats = {
        added: cls.toAdd.length,
        skipped: cls.toSkip.length,
        replaced: 0,
        merged: 0,
        duplicated: 0,
      };
      const staged = [...cls.toAdd, ...projects];

      if (cls.conflicts.length === 0) {
        if (cls.toAdd.length > 0) {
          replaceProjects(staged, projects[0]?.id);
        }
        setImportRun(null);
        setImportCommitted(stats);
      } else {
        setImportRun({ conflicts: cls.conflicts, staged, stats });
        setImportCommitted(null);
      }
      setImportKey(k => k + 1);
      setOpen(false);
      setImportDialogOpen(true);
    } catch (err) {
      console.error('Import failed', err);
      setImportError('Could not read the file.');
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChosen}
      />
      <ImportDialog
        key={importKey}
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        pendingRun={importRun}
        committed={importCommitted}
      />
      <Dialog
        open={open}
        onOpenChange={next => {
          setOpen(next);
          if (!next) {
            setSelectMode(false);
            setSelected(new Set());
            setConfirmDelete(null);
            setCreating(false);
            setNewName('');
            setImportError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-[var(--color-ink-3)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)] data-[state=open]:bg-[var(--color-paper-3)] data-[state=open]:text-[var(--color-ink)]"
            aria-label="Browse projects"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Projects</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DialogTrigger>

        <DialogContent className="gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-[var(--color-line)] px-5 py-4">
            <DialogTitle>Projects</DialogTitle>
            <DialogDescription>
              Browse, switch, rename, or export your saved icons. Stored locally
              in this browser.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-3">
            {creating ? (
              <form
                className="flex flex-1 items-center gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  confirmCreate();
                }}
              >
                <Plus className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <input
                  ref={newNameInputRef}
                  aria-label="New project name"
                  placeholder="Project name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelCreate();
                    }
                  }}
                  className="h-9 flex-1 rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  type="button"
                  onClick={cancelCreate}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newName.trim().length === 0}
                  className="inline-flex h-9 items-center gap-1 rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)] disabled:opacity-40 disabled:hover:bg-[var(--color-accent)]"
                >
                  <Check className="h-4 w-4" />
                  Create
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startCreate}
                    disabled={selectMode}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)] disabled:opacity-40 disabled:hover:bg-[var(--color-accent)]"
                  >
                    <Plus className="h-4 w-4" />
                    New project
                  </button>

                  <button
                    type="button"
                    onClick={handleImportClick}
                    disabled={selectMode}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <Upload className="h-4 w-4" />
                    Import JSON
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectMode}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                  aria-pressed={selectMode}
                >
                  {selectMode ? (
                    <>
                      <X className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Select multiple
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {importError && (
            <div className="border-b border-[var(--color-line)] bg-[var(--color-destructive)]/10 px-5 py-2 text-[12px] text-[var(--color-destructive)]">
              {importError}
            </div>
          )}

          {selectMode && projects.length > 0 && (
            <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-paper-2)] px-5 py-2 text-[12px] text-[var(--color-ink-3)]">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex h-7 items-center gap-2 rounded-md px-2 hover:bg-white"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-[var(--color-accent)]" />
                ) : (
                  <Square className="h-4 w-4 text-[var(--color-ink-4)]" />
                )}
                <span className="font-medium text-[var(--color-ink)]">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
                <span className="text-[var(--color-ink-4)]">
                  ({projects.length})
                </span>
              </button>
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
            {sorted.map(p => {
              const isCurrent = p.id === currentId;
              const isSelected = selected.has(p.id);
              const isConfirming = confirmDelete === p.id;

              return (
                <div
                  key={p.id}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-[var(--color-paper-3)] ${
                    isCurrent ? 'bg-[var(--color-accent-soft)]/40' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleRowClick(p.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {selectMode ? (
                      isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[var(--color-accent)]" />
                      ) : (
                        <Square className="h-4 w-4 text-[var(--color-ink-4)]" />
                      )
                    ) : (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isCurrent
                            ? 'bg-[var(--color-accent)]'
                            : 'bg-transparent'
                        }`}
                        aria-hidden
                      />
                    )}
                    <div
                      aria-hidden
                      className="h-9 w-9 shrink-0 rounded-md border border-[var(--color-line)]"
                      style={{ background: p.design.bg.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                        {p.design.name || 'Untitled'}
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-accent-2)] uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-ink-4)]">
                        Edited {timeAgo(p.updatedAt)}
                      </div>
                    </div>
                  </button>

                  {!selectMode && !isConfirming && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <RowAction
                        label="Export as JSON"
                        onClick={() => handleExportOne(p)}
                        icon={<FileDown className="h-3.5 w-3.5" />}
                      />
                      <RowAction
                        label="Duplicate"
                        onClick={() => duplicateProject(p.id)}
                        icon={<Copy className="h-3.5 w-3.5" />}
                      />
                      <RowAction
                        label="Delete"
                        onClick={() => setConfirmDelete(p.id)}
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        destructive
                      />
                    </div>
                  )}

                  {!selectMode && isConfirming && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[var(--color-destructive)]">
                        Delete?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="inline-flex h-7 items-center rounded-md border border-[var(--color-line)] bg-white px-2 text-[12px] hover:bg-[var(--color-paper-3)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--color-destructive)] px-2 text-[12px] font-medium text-white hover:opacity-90"
                      >
                        <Check className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-line)] px-5 py-3">
            <span className="text-[12px] text-[var(--color-ink-4)]">
              {selectMode
                ? `${selected.size} selected`
                : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
            </span>
            {selectMode && (
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={handleExportSelected}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-2)] disabled:opacity-40 disabled:hover:bg-[var(--color-accent)]"
              >
                <FileDown className="h-4 w-4" />
                Export selected
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RowAction({
  label,
  onClick,
  icon,
  destructive,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent hover:border-[var(--color-line)] hover:bg-white ${
        destructive
          ? 'text-[var(--color-destructive)]'
          : 'text-[var(--color-ink-3)]'
      }`}
    >
      {icon}
    </button>
  );
}

function suggestNextName(projects: Project[]): string {
  const base = 'Untitled';
  const taken = new Set(projects.map(p => p.design.name.trim()));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return base;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return `${yr}y ago`;
}
