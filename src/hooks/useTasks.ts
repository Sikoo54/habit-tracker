/**
 * Tasks Management Hook
 * Manages the daily side-quest list and syncing changes with storage. Habits are
 * the Main Quest; quests are optional extras.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seedTasks } from '../data/seed';
import { useStorage } from '../storage/StorageContext';
import { localStorageAdapter } from '../storage/localStorageAdapter';
import type { Task } from '../types';
import { createId } from '../utils/dates';
import { carryOver, dropLeftovers, leftoversOf } from '../utils/tasks';

/** Hook providing date-scoped side quests and task mutation operations */
export function useTasks(dateKey: string) {
  const storage = useStorage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getTasks()
      .then((all) => {
        if (!alive) return;
        if (all.length === 0 && storage === localStorageAdapter) {
          const seed = seedTasks();
          void storage.saveTasks(seed).then(() => {
            if (alive) {
              setTasks(seed);
              setLoading(false);
            }
          });
          loaded.current = true;
          return;
        }
        // Priorities no longer exist: undo unfinished ones so the old +25 slots
        // merge into side quests. Finished ones keep their flag so XP history
        // stays exactly as it was earned.
        setTasks(all.map((t) => (!t.done && t.priority ? { ...t, priority: false } : t)));
        setLoading(false);
        loaded.current = true;
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [storage]);

  useEffect(() => {
    if (!loaded.current) return;
    void storage.saveTasks(tasks).catch(() => undefined);
  }, [tasks, storage]);

  const todayTasks = tasks.filter((t) => t.date === dateKey && !t.dropped);

  // Unfinished quests from earlier days. Without this they would stay in
  // storage forever, invisible — user has to either carry them or let go.
  const leftovers = useMemo(() => leftoversOf(tasks, dateKey), [tasks, dateKey]);

  const addTask = useCallback(
    (title: string): { ok: boolean; reason?: string } => {
      const t = title.trim();
      if (!t) return { ok: false, reason: 'Task title is required.' };
      const task: Task = {
        id: createId('task'),
        title: t,
        done: false,
        priority: false,
        date: dateKey,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, task]);
      return { ok: true };
    },
    [dateKey],
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Carry every leftover quest onto today as a side quest. */
  const bringLeftovers = useCallback(() => {
    setTasks((prev) => carryOver(prev, dateKey));
  }, [dateKey]);

  /** Let leftovers go without destroying them — flagged and hidden for good. */
  const dropAllLeftovers = useCallback(() => {
    setTasks((prev) => dropLeftovers(prev, dateKey));
  }, [dateKey]);

  return {
    tasks,
    todayTasks,
    quests: todayTasks,
    leftovers,
    loading,
    addTask,
    toggleTask,
    removeTask,
    bringLeftovers,
    dropLeftovers: dropAllLeftovers,
    setTasks,
  };
}
