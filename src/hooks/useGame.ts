/**
 * Game Progression & Mechanics Hooks
 * Coordinates overall player progression stats, evaluates frost decay penalty ledger,
 * and triggers level-up celebration dialogs.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { evaluateAchievements, type Achievement } from '../game/achievements';
import { activeDates, dailyStreak } from '../game/dailyStreak';
import {
  applyDecay,
  eachDayAfter,
  MAX_CATCHUP_DAYS,
  type AppliedPenalty,
  type DecayLedger,
} from '../game/decay';
import {
  ascentForLevel,
  levelProgress,
  nextAscent,
  RANKS,
  rankForLevel,
  totalXp,
  type AscentStage,
  type LevelProgress,
  type Rank,
} from '../game/xp';
import type { Attendance, Checkin, Habit, Reflection, Task } from '../types';
import { addDays } from '../utils/dates';

/** Combined game stats payload for HUD and profile display */
export interface GameStats {
  xp: number; // net after frost decay
  grossXp: number;
  decayTotal: number;
  streak: number;
  todayActive: boolean;
  progress: LevelProgress;
  rank: Rank;
  nextRank: Rank | null;
  ascent: AscentStage;
  nextAscent: AscentStage | null;
  achievements: Achievement[];
  unlockedCount: number;
}

/** Hook computing real-time game statistics and achievement unlocks */
export function useGameStats(
  habits: Habit[],
  checkins: Checkin[],
  tasks: Task[],
  reflections: Reflection[],
  attendance: Attendance[],
  todayKey: string,
  decayTotal: number,
): GameStats {
  return useMemo(() => {
    const grossXp = totalXp(checkins, tasks, reflections, attendance);
    const xp = Math.max(0, grossXp - decayTotal);
    const progress = levelProgress(xp);
    const rank = rankForLevel(progress.level);
    const ascent = ascentForLevel(progress.level);
    const dates = activeDates(checkins, tasks, reflections, attendance);
    const achievements = evaluateAchievements({
      habits,
      checkins,
      tasks,
      reflections,
      todayKey,
      level: progress.level,
    });
    return {
      xp,
      grossXp,
      decayTotal,
      streak: dailyStreak(dates, todayKey),
      todayActive: dates.has(todayKey),
      progress,
      rank,
      nextRank: RANKS.find((r) => r.level === progress.level + 1) ?? null,
      ascent,
      nextAscent: nextAscent(progress.level),
      achievements,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
    };
  }, [habits, checkins, tasks, reflections, attendance, todayKey, decayTotal]);
}

const DECAY_KEY = 'habittracker.v2.decay';

function readLedger(): DecayLedger {
  try {
    const raw = window.localStorage.getItem(DECAY_KEY);
    if (!raw) return { total: 0, appliedThrough: null };
    const p = JSON.parse(raw) as Partial<DecayLedger>;
    return {
      total: typeof p.total === 'number' && p.total >= 0 ? p.total : 0,
      appliedThrough: typeof p.appliedThrough === 'string' || p.appliedThrough === null ? (p.appliedThrough ?? null) : null,
    };
  } catch {
    return { total: 0, appliedThrough: null };
  }
}

function persistLedger(l: DecayLedger): void {
  try {
    window.localStorage.setItem(DECAY_KEY, JSON.stringify(l));
  } catch {
    // ignore (private mode etc.)
  }
}

/** Current decay ledger plus the penalties applied on this load, for the banner. */
export interface DecayState {
  ledger: DecayLedger;
  /** Freshly applied penalties (this load only). Null after dismiss. */
  notice: AppliedPenalty[] | null;
  dismissNotice: () => void;
}

/**
 * Burns XP for fully idle days, once per day, on load.
 * Never penalizes today. Ancient history is forgiven (catch-up capped).
 */
export function useDecayLedger(
  grossXp: number,
  dates: Set<string>,
  lastActive: string | null,
  today: string,
  ready: boolean,
): DecayState {
  const [ledger, setLedger] = useState<DecayLedger>(readLedger);
  const [notice, setNotice] = useState<AppliedPenalty[] | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!ready || ranRef.current) return;
    ranRef.current = true;
    const yesterday = addDays(today, -1);
    const stored = readLedger();

    const cursor = stored.appliedThrough ?? lastActive;
    if (cursor === null) {
      // Brand-new: nothing to judge yet.
      const init: DecayLedger = { total: stored.total, appliedThrough: yesterday };
      persistLedger(init);
      setLedger(init);
      return;
    }

    let missed = eachDayAfter(cursor, today);
    if (stored.appliedThrough === null && missed.length > MAX_CATCHUP_DAYS) {
      missed = missed.slice(-MAX_CATCHUP_DAYS);
    }
    if (missed.length === 0) {
      if (stored.appliedThrough !== yesterday) {
        const next: DecayLedger = { total: stored.total, appliedThrough: yesterday };
        persistLedger(next);
        setLedger(next);
      }
      return;
    }

    const { ledger: next, applied } = applyDecay(stored, grossXp, missed);
    next.appliedThrough = yesterday; // every day before today is now settled
    persistLedger(next);
    setLedger(next);
    setNotice(applied);
  }, [ready, grossXp, dates, lastActive, today]);

  const dismissNotice = (): void => setNotice(null);

  return { ledger, notice, dismissNotice };
}

const SEEN_KEY = 'habittracker.v2.levelSeen';

function readSeen(): number {
  try {
    return Number(window.localStorage.getItem(SEEN_KEY)) || 1;
  } catch {
    return 1;
  }
}

/** Celebrates new levels; silently re-arms if frost dropped you down. */
export function useLevelUp(level: number): { show: boolean; dismiss: () => void } {
  const [seen, setSeen] = useState<number>(readSeen);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level > seen) {
      setShow(true);
    } else if (level < seen) {
      try {
        window.localStorage.setItem(SEEN_KEY, String(level));
      } catch {
        // ignore
      }
      setSeen(level);
    }
  }, [level, seen]);

  const dismiss = (): void => {
    try {
      window.localStorage.setItem(SEEN_KEY, String(level));
    } catch {
      // ignore
    }
    setSeen(level);
    setShow(false);
  };

  return { show, dismiss };
}
