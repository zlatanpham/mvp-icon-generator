import type { Design } from './design';

export type HistoryEntry = {
  past: Design[];
  future: Design[];
  lastPushAt: number;
};

export const HISTORY_LIMIT = 100;
export const COALESCE_MS = 350;

export function emptyEntry(): HistoryEntry {
  return { past: [], future: [], lastPushAt: 0 };
}

export function pushPast(
  entry: HistoryEntry | undefined,
  prevDesign: Design,
  now: number,
): HistoryEntry {
  const e = entry ?? emptyEntry();
  const withinWindow = now - e.lastPushAt < COALESCE_MS && e.past.length > 0;
  // Coalesce: drop the most recent push so the older snapshot remains the
  // single "pre-burst" entry users undo back to.
  const past = withinWindow ? e.past.slice(0, -1) : e.past.slice();
  past.push(prevDesign);
  if (past.length > HISTORY_LIMIT) past.splice(0, past.length - HISTORY_LIMIT);
  return { past, future: [], lastPushAt: now };
}

export function popUndo(
  entry: HistoryEntry | undefined,
  currentDesign: Design,
): { entry: HistoryEntry; design: Design } | null {
  if (!entry || entry.past.length === 0) return null;
  const past = entry.past.slice();
  const design = past.pop()!;
  const future = entry.future.slice();
  future.push(currentDesign);
  return { entry: { past, future, lastPushAt: 0 }, design };
}

export function popRedo(
  entry: HistoryEntry | undefined,
  currentDesign: Design,
): { entry: HistoryEntry; design: Design } | null {
  if (!entry || entry.future.length === 0) return null;
  const future = entry.future.slice();
  const design = future.pop()!;
  const past = entry.past.slice();
  past.push(currentDesign);
  return { entry: { past, future, lastPushAt: 0 }, design };
}
