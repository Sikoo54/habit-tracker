import { useEffect, useMemo, useState } from 'react';
import { evaluateAchievements, type Achievement } from '../game/achievements';
import {
  creatureForLevel,
  levelProgress,
  nextStage,
  totalXp,
  type CreatureStage,
  type LevelProgress,
} from '../game/xp';
import type { Checkin, Habit, Reflection, Task } from '../types';

export interface GameStats {
  xp: number;
  progress: LevelProgress;
  creature: CreatureStage;
  next: CreatureStage | null;
  achievements: Achievement[];
  unlockedCount: number;
}

export function useGameStats(
  habits: Habit[],
  checkins: Checkin[],
  tasks: Task[],
  reflections: Reflection[],
  todayKey: string,
): GameStats {
  return useMemo(() => {
    const xp = totalXp(checkins, tasks, reflections);
    const progress = levelProgress(xp);
    const creature = creatureForLevel(progress.level);
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
      progress,
      creature,
      next: nextStage(progress.level),
      achievements,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
    };
  }, [habits, checkins, tasks, reflections, todayKey]);
}

const SEEN_KEY = 'habittracker.v2.levelSeen';

function readSeen(): number {
  try {
    return Number(window.localStorage.getItem(SEEN_KEY)) || 1;
  } catch {
    return 1;
  }
}

/** Shows a celebration the first time a new level is reached. */
export function useLevelUp(level: number): { show: boolean; dismiss: () => void } {
  const [seen, setSeen] = useState<number>(readSeen);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level > seen) setShow(true);
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
