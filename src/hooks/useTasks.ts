import { useCallback, useEffect, useRef, useState } from 'react';
import { seedTasks } from '../data/seed';
import { useStorage } from '../storage/StorageContext';
import { localStorageAdapter } from '../storage/localStorageAdapter';
import type { Task } from '../types';
import { createId } from '../utils/dates';

export const MAX_PRIORITIES = 3;

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
        setTasks(all);
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

  const todayTasks = tasks.filter((t) => t.date === dateKey);
  const priorities = todayTasks.filter((t) => t.priority);
  const others = todayTasks.filter((t) => !t.priority);

  const addTask = useCallback(
    (title: string, priority: boolean): { ok: boolean; reason?: string } => {
      const t = title.trim();
      if (!t) return { ok: false, reason: 'Task title is required.' };
      if (priority && priorities.length >= MAX_PRIORITIES) {
        return { ok: false, reason: `Priorities are full (${MAX_PRIORITIES}). Task goes to the Other List.` };
      }
      const task: Task = {
        id: createId('task'),
        title: t,
        done: false,
        priority,
        date: dateKey,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, task]);
      return { ok: true };
    },
    [dateKey, priorities.length],
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, todayTasks, priorities, others, loading, addTask, toggleTask, removeTask, setTasks };
}
