/**
 * Import Preview Test Suite
 * Checks that uploaded backups are validated and summarized before any local
 * data is replaced, including how invalid records are counted.
 */

import { describe, expect, it } from 'vitest';
import { previewImport } from './importPreview';

/** Minimal valid habit for payload fixtures. */
function habit(id: string, active = true, archivedAt?: string): Record<string, unknown> {
  return {
    id,
    name: id,
    fullVersion: id,
    trigger: '',
    active,
    weeklyGoal: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...(archivedAt ? { archivedAt } : {}),
  };
}

/** A complete valid backup used as the base for each test. */
function payload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    exportedAt: '2026-09-10T08:00:00.000Z',
    habits: [habit('active'), habit('retired', false, '2026-09-01T08:00:00.000Z')],
    tasks: [
      {
        id: 't1',
        title: 'Quest',
        done: false,
        priority: true,
        date: '2026-09-10',
        createdAt: 'x',
      },
    ],
    checkins: [
      {
        id: 'c1',
        habitId: 'active',
        date: '2026-09-10',
        createdAt: '2026-09-10T20:00:00.000Z',
      },
    ],
    reflections: [
      {
        id: 'r1',
        date: '2026-09-10',
        wentWell: 'yes',
        toImprove: 'sleep',
        mood: 4,
        energy: 3,
        createdAt: 'x',
        updatedAt: 'x',
      },
    ],
    attendance: [{ date: '2026-09-10', morning: true, night: false }],
    goals: [
      {
        id: 'g1',
        title: 'Ship the app',
        why: 'Prove the habit works',
        targetDate: '2026-12-31',
        createdAt: '2026-09-10T08:00:00.000Z',
      },
    ],
    quotes: [
      {
        id: 'q1',
        text: 'One honest day beats seven imagined ones.',
        author: null,
        createdAt: '2026-09-10T08:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

describe('import preview', () => {
  it('summarizes a valid backup', () => {
    const result = previewImport(payload());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary).toEqual({
      exportedAt: '2026-09-10T08:00:00.000Z',
      habits: 2,
      activeHabits: 1,
      archivedHabits: 1,
      tasks: 1,
      checkins: 1,
      reflections: 1,
      attendance: 1,
      goals: 1,
      quotes: 1,
      skipped: 0,
    });
  });

  it('rejects a non-backup value and a newer schema', () => {
    expect(previewImport(null).ok).toBe(false);
    expect(previewImport('file').ok).toBe(false);
    expect(previewImport(payload({ schemaVersion: 2 })).ok).toBe(false);
  });

  it('rejects missing main fields', () => {
    const raw = payload();
    delete raw.habits;
    expect(previewImport(raw)).toEqual({
      ok: false,
      reason: 'Import file is corrupt: main fields are missing.',
    });
  });

  it('drops invalid records and reports how many will be skipped', () => {
    const result = previewImport(
      payload({
        habits: [habit('ok'), { id: 'broken' }],
        checkins: [{ id: 'bad' }, { id: 'c2', habitId: 'ok', date: 'x', createdAt: 'x' }],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.habits).toBe(1);
    expect(result.summary.checkins).toBe(1);
    expect(result.summary.skipped).toBe(2);
    expect(result.payload.habits.map((h) => h.id)).toEqual(['ok']);
  });

  it('treats missing attendance as empty but rejects a bad attendance value', () => {
    const raw = payload();
    delete raw.attendance;
    const result = previewImport(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.summary.attendance).toBe(0);

    expect(previewImport(payload({ attendance: 'nope' }))).toEqual({
      ok: false,
      reason: 'Import file is corrupt: attendance is invalid.',
    });
  });

  it('keeps a valid frost ledger and rejects an invalid one', () => {
    const result = previewImport(payload({ decay: { total: 40, appliedThrough: '2026-09-09' } }));
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.payload.decay).toEqual({ total: 40, appliedThrough: '2026-09-09' });

    expect(previewImport(payload({ decay: { total: -1 } })).ok).toBe(false);
  });

  it('counts valid goals, drops broken ones, and rejects a bad goals field', () => {
    const result = previewImport(
      payload({
        goals: [habit('not-a-goal'), { id: 'g2', title: 'Run', why: '', createdAt: 'x' }],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.goals).toBe(1);
    expect(result.summary.skipped).toBe(1);
    expect(result.payload.goals?.map((g) => g.id)).toEqual(['g2']);

    expect(previewImport(payload({ goals: 'nope' }))).toEqual({
      ok: false,
      reason: 'Import file is corrupt: goals are invalid.',
    });
  });

  it('treats missing goals as empty', () => {
    const raw = payload();
    delete raw.goals;
    const result = previewImport(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.goals).toBe(0);
      expect(result.payload.goals).toBeUndefined();
    }
  });

  it('counts valid quotes, drops broken ones, and rejects a bad quotes field', () => {
    const result = previewImport(
      payload({
        quotes: [
          habit('not-a-quote'),
          { id: 'q2', text: 'Keep going.', author: 'Me', createdAt: 'x' },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.quotes).toBe(1);
    expect(result.summary.skipped).toBe(1);
    expect(result.payload.quotes?.map((q) => q.id)).toEqual(['q2']);

    expect(previewImport(payload({ quotes: 'nope' }))).toEqual({
      ok: false,
      reason: 'Import file is corrupt: quotes are invalid.',
    });
  });

  it('leaves quotes out when an older backup has none', () => {
    const raw = payload();
    delete raw.quotes;
    const result = previewImport(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.quotes).toBe(0);
      expect(result.payload.quotes).toBeUndefined();
    }
  });

  it('tolerates a missing exportedAt', () => {
    const raw = payload();
    delete raw.exportedAt;
    const result = previewImport(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.exportedAt).toBeNull();
      expect(result.payload.exportedAt).toBe('');
    }
  });
});
