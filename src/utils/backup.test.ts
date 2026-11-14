import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExportPayload } from '../types';
import {
  backupLabel,
  backupStatus,
  PRE_IMPORT_BACKUP_KEY,
  readPreImportBackup,
  savePreImportBackup,
} from './backup';

const NOW = new Date('2026-10-31T12:00:00.000Z');

/** Empty but valid backup payload for snapshot tests. */
const EMPTY_PAYLOAD: ExportPayload = {
  schemaVersion: 1,
  exportedAt: '2026-10-31T00:00:00.000Z',
  habits: [],
  tasks: [],
  checkins: [],
  reflections: [],
  attendance: [],
};

function daysAgoIso(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('backup status', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('is due when no backup was ever made', () => {
    const s = backupStatus(null, NOW);
    expect(s.due).toBe(true);
    expect(s.daysAgo).toBeNull();
    expect(backupLabel(s)).toBe('No backup yet');
  });

  it('treats an unparseable timestamp as missing', () => {
    const s = backupStatus('not-a-date', NOW);
    expect(s.due).toBe(true);
    expect(s.daysAgo).toBeNull();
  });

  it('is fine right after an export', () => {
    const s = backupStatus(daysAgoIso(0), NOW);
    expect(s.daysAgo).toBe(0);
    expect(s.due).toBe(false);
    expect(backupLabel(s)).toBe('Backed up today');
  });

  it('stays quiet just under the threshold', () => {
    const s = backupStatus(daysAgoIso(29), NOW);
    expect(s.daysAgo).toBe(29);
    expect(s.due).toBe(false);
    expect(backupLabel(s)).toBe('Backed up 29 days ago');
  });

  it('nags at the threshold and beyond', () => {
    expect(backupStatus(daysAgoIso(30), NOW).due).toBe(true);
    expect(backupStatus(daysAgoIso(120), NOW).due).toBe(true);
  });

  it('never reports negative days', () => {
    const s = backupStatus(new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), NOW);
    expect(s.daysAgo).toBe(0);
    expect(s.due).toBe(false);
  });

  it('labels a single day in the singular', () => {
    expect(backupLabel(backupStatus(daysAgoIso(1), NOW))).toBe('Backed up 1 day ago');
  });
});

describe('pre-import backup', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips the snapshot with its timestamp', () => {
    expect(savePreImportBackup(EMPTY_PAYLOAD, NOW)).toBe(true);
    expect(readPreImportBackup()).toEqual({
      createdAt: NOW.toISOString(),
      payload: EMPTY_PAYLOAD,
    });
  });

  it('returns null for corrupt or invalid snapshots', () => {
    window.localStorage.setItem(PRE_IMPORT_BACKUP_KEY, 'not-json');
    expect(readPreImportBackup()).toBeNull();

    window.localStorage.setItem(
      PRE_IMPORT_BACKUP_KEY,
      JSON.stringify({ createdAt: NOW.toISOString(), payload: { schemaVersion: 9 } }),
    );
    expect(readPreImportBackup()).toBeNull();
  });

  it('reports failure when storage refuses the write', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(savePreImportBackup(EMPTY_PAYLOAD, NOW)).toBe(false);
    spy.mockRestore();
  });
});
