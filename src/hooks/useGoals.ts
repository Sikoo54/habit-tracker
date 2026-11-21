/**
 * Goals Hook
 * Loads the long-range goals and keeps every add, edit, star, and removal saved,
 * so the Goals page still reads the same after a refresh or restart.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { Goal, GoalInput } from '../types';
import { createId } from '../utils/dates';
import { toggleGoalStar as toggleStar } from '../utils/goals';

/** Keeps the Goals page scannable and the goal editor short. */
export const MAX_GOALS = 5;

/** Trims input and drops an empty target date instead of saving a blank one. */
function toGoal(input: GoalInput, id: string, createdAt: string): Goal {
  return {
    id,
    title: input.title.trim(),
    why: input.why.trim(),
    ...(input.targetDate.trim() ? { targetDate: input.targetDate.trim() } : {}),
    createdAt,
  };
}

/** Hook providing the goal list plus create, update, and remove actions. */
export function useGoals() {
  const storage = useStorage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getGoals()
      .then((saved) => {
        if (!alive) return;
        // Old saves have no star flag; keep their first goal featured as before.
        const normalized = saved.some((goal) => typeof goal.starred === 'boolean')
          ? saved
          : saved.map((goal, index) => (index === 0 ? { ...goal, starred: true } : goal));
        setGoals(normalized);
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
    void storage.saveGoals(goals).catch(() => undefined);
  }, [goals, storage]);

  const addGoal = useCallback(
    (input: GoalInput): { ok: boolean; reason?: string } => {
      if (!input.title.trim()) return { ok: false, reason: 'Goal title is required.' };
      if (goals.length >= MAX_GOALS) {
        return { ok: false, reason: `Max ${MAX_GOALS} goals. Remove one first.` };
      }
      const goal = toGoal(input, createId('goal'), new Date().toISOString());
      // The very first goal is featured by default, matching the old lead slot.
      setGoals((prev) => [...prev, goals.length === 0 ? { ...goal, starred: true } : goal]);
      return { ok: true };
    },
    [goals.length],
  );

  const updateGoal = useCallback(
    (id: string, input: GoalInput): { ok: boolean; reason?: string } => {
      if (!input.title.trim()) return { ok: false, reason: 'Goal title is required.' };
      setGoals((prev) =>
        prev.map((goal) => (goal.id === id ? toGoal(input, id, goal.createdAt) : goal)),
      );
      return { ok: true };
    },
    [],
  );

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  /** Stars or unstars a goal; any number of goals can be featured at once. */
  const toggleGoalStar = useCallback((id: string) => {
    setGoals((prev) => toggleStar(prev, id));
  }, []);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    removeGoal,
    toggleGoalStar,
  };
}
