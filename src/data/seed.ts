/**
 * Initial Starter Seed Data
 * Provides default starter habits and side quests when a user opens the app
 * for the first time.
 */

import type { Habit, Task } from '../types';
import { todayKey } from '../utils/dates';

const now = (): string => new Date().toISOString();

/** Generates starter habits (water, light exercise, reading) with 2-minute rule versions */
export function seedHabits(): Habit[] {
  return [
    {
      id: 'seed_habit_air',
      name: 'Drink water',
      fullVersion: 'Drink 8 glasses',
      smallVersion: 'Drink 1 glass',
      trigger: 'After morning toothbrush',
      active: true,
      weeklyGoal: 7,
      createdAt: now(),
    },
    {
      id: 'seed_habit_olahraga',
      name: 'Light exercise',
      fullVersion: 'Walk 30 minutes',
      smallVersion: 'Stretch 2 minutes',
      trigger: 'After lunch',
      active: true,
      weeklyGoal: 4,
      createdAt: now(),
    },
    {
      id: 'seed_habit_baca',
      name: 'Reading',
      fullVersion: 'Read 20 pages',
      smallVersion: 'Read 1 page',
      trigger: 'Before bed',
      active: true,
      weeklyGoal: 5,
      createdAt: now(),
    },
  ];
}

/** Generates default side quests for day one */
export function seedTasks(): Task[] {
  const date = todayKey();
  return [
    { id: 'seed_task_1', title: 'Finish the single most important work item', done: false, priority: false, date, createdAt: now() },
    { id: 'seed_task_2', title: 'Tidy desk for 5 minutes', done: false, priority: false, date, createdAt: now() },
  ];
}
