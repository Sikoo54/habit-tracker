/**
 * LocalStorage Adapter Test Suite
 * Validates schema versioning, corrupt data resilience, normalization,
 * and export/import roundtrip integrity.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { DECAY_KEY } from '../game/decay';
import type { ExportPayload } from '../types';
import { LocalStorageAdapter } from './localStorageAdapter';

/** All keys currently stored, for reset assertions. */
function storageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
}

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('save then read habits', async () => {
    const a = new LocalStorageAdapter();
    await a.saveHabits([
      {
        id: 'h1',
        name: 'Baca',
        fullVersion: '20 hlmn',
        trigger: 'malam',
        active: true,
        weeklyGoal: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(await a.getHabits()).toHaveLength(1);
  });

  it('old habit without weeklyGoal defaults to 0', async () => {
    window.localStorage.setItem(
      'habittracker.v2.habits',
      JSON.stringify([
        {
          id: 'old',
          name: 'Old',
          fullVersion: 'full',
          trigger: '',
          active: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    );
    const a = new LocalStorageAdapter();
    const habits = await a.getHabits();
    expect(habits).toHaveLength(1);
    expect(habits[0]?.weeklyGoal).toBe(0);
  });

  it('corrupt data -> empty, no throw', async () => {
    window.localStorage.setItem('habittracker.v2.habits', 'INI-BUKAN-JSON{{{');
    const a = new LocalStorageAdapter();
    expect(await a.getHabits()).toEqual([]);
  });

  it('invalid entries filtered', async () => {
    window.localStorage.setItem(
      'habittracker.v2.tasks',
      JSON.stringify([
        { id: 'x' },
        { id: 't1', title: 'Ok', done: false, priority: true, date: '2026-09-10', createdAt: 'x' },
      ]),
    );
    const a = new LocalStorageAdapter();
    const tasks = await a.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.id).toBe('t1');
  });

  it('export/import roundtrip', async () => {
    const a = new LocalStorageAdapter();
    await a.saveReflections([
      {
        id: 'r1',
        date: '2026-09-10',
        wentWell: 'baik',
        toImprove: 'tidur',
        mood: 4,
        energy: 3,
        createdAt: 'x',
        updatedAt: 'x',
      },
    ]);
    const dump = await a.exportAll();
    await a.clearAll();
    expect(await a.getReflections()).toEqual([]);
    await a.importAll(dump);
    expect(await a.getReflections()).toHaveLength(1);
  });

  it('keeps archivedAt through a save/read cycle and derives the archive gap', async () => {
    const a = new LocalStorageAdapter();
    await a.saveHabits([
      {
        id: 'archived',
        name: 'Old habit',
        fullVersion: 'full',
        trigger: '',
        active: false,
        weeklyGoal: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        archivedAt: '2026-09-10T08:00:00.000Z',
      },
    ]);
    const [habit] = await a.getHabits();
    expect(habit?.archivedAt).toBe('2026-09-10T08:00:00.000Z');
    expect(habit?.archives).toEqual([{ from: '2026-09-10T08:00:00.000Z' }]);
  });

  it('keeps closed archive gaps after a restore', async () => {
    const a = new LocalStorageAdapter();
    await a.saveHabits([
      {
        id: 'restored',
        name: 'Back habit',
        fullVersion: 'full',
        trigger: '',
        active: true,
        weeklyGoal: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        archives: [{ from: '2026-09-10T08:00:00.000Z', to: '2026-09-14T08:00:00.000Z' }],
      },
    ]);
    const [habit] = await a.getHabits();
    expect(habit?.archivedAt).toBeUndefined();
    expect(habit?.archives).toEqual([
      { from: '2026-09-10T08:00:00.000Z', to: '2026-09-14T08:00:00.000Z' },
    ]);
  });

  it('clearAll removes every v2 key, including ledgers, but keeps the theme', async () => {
    const a = new LocalStorageAdapter();
    window.localStorage.setItem('habittracker.v1.theme', 'dark');
    for (const key of [
      'habittracker.v2.habits',
      'habittracker.v2.tasks',
      'habittracker.v2.decay',
      'habittracker.v2.achievements.seen',
      'habittracker.v2.backfillDone',
      'habittracker.v2.streakResetDismissed',
      'habittracker.v2.levelSeen',
      'habittracker.v2.lastBackup',
      'habittracker.v2.tasksSeeded',
    ]) {
      window.localStorage.setItem(key, '1');
    }

    await a.clearAll();

    expect(storageKeys().filter((k) => k.startsWith('habittracker.v2.'))).toEqual([]);
    expect(window.localStorage.getItem('habittracker.v1.theme')).toBe('dark');
  });

  it('export carries the decay ledger and import restores it', async () => {
    const a = new LocalStorageAdapter();
    const ledger = { total: 120, appliedThrough: '2026-09-09' };
    window.localStorage.setItem(DECAY_KEY, JSON.stringify(ledger));

    const dump = await a.exportAll();
    expect(dump.decay).toEqual(ledger);

    await a.clearAll();
    await a.importAll(dump);

    expect(JSON.parse(window.localStorage.getItem(DECAY_KEY) ?? 'null')).toEqual(ledger);
  });

  it('importing an older backup without decay clears stale frost', async () => {
    const a = new LocalStorageAdapter();
    window.localStorage.setItem(
      DECAY_KEY,
      JSON.stringify({ total: 500, appliedThrough: '2026-09-09' }),
    );
    const legacy: ExportPayload = {
      schemaVersion: 1,
      exportedAt: '2026-09-10T00:00:00.000Z',
      habits: [],
      tasks: [],
      checkins: [],
      reflections: [],
      attendance: [],
    };

    await a.importAll(legacy);

    expect(window.localStorage.getItem(DECAY_KEY)).toBeNull();
    // An imported empty list must stay empty, not trigger starter data.
    expect(a.isSeeded()).toBe(true);
    expect(a.isTasksSeeded()).toBe(true);
  });

  it('marks data and quests as seeded so empty lists stay empty', async () => {
    const a = new LocalStorageAdapter();
    expect(a.isTasksSeeded()).toBe(false);
    a.markTasksSeeded();
    expect(a.isTasksSeeded()).toBe(true);
    await a.clearAll();
    expect(a.isTasksSeeded()).toBe(false);
  });

  it('wrong schemaVersion on import -> throws', async () => {
    const a = new LocalStorageAdapter();
    await expect(
      a.importAll({
        schemaVersion: 999,
        exportedAt: '',
        habits: [],
        tasks: [],
        checkins: [],
        reflections: [],
      } as unknown as Parameters<typeof a.importAll>[0]),
    ).rejects.toThrow();
  });
});
