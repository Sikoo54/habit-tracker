import type { ReactNode } from 'react';
import type { Achievement } from '../game/achievements';

export function AchievementsGrid({
  achievements,
  unlockedCount,
}: {
  achievements: Achievement[];
  unlockedCount: number;
}): ReactNode {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title text-slate-400 dark:text-slate-500">🏅 Achievements</h2>
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
        {achievements.map((a) => (
          <li
            key={a.id}
            className={`flex items-center gap-3 rounded-2xl p-3 ${
              a.unlocked ? 'bg-sage-100/70 dark:bg-emerald-950/60' : 'opacity-60'
            }`}
          >
            <span className={`text-3xl ${a.unlocked ? '' : 'grayscale'}`} aria-hidden="true">
              {a.unlocked ? a.icon : '🔒'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">{a.name}</p>
              <p className="text-xs text-ink-500 dark:text-slate-400 max-md:truncate">{a.desc}</p>
              <p className="text-xs font-semibold text-sage-700 tabular-nums dark:text-emerald-300">{a.progress}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
