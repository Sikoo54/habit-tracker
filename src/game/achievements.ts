/**
 * Achievements System
 * Defines permanent milestones and evaluates badges from the history the user
 * has already built. Every check is monotonic: resetting a streak, missing a
 * day, or losing XP to frost can never take a badge away again.
 */

import type { Attendance, Checkin, Habit, Reflection, Task } from '../types';
import { startOfWeekMonday } from '../utils/dates';
import { bestTrainingStreak, trainingDays } from './trainingStreak';
import { levelForXp } from './xp';

/** Badge weight, used for colour and the unlock toast. */
export type AchievementTier = 'bronze' | 'silver' | 'gold';

/** Section the badge belongs to on the Stats page. */
export type AchievementCategory =
  'habits' | 'streaks' | 'quests' | 'reflection' | 'attendance' | 'progression';

/** Snapshot of player data passed into achievement evaluators. */
export interface GameData {
  habits: Habit[];
  checkins: Checkin[];
  tasks: Task[];
  reflections: Reflection[];
  attendance: Attendance[];
  /** XP earned before frost decay — monotonic, unlike the current level. */
  grossXp: number;
}

/** Evaluated achievement badge state. */
export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  unlocked: boolean;
  /** Display form, e.g. "7/10". */
  progress: string;
  /** Raw progress, may exceed the target. */
  current: number;
  target: number;
  tier: AchievementTier;
  category: AchievementCategory;
}

interface Goal {
  current: number;
  target: number;
  unlocked: boolean;
}

interface Def {
  id: string;
  icon: string;
  name: string;
  desc: string;
  tier: AchievementTier;
  category: AchievementCategory;
  check: (d: GameData) => Goal;
}

/** Build a progress goal that unlocks once `current` reaches `target`. */
function goal(current: number, target: number): Goal {
  return { current, target, unlocked: current >= target };
}

/** Best number of perfect days inside one Monday–Sunday week. */
function bestPerfectWeek(habits: Habit[], checkins: Checkin[]): number {
  const perWeek = new Map<string, number>();
  for (const day of trainingDays(habits, checkins)) {
    const monday = startOfWeekMonday(day);
    perWeek.set(monday, (perWeek.get(monday) ?? 0) + 1);
  }
  let best = 0;
  for (const count of perWeek.values()) if (count > best) best = count;
  return best;
}

const DEFS: Def[] = [
  // Habits: volume of honest taps.
  {
    id: 'first-step',
    icon: '🌱',
    name: 'First Step',
    desc: 'Complete any habit once.',
    tier: 'bronze',
    category: 'habits',
    check: (d) => goal(d.checkins.length, 1),
  },
  {
    id: 'habit-devotee',
    icon: '🧗',
    name: 'Habit Devotee',
    desc: 'Complete 25 habits.',
    tier: 'bronze',
    category: 'habits',
    check: (d) => goal(d.checkins.length, 25),
  },
  {
    id: 'iron-routine',
    icon: '⛰️',
    name: 'Iron Routine',
    desc: 'Complete 50 habits.',
    tier: 'silver',
    category: 'habits',
    check: (d) => goal(d.checkins.length, 50),
  },

  // Streaks: best run ever, so a reset cannot relock a badge.
  {
    id: 'perfect-day',
    icon: '⭐',
    name: 'Perfect Day',
    desc: 'Finish every main quest in one day.',
    tier: 'bronze',
    category: 'streaks',
    check: (d) => goal(trainingDays(d.habits, d.checkins).size, 1),
  },
  {
    id: 'streak-3',
    icon: '🔥',
    name: 'On Fire',
    desc: 'Finish every main quest 3 days in a row.',
    tier: 'bronze',
    category: 'streaks',
    check: (d) => goal(bestTrainingStreak(d.habits, d.checkins), 3),
  },
  {
    id: 'streak-7',
    icon: '☄️',
    name: 'Unstoppable',
    desc: 'Finish every main quest 7 days in a row.',
    tier: 'silver',
    category: 'streaks',
    check: (d) => goal(bestTrainingStreak(d.habits, d.checkins), 7),
  },
  {
    id: 'streak-30',
    icon: '🏔️',
    name: 'Unbroken',
    desc: 'Finish every main quest 30 days in a row.',
    tier: 'gold',
    category: 'streaks',
    check: (d) => goal(bestTrainingStreak(d.habits, d.checkins), 30),
  },
  {
    id: 'week-warrior',
    icon: '🏆',
    name: 'Week Warrior',
    desc: 'Finish a full board on 5 days in one week.',
    tier: 'silver',
    category: 'streaks',
    check: (d) => goal(bestPerfectWeek(d.habits, d.checkins), 5),
  },

  // Quests: optional work still leaves a mark.
  {
    id: 'quest-slayer',
    icon: '🗡️',
    name: 'Quest Slayer',
    desc: 'Complete 15 side quests.',
    tier: 'bronze',
    category: 'quests',
    check: (d) => goal(d.tasks.filter((t) => t.done).length, 15),
  },
  {
    id: 'priority-master',
    icon: '🎯',
    name: 'Quest Runner',
    desc: 'Complete 25 side quests.',
    tier: 'silver',
    category: 'quests',
    check: (d) => goal(d.tasks.filter((t) => t.done).length, 25),
  },
  {
    id: 'questmaster',
    icon: '📜',
    name: 'Questmaster',
    desc: 'Complete 50 side quests.',
    tier: 'gold',
    category: 'quests',
    check: (d) => goal(d.tasks.filter((t) => t.done).length, 50),
  },

  // Reflection: understanding the day, not just logging it.
  {
    id: 'night-owl',
    icon: '🌙',
    name: 'Night Owl',
    desc: 'Write 3 reflections.',
    tier: 'bronze',
    category: 'reflection',
    check: (d) => goal(d.reflections.length, 3),
  },
  {
    id: 'mindful',
    icon: '🧘',
    name: 'Mindful',
    desc: 'Log mood + energy once.',
    tier: 'bronze',
    category: 'reflection',
    check: (d) => goal(d.reflections.filter((r) => r.mood !== null && r.energy !== null).length, 1),
  },
  {
    id: 'in-tune',
    icon: '🎧',
    name: 'In Tune',
    desc: 'Log mood + energy on 5 days.',
    tier: 'silver',
    category: 'reflection',
    check: (d) => goal(d.reflections.filter((r) => r.mood !== null && r.energy !== null).length, 5),
  },

  // Attendance: being there at the edges of the day.
  {
    id: 'early-riser',
    icon: '🌅',
    name: 'Early Riser',
    desc: 'Sign the morning logbook 10 times.',
    tier: 'silver',
    category: 'attendance',
    check: (d) => goal(d.attendance.filter((a) => a.morning).length, 10),
  },
  {
    id: 'night-watch',
    icon: '🌌',
    name: 'Night Watch',
    desc: 'Sign the night logbook 10 times.',
    tier: 'silver',
    category: 'attendance',
    check: (d) => goal(d.attendance.filter((a) => a.night).length, 10),
  },

  // Progression: gross XP only, because frost can lower the live level.
  {
    id: 'evolving',
    icon: '🌲',
    name: 'Ascension',
    desc: 'Reach the Steady rank.',
    tier: 'bronze',
    category: 'progression',
    check: (d) => goal(levelForXp(d.grossXp) - 1, 1),
  },
];

/** Evaluates all achievement definitions against the latest game state. */
export function evaluateAchievements(data: GameData): Achievement[] {
  return DEFS.map((def) => {
    const result = def.check(data);
    return {
      id: def.id,
      icon: def.icon,
      name: def.name,
      desc: def.desc,
      unlocked: result.unlocked,
      progress: `${Math.min(result.current, result.target)}/${result.target}`,
      current: result.current,
      target: result.target,
      tier: def.tier,
      category: def.category,
    };
  });
}
