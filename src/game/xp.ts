/**
 * XP & Progression Engine
 * Calculates experience points (XP) earned from habits, tasks, reflections,
 * and attendance. Computes level thresholds, companion creature evolutions, and ranks.
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

// --- Ascension spirit: your companion climbs with your level ---

/** Creature companion stage definition */
export interface CreatureStage {
  level: number;
  emoji: string;
  name: string;
  tagline: string;
}

/** Companion evolution stages */
export const CREATURE_STAGES: CreatureStage[] = [
  { level: 1, emoji: '🥚', name: 'Mysterious Egg', tagline: 'Every legend starts somewhere.' },
  { level: 2, emoji: '🌱', name: 'Sproutling', tagline: 'It hatched! Keep it alive.' },
  { level: 3, emoji: '🌿', name: 'Sapling', tagline: 'Growing steady, day by day.' },
  { level: 4, emoji: '🌳', name: 'Grove Guardian', tagline: 'Roots deep. You show up.' },
  { level: 5, emoji: '🌸', name: 'Bloom', tagline: 'Consistency looks good on you.' },
  { level: 6, emoji: '🦉', name: 'Night Owl', tagline: 'Wise. Reflective. Ascending.' },
  { level: 7, emoji: '🐉', name: 'Sky Dragon', tagline: 'Small steps, mythical heights.' },
  { level: 8, emoji: '👑', name: 'Ascendant', tagline: 'Peak form. Maintain the flame.' },
];

/** Resolves creature companion for a specific level */
export function creatureForLevel(level: number): CreatureStage {
  let stage = CREATURE_STAGES[0] as CreatureStage;
  for (const s of CREATURE_STAGES) {
    if (level >= s.level) stage = s;
  }
  return stage;
}

/** Retrieves the next companion evolution stage, if any */
export function nextStage(level: number): CreatureStage | null {
  return CREATURE_STAGES.find((s) => s.level > level) ?? null;
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
