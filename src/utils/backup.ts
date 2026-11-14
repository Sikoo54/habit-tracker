/**
 * Backup Nudge
 * Data lives only in this browser, so a cleared browser or evicted storage is
 * total loss. Tracks the last successful export and flags when it is stale.
 * Also keeps one snapshot of the data from just before the last import.
 */

import { previewImport } from '../storage/importPreview';
import { isRecord, isString } from '../storage/validation';
import type { ExportPayload } from '../types';

const BACKUP_KEY = 'habittracker.v2.lastBackup';

/** Key holding the safety snapshot written before an import replaces data. */
export const PRE_IMPORT_BACKUP_KEY = 'habittracker.v2.preImportBackup';

/** A backup older than this is considered stale. */
export const BACKUP_STALE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** How fresh the last export is, and whether the settings drawer should nag. */
export interface BackupStatus {
  /** Raw ISO timestamp of the last export, or null when never exported. */
  lastBackup: string | null;
  /** Whole days since the last export, or null when never exported. */
  daysAgo: number | null;
  /** True when there is no usable backup or it is older than the threshold. */
  due: boolean;
}

/** Reads the stored backup timestamp. Never throws. */
export function readLastBackup(): string | null {
  try {
    return window.localStorage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

/** Records a successful export. Failures are non-fatal. */
export function markBackedUp(now: Date = new Date()): void {
  try {
    window.localStorage.setItem(BACKUP_KEY, now.toISOString());
  } catch {
    // Private mode / quota: the nudge just keeps asking, which is safe.
  }
}

/** Compares the stored timestamp against `now` and decides whether to nag. */
export function backupStatus(lastBackup: string | null, now: Date = new Date()): BackupStatus {
  if (lastBackup === null) return { lastBackup: null, daysAgo: null, due: true };
  const at = Date.parse(lastBackup);
  if (Number.isNaN(at)) return { lastBackup: null, daysAgo: null, due: true };
  // Clock skew (timestamp in the future) counts as fresh, never negative.
  const daysAgo = Math.max(0, Math.floor((now.getTime() - at) / DAY_MS));
  return { lastBackup, daysAgo, due: daysAgo >= BACKUP_STALE_DAYS };
}

/** Short human label for the settings drawer. */
export function backupLabel(status: BackupStatus): string {
  if (status.daysAgo === null) return 'No backup yet';
  if (status.daysAgo === 0) return 'Backed up today';
  if (status.daysAgo === 1) return 'Backed up 1 day ago';
  return `Backed up ${status.daysAgo} days ago`;
}

/** Local safety snapshot taken right before an import overwrites data. */
export interface PreImportBackup {
  createdAt: string;
  payload: ExportPayload;
}

/**
 * Saves the current data before an import. Returns false when storage is full
 * or blocked, so the caller can cancel the import instead of risking data loss.
 */
export function savePreImportBackup(payload: ExportPayload, now: Date = new Date()): boolean {
  try {
    const backup: PreImportBackup = { createdAt: now.toISOString(), payload };
    window.localStorage.setItem(PRE_IMPORT_BACKUP_KEY, JSON.stringify(backup));
    return true;
  } catch {
    return false;
  }
}

/** Reads the pre-import snapshot, dropping it if it is corrupt or unreadable. */
export function readPreImportBackup(): PreImportBackup | null {
  try {
    const raw = window.localStorage.getItem(PRE_IMPORT_BACKUP_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isString(parsed.createdAt)) return null;
    const preview = previewImport(parsed.payload);
    if (!preview.ok) return null;
    return { createdAt: parsed.createdAt, payload: preview.payload };
  } catch {
    return null;
  }
}
