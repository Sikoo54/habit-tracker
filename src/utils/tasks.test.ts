import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { carryOver, dropLeftovers, leftoversOf } from './tasks';

const TODAY = '2026-10-31';
const YESTERDAY = '2026-10-30';
const OLDER = '2026-10-28';

function task(over: Partial<Task> & Pick<Task, 'id' | 'date'>): Task {
  return { title: over.id, done: false, priority: false, createdAt: '2026-10-01T00:00:00.000Z', ...over };
}

describe('leftover quests', () => {
  it('collects undone quests from earlier days, oldest first', () => {
    const all = [
      task({ id: 'a', date: TODAY }),
      task({ id: 'b', date: YESTERDAY }),
      task({ id: 'c', date: OLDER }),
      task({ id: 'd', date: YESTERDAY, done: true }),
      task({ id: 'e', date: YESTERDAY, dropped: true }),
    ];
    expect(leftoversOf(all, TODAY).map((t) => t.id)).toEqual(['c', 'b']);
  });

  it('ignores future quests', () => {
    expect(leftoversOf([task({ id: 'f', date: '2026-11-05' })], TODAY)).toEqual([]);
  });

  it('moves leftovers to today and keeps finished quests alone', () => {
    const all = [task({ id: 'a', date: YESTERDAY }), task({ id: 'b', date: OLDER, done: true })];
    const moved = carryOver(all, TODAY, 3);
    expect(moved.find((t) => t.id === 'a')?.date).toBe(TODAY);
    expect(moved.find((t) => t.id === 'b')?.date).toBe(OLDER);
    expect(leftoversOf(moved, TODAY)).toEqual([]);
  });

  it('demotes priorities beyond the daily cap instead of dropping them', () => {
    const all = [
      task({ id: 'p1', date: TODAY, priority: true }),
      task({ id: 'p2', date: TODAY, priority: true }),
      task({ id: 'p3', date: TODAY, priority: true }),
      task({ id: 'old', date: YESTERDAY, priority: true }),
    ];
    const moved = carryOver(all, TODAY, 3);
    expect(moved.find((t) => t.id === 'old')?.priority).toBe(false);
    expect(moved.find((t) => t.id === 'old')?.date).toBe(TODAY);
  });

  it('fills remaining priority slots first', () => {
    const all = [
      task({ id: 'p1', date: TODAY, priority: true }),
      task({ id: 'old1', date: OLDER, priority: true }),
      task({ id: 'old2', date: YESTERDAY, priority: true }),
    ];
    const moved = carryOver(all, TODAY, 3);
    expect(moved.find((t) => t.id === 'old1')?.priority).toBe(true);
    expect(moved.find((t) => t.id === 'old2')?.priority).toBe(true);
  });

  it('lets go without deleting the record', () => {
    const all = [task({ id: 'a', date: YESTERDAY }), task({ id: 'b', date: TODAY })];
    const next = dropLeftovers(all, TODAY);
    expect(next.find((t) => t.id === 'a')?.dropped).toBe(true);
    expect(next.find((t) => t.id === 'b')?.dropped).toBeUndefined();
    expect(next).toHaveLength(2);
    expect(leftoversOf(next, TODAY)).toEqual([]);
  });
});
