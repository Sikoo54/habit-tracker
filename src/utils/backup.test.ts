import { describe, expect, it } from 'vitest';
import { backupLabel, backupStatus } from './backup';

const NOW = new Date('2026-10-31T12:00:00.000Z');

function daysAgoIso(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('backup status', () => {
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
