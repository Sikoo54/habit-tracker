/**
 * XP & Progression Engine
 * Calculates experience points (XP) earned from habits, tasks, reflections,
 * and attendance. Computes level thresholds, route position, and ranks.
 */

import type { Attendance, Checkin, Reflection, Task } from '../types';
import { attendanceXp } from './attendance';

// XP is DERIVED from existing data — no new storage, no migration.
// Full version > small version, priorities > side quests, reflection = bonus.

/** XP values awarded for different user activities */
export const XP = {
  checkinFull: 20,
  checkinSmall: 10,
  taskPriority: 25,
  taskOther: 15,
  reflection: 15,
  reflectionBonus: 5, // mood + energy both filled
} as const;

/** Calculates XP awarded for a habit check-in variant */
export function xpForCheckin(variant: 'full' | 'small'): number {
  return variant === 'full' ? XP.checkinFull : XP.checkinSmall;
}

/** Calculates XP awarded for completing a task */
export function xpForTask(priority: boolean): number {
  return priority ? XP.taskPriority : XP.taskOther;
}

/** Computes total gross XP accumulated across all activities */
export function totalXp(
  checkins: Checkin[],
  tasks: Task[],
  reflections: Reflection[],
  attendance: Attendance[] = [],
): number {
  let xp = 0;
  for (const c of checkins) xp += xpForCheckin(c.variant);
  for (const t of tasks) if (t.done) xp += xpForTask(t.priority);
  for (const r of reflections) {
    xp += XP.reflection;
    if (r.mood !== null && r.energy !== null) xp += XP.reflectionBonus;
  }
  return xp + attendanceXp(attendance);
}

/** Cumulative XP needed to REACH a level. L1=0, L2=100, L3=300, L4=600, L5=1000... */
export function xpThreshold(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 50 * n * (n + 1);
}

/** Determines level reached for a given XP amount */
export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpThreshold(level + 1)) level += 1;
  return level;
}

/** Detailed level progression breakdown (current XP, needed XP, percentage) */
export interface LevelProgress {
  level: number;
  xp: number;
  current: number; // XP earned within this level
  needed: number; // XP needed to finish this level
  pct: number; // 0..100
}

/** Computes level progress percentage and XP remaining for the current level */
export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const base = xpThreshold(level);
  const next = xpThreshold(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { level, xp, current, needed, pct: needed === 0 ? 100 : Math.round((current / needed) * 100) };
}

// --- Ascent: your level is how high up the mountain you stand ---
//
// No mascot. Levelling up literally moves you up the route, so the word
// "Ascend" in the app name means something. #1 is the tent at the bottom,
// #8 is the flag at the top.

/** One point on the climbing route. */
export interface AscentStage {
  level: number;
  emoji: string;
  name: string;
  tagline: string;
}

/** Route from base camp to the summit. */
export const ASCENT_STAGES: AscentStage[] = [
  { level: 1, emoji: '🏕️', name: 'Base Camp', tagline: 'Gear packed. The climb starts here.' },
  { level: 2, emoji: '🥾', name: 'Trailhead', tagline: 'Boots on. The first steps count.' },
  { level: 3, emoji: '🌲', name: 'Tree Line', tagline: 'Out of the forest, into thin air.' },
  { level: 4, emoji: '🪨', name: 'Ridge', tagline: 'Exposed and windy — still moving up.' },
  { level: 5, emoji: '❄️', name: 'Snow Line', tagline: 'Cold, quiet, steady feet.' },
  { level: 6, emoji: '⛰️', name: 'Summit Push', tagline: 'The last stretch. Hold the pace.' },
  { level: 7, emoji: '🏔️', name: 'Summit', tagline: 'You made the top. Look how far.' },
  { level: 8, emoji: '🚩', name: 'Flag Planted', tagline: 'The peak was never the limit.' },
];

/** Where on the route a level stands. */
export function ascentForLevel(level: number): AscentStage {
  let stage = ASCENT_STAGES[0] as AscentStage;
  for (const s of ASCENT_STAGES) {
    if (level >= s.level) stage = s;
  }
  return stage;
}

/** Next point on the route, if any. */
export function nextAscent(level: number): AscentStage | null {
  return ASCENT_STAGES.find((s) => s.level > level) ?? null;
}

// --- Ascension ranks: titles instead of bare numbers ---
// Early ranks sound like grinding, late ranks like consistency.

/** Player rank title definition */
export interface Rank {
  level: number;
  title: string;
}

/** Player rank progression milestones */
export const RANKS: Rank[] = [
  { level: 1, title: 'Grinder' },
  { level: 2, title: 'Striver' },
  { level: 3, title: 'Climber' },
  { level: 4, title: 'Trailblazer' },
  { level: 5, title: 'Stalwart' },
  { level: 6, title: 'Mainstay' },
  { level: 7, title: 'Paragon' },
  { level: 8, title: 'Ascendant' },
];

/** Resolves player rank title for a specific level */
export function rankForLevel(level: number): Rank {
  let rank = RANKS[0] as Rank;
  for (const r of RANKS) {
    if (level >= r.level) rank = r;
  }
  return rank;
}
