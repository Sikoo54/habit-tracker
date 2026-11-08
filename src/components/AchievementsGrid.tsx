/**
 * Achievements Grid Component
 * Groups badges by theme, shows overall completion, and gives every locked
 * badge a visible progress bar so the next milestone is always obvious.
 */

import type { ReactNode } from 'react';
import type { Achievement, AchievementCategory, AchievementTier } from '../game/achievements';

const SECTIONS: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'habits', label: 'Habits', icon: '🌱' },
  { id: 'streaks', label: 'Streaks', icon: '🔥' },
  { id: 'quests', label: 'Quests', icon: '📜' },
  { id: 'reflection', label: 'Reflection', icon: '🌙' },
  { id: 'attendance', label: 'Attendance', icon: '🌅' },
  { id: 'progression', label: 'Progression', icon: '🏔️' },
];

const TIER_ICON: Record<AchievementTier, string> = {
  bronze: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  silver: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  gold: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
};

const TIER_BAR: Record<AchievementTier, string> = {
  bronze: 'bg-amber-500',
  silver: 'bg-slate-400 dark:bg-slate-300',
  gold: 'bg-yellow-500',
};

const TIER_CHIP: Record<AchievementTier, string> = {
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  silver: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
};

const TIER_LABEL: Record<AchievementTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
};

/** Grid display of all achievements, grouped by theme with per-badge progress. */
export function AchievementsGrid({
  achievements,
  unlockedCount,
}: {
  achievements: Achievement[];
  unlockedCount: number;
}): ReactNode {
  const total = achievements.length;
  const pct = total === 0 ? 0 : Math.round((unlockedCount / total) * 100);
  const groups = SECTIONS.map((section) => ({
    ...section,
    items: achievements.filter((a) => a.category === section.id),
  })).filter((group) => group.items.length > 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title text-slate-400 dark:text-slate-500">🏅 Achievements</h2>
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {unlockedCount}/{total} earned
        </span>
      </div>

      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={unlockedCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Achievement completion"
      >
        <div
          className="h-full rounded-full bg-summit-500 transition-all duration-500 dark:bg-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      {groups.map((group) => {
        const earned = group.items.filter((a) => a.unlocked).length;
        return (
          <section key={group.id} className="mt-5" aria-label={`${group.label} achievements`}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="section-title text-slate-400 dark:text-slate-500">
                <span aria-hidden="true">{group.icon}</span> {group.label}
              </h3>
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                {earned}/{group.items.length}
              </span>
            </div>

            <ul className="mt-2 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              {group.items.map((a) => (
                <li
                  key={a.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 ${
                    a.unlocked
                      ? 'border-cream-200 bg-cream-50 dark:border-slate-700 dark:bg-slate-900/60'
                      : 'border-cream-200/60 bg-cream-50/40 dark:border-slate-800 dark:bg-slate-900/20'
                  }`}
                >
                  <span
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl ${
                      a.unlocked
                        ? TIER_ICON[a.tier]
                        : 'bg-cream-200/70 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    <span aria-hidden="true" className={a.unlocked ? '' : 'opacity-30 grayscale'}>
                      {a.icon}
                    </span>
                    {a.unlocked ? null : (
                      <span className="absolute -bottom-1 -right-1 text-[11px]" aria-hidden="true">
                        🔒
                      </span>
                    )}
                    <span className="sr-only">
                      {TIER_LABEL[a.tier]} tier, {a.unlocked ? 'unlocked' : 'locked'}
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm font-bold leading-tight ${
                          a.unlocked ? '' : 'text-ink-600 dark:text-slate-300'
                        }`}
                      >
                        {a.name}
                      </p>
                      {a.unlocked ? (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TIER_CHIP[a.tier]}`}
                        >
                          {a.tier}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-500 dark:text-slate-400">
                      {a.desc}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-slate-800"
                        role="progressbar"
                        aria-valuenow={Math.min(a.current, a.target)}
                        aria-valuemin={0}
                        aria-valuemax={a.target}
                        aria-label={`${a.name} progress`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            a.unlocked ? TIER_BAR[a.tier] : 'bg-sage-400 dark:bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((a.current / a.target) * 100))}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                          a.unlocked ? 'text-sage-700 dark:text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {a.unlocked ? 'Earned' : a.progress}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
