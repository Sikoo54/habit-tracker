import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageAdapter } from './localStorageAdapter';

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
        smallVersion: '1 hlmn',
        trigger: 'malam',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(await a.getHabits()).toHaveLength(1);
  });

  it('corrupt data -> empty, no throw', async () => {
    window.localStorage.setItem('habittracker.v2.habits', 'INI-BUKAN-JSON{{{');
    const a = new LocalStorageAdapter();
    expect(await a.getHabits()).toEqual([]);
  });

  it('invalid entries filtered', async () => {
    window.localStorage.setItem(
      'habittracker.v2.tasks',
      JSON.stringify([{ id: 'x' }, { id: 't1', title: 'Ok', done: false, priority: true, date: '2026-09-10', createdAt: 'x' }]),
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

  it('wrong schemaVersion on import -> throws', async () => {
    const a = new LocalStorageAdapter();
    await expect(
      a.importAll({ schemaVersion: 999, exportedAt: '', habits: [], tasks: [], checkins: [], reflections: [] } as unknown as Parameters<typeof a.importAll>[0]),
    ).rejects.toThrow();
  });
});
