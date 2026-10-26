/**
 * Achievements System
 * Defines game milestones and dynamically evaluates unlocked badges
 * based on checkins, streaks, reflections, tasks, and player rank.
 */

import type { Checkin, Habit, Reflection, Task } from '../types';
import { compareWeeks } from '../utils/stats';
import { calculateStreak } from '../utils/streak';

/** Snapshot of player data passed into achievement evaluators */
export interface GameData {
  habits: Habit[];
  checkins: Checkin[];
  tasks: Task[];
  reflections: Reflection[];
  todayKey: string;
  level: number;
}

/** Evaluated achievement badge state */
export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  unlocked: boolean;
  progress: string; // e.g. "7/10"
}

interface Def {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (d: GameData) => { unlocked: boolean; progress: string };
}

function countCheckins(checkins: Checkin[], variant?: 'full' | 'small'): number {
  return checkins.filter((c) => !variant || c.variant === variant).length;
}

function maxStreak(habits: Habit[], checkins: Checkin[], ref: string): number {
  let best = 0;
  for (const h of habits) {
    const dates = checkins.filter((c) => c.habitId === h.id).map((c) => c.date);
    best = Math.max(best, calculateStreak(dates, ref));
  }
  return best;
}

const DEFS: Def[] = [
  {
    id: 'first-step',
    icon: '🌱',
    name: 'First Step',
    desc: 'Complete any habit once.',
    check: (d) => ({ unlocked: d.checkins.length >= 1, progress: `${Math.min(d.checkins.length, 1)}/1` }),
  },
  {
    id: 'small-wins',
    icon: '🐜',
    name: 'Small Wins',
    desc: 'Finish 10 small versions.',
    check: (d) => {
      const n = countCheckins(d.checkins, 'small');
      return { unlocked: n >= 10, progress: `${Math.min(n, 10)}/10` };
    },
  },
  {
    id: 'full-power',
    icon: '💪',
    name: 'Full Power',
    desc: 'Finish 10 full versions.',
    check: (d) => {
      const n = countCheckins(d.checkins, 'full');
      return { unlocked: n >= 10, progress: `${Math.min(n, 10)}/10` };
    },
  },
  {
    id: 'quest-slayer',
    icon: '🗡️',
    name: 'Quest Slayer',
    desc: 'Complete 15 tasks.',
    check: (d) => {
      const n = d.tasks.filter((t) => t.done).length;
      return { unlocked: n >= 15, progress: `${Math.min(n, 15)}/15` };
    },
  },
  {
    id: 'priority-master',
    icon: '🎯',
    name: 'Priority Master',
    desc: 'Complete 10 priority quests.',
    check: (d) => {
      const n = d.tasks.filter((t) => t.done && t.priority).length;
      return { unlocked: n >= 10, progress: `${Math.min(n, 10)}/10` };
    },
  },
  {
    id: 'perfect-day',
    icon: '⭐',
    name: 'Perfect Day',
    desc: 'Finish everything due today.',
    check: (d) => {
      const todays = d.tasks.filter((t) => t.date === d.todayKey);
      const active = d.habits.filter((h) => h.active);
      const doneTasks = todays.filter((t) => t.done).length;
      const doneHabits = active.filter((h) => d.checkins.some((c) => c.habitId === h.id && c.date === d.todayKey)).length;
      const total = todays.length + active.length;
      const done = doneTasks + doneHabits;
      return { unlocked: total > 0 && done === total, progress: `${done}/${total}` };
    },
  },
  {
    id: 'streak-3',
    icon: '🔥',
    name: 'On Fire',
    desc: 'Reach a 3-day streak.',
    check: (d) => {
      const n = maxStreak(d.habits, d.checkins, d.todayKey);
      return { unlocked: n >= 3, progress: `${Math.min(n, 3)}/3` };
    },
  },
  {
    id: 'streak-7',
    icon: '☄️',
    name: 'Unstoppable',
    desc: 'Reach a 7-day streak.',
    check: (d) => {
      const n = maxStreak(d.habits, d.checkins, d.todayKey);
      return { unlocked: n >= 7, progress: `${Math.min(n, 7)}/7` };
    },
  },
  {
    id: 'night-owl',
    icon: '🌙',
    name: 'Night Owl',
    desc: 'Write 3 reflections.',
    check: (d) => ({ unlocked: d.reflections.length >= 3, progress: `${Math.min(d.reflections.length, 3)}/3` }),
  },
  {
    id: 'mindful',
    icon: '🧘',
    name: 'Mindful',
    desc: 'Log mood + energy once.',
    check: (d) => {
      const n = d.reflections.filter((r) => r.mood !== null && r.energy !== null).length;
      return { unlocked: n >= 1, progress: `${Math.min(n, 1)}/1` };
    },
  },
  {
    id: 'week-warrior',
    icon: '🏆',
    name: 'Week Warrior',
    desc: 'Hit 80%+ habits this week.',
    check: (d) => {
      const c = compareWeeks(d.habits, d.checkins, d.todayKey);
      const ok = d.habits.some((h) => h.active) && c.thisWeek.rate >= 0.8;
      return { unlocked: ok, progress: `${Math.round(c.thisWeek.rate * 100)}%/80%` };
    },
  },
  {
    id: 'evolving',
    icon: '🌲',
    name: 'Ascension',
    desc: 'Earn the Striver rank.',
    check: (d) => ({ unlocked: d.level >= 2, progress: `rank ${d.level}/2` }),
  },
];

/** Evaluates all achievement definitions against the latest game state */
export function evaluateAchievements(data: GameData): Achievement[] {
  return DEFS.map((d) => {
    const r = d.check(data);
    return { id: d.id, icon: d.icon, name: d.name, desc: d.desc, unlocked: r.unlocked, progress: r.progress };
  });
}
