import { useCallback, useEffect, useRef, useState } from 'react';
import { seedHabits } from '../data/seed';
import type { Habit } from '../types';
import { createId } from '../utils/dates';
import { localStorageAdapter } from '../storage/localStorageAdapter';
import { useStorage } from '../storage/StorageContext';

export const MAX_ACTIVE_HABITS = 5;

export interface NewHabitInput {
  name: string;
  fullVersion: string;
  smallVersion: string;
  trigger: string;
}

export function useHabits() {
  const storage = useStorage();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getHabits()
      .then((h) => {
        if (!alive) return;
        if (h.length === 0 && storage === localStorageAdapter) {
          // Seed once: avoid duplicates via adapter flag.
          const adapter = storage as typeof localStorageAdapter;
          if (!adapter.isSeeded()) {
            const seed = seedHabits();
            adapter.markSeeded();
            void storage.saveHabits(seed).then(() => {
              if (alive) {
                setHabits(seed);
                setLoading(false);
              }
            });
            loaded.current = true;
            return;
          }
        }
        setHabits(h);
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
    void storage.saveHabits(habits).catch(() => undefined);
  }, [habits, storage]);

  const addHabit = useCallback(
    (input: NewHabitInput): { ok: boolean; reason?: string } => {
      const active = habits.filter((h) => h.active).length;
      if (active >= MAX_ACTIVE_HABITS) {
        return { ok: false, reason: `Max ${MAX_ACTIVE_HABITS} active habits. Pause one first.` };
      }
      if (!input.name.trim()) return { ok: false, reason: 'Habit name is required.' };
      const h: Habit = {
        id: createId('habit'),
        name: input.name.trim(),
        fullVersion: input.fullVersion.trim() || input.name.trim(),
        smallVersion: input.smallVersion.trim() || 'Versi 2 menit',
        trigger: input.trigger.trim(),
        active: true,
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => [...prev, h]);
      return { ok: true };
    },
    [habits],
  );

  const toggleActive = useCallback((id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, active: !h.active } : h)));
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { habits, loading, addHabit, toggleActive, removeHabit, setHabits };
}
