/**
 * Backup Nudge
 * Data lives only in this browser, so a cleared browser or evicted storage is
 * total loss. Tracks the last successful export and flags when it is stale.
 */

const BACKUP_KEY = 'habittracker.v2.lastBackup';

/** A backup older than this is considered stale. */
export const BACKUP_STALE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

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
