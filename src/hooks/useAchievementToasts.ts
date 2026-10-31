/**
 * Achievement unlock toasts.
 * Diffs the freshly evaluated achievements against the seen-ledger, queues
 * any new unlocks, and shows them one at a time.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Achievement } from '../game/achievements';
import {
  newlyUnlockedIds,
  readSeenAchievementIds,
  writeSeenAchievementIds,
} from '../game/achievementSeen';

/** What the toast renders: badge identity plus display text. */
export interface UnlockToast {
  id: string;
  icon: string;
  name: string;
  desc: string;
  /** Informational card shown once for existing users, not a fresh unlock. */
  summary?: boolean;
}

const TOAST_MS = 6000;

/** Public shape of the toast queue consumed by `AchievementToast`. */
export interface AchievementToasts {
  toast: UnlockToast | null;
  /** How many more are waiting behind the current one. */
  queued: number;
  dismiss: () => void;
}

/** Watches achievements and surfaces unlocks that were never announced. */
export function useAchievementToasts(achievements: Achievement[], ready: boolean): AchievementToasts {
  const [queue, setQueue] = useState<UnlockToast[]>([]);
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!ready) return;
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);

    if (seenRef.current === null) {
      const stored = readSeenAchievementIds();
      if (stored === null) {
        // First run: adopt what is already unlocked without a burst of toasts,
        // but tell the climber the notifications exist.
        writeSeenAchievementIds(unlockedIds);
        seenRef.current = new Set(unlockedIds);
        if (unlockedIds.length > 0) {
          setQueue([
            {
              id: 'summary',
              icon: '🏅',
              name: `${unlockedIds.length} achievements already earned`,
              desc: 'New unlocks will pop up right here.',
              summary: true,
            },
          ]);
        }
        return;
      }
      seenRef.current = new Set(stored);
    }

    const fresh = newlyUnlockedIds(unlockedIds, [...seenRef.current]);
    if (fresh.length === 0) return;

    for (const id of fresh) seenRef.current.add(id);
    writeSeenAchievementIds([...seenRef.current]);
    setQueue((q) => [
      ...q,
      ...achievements
        .filter((a) => fresh.includes(a.id))
        .map((a) => ({ id: a.id, icon: a.icon, name: a.name, desc: a.desc })),
    ]);
  }, [achievements, ready]);

  useEffect(() => {
    if (queue.length === 0) return;
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [queue]);

  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);

  return { toast: queue[0] ?? null, queued: Math.max(0, queue.length - 1), dismiss };
}
