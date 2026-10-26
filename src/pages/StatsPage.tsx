/**
 * Stats & Analytics Page
 * Displays week-over-week performance rates, weekly goal progress meters,
 * annual activity heatmap, and unlocked achievement badges.
 */

import { useMemo, type ReactNode } from 'react';
import { AchievementsGrid } from '../components/AchievementsGrid';
import { EmptyState } from '../components/EmptyState';
import { Heatmap } from '../components/Heatmap';
import { RankLadder } from '../components/RankLadder';
import { daysLeftInWeek, weeklyGoalSummary, weeklyGoals } from '../game/weeklyGoals';
import type { GameStats } from '../hooks/useGame';
import type { useCheckins } from '../hooks/useCheckins';
import type { useHabits } from '../hooks/useHabits';
import { addDays, parseDateKey, startOfWeekMonday, todayKey } from '../utils/dates';
import { compareWeeks, formatPercent } from '../utils/stats';

const HARI_SINGKAT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  habitsApi: Pick<ReturnType<typeof useHabits>, 'habits'>;
  checkinsApi: Pick<ReturnType<typeof useCheckins>, 'checkins'>;
  game: GameStats;
}

/** Statistics and historical performance analytics page */
export function StatsPage({ habitsApi, checkinsApi, game }: Props): ReactNode {
  const { habits } = habitsApi;
  const { checkins } = checkinsApi;
  const today = todayKey();

  const cmp = useMemo(() => compareWeeks(habits, checkins, today), [habits, checkins, today]);
  const goals = useMemo(() => weeklyGoals(habits, checkins, today), [habits, checkins, today]);
  const goalSum = useMemo(() => weeklyGoalSummary(habits, checkins, today), [habits, checkins, today]);
  const daysLeft = daysLeftInWeek(today);
  const activeCount = habits.filter((h) => h.active).length;

  if (activeCount === 0) {
    return (
      <div>
        <p className="section-title text-sage-600 dark:text-emerald-300">Statistics</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">📊 Adventure Log</h1>        <EmptyState message="No active habits to measure yet." hint="Add a habit on the Today page first. 🌱" />
        <div className="mt-8 border-t border-cream-200 pt-8 dark:border-slate-800">
          <RankLadder xp={game.xp} level={game.progress.level} rank={game.rank} />
        </div>
        <div className="mt-8 border-t border-cream-200 pt-8 dark:border-slate-800">
          <AchievementsGrid achievements={game.achievements} unlockedCount={game.unlockedCount} />
        </div>
      </div>
    );
  }

  const deltaTxt =
    cmp.delta > 0.005 ? `▲ ${formatPercent(cmp.delta)} from last week` : cmp.delta < -0.005 ? `▼ ${formatPercent(-cmp.delta)} from last week` : 'Same as last week';
  const deltaGood = cmp.delta >= -0.005;

  return (
    <div>
      <p className="section-title text-sage-600 dark:text-emerald-300">Statistics</p>
      <div className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-2 max-sm:flex-col max-sm:items-start max-sm:gap-x-0">
        <h1 className="font-display text-6xl font-semibold tabular-nums tracking-tight max-sm:text-5xl">
          {formatPercent(cmp.thisWeek.rate)}
        </h1>
        <div className="pb-1.5">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold max-sm:inline ${deltaGood ? 'bg-sage-100 text-sage-700 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}
            role="status"
          >
            {deltaTxt}
          </span>
          <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
            {cmp.thisWeek.totalDone} of {cmp.thisWeek.totalSlots} check-ins this week · +{game.xp} XP all time.
          </p>
        </div>
      </div>

      <h2 className="section-title mt-10 text-slate-400 dark:text-slate-500">Last 7 days</h2>
      <ol className="mt-3 grid grid-cols-7 gap-2 max-sm:gap-1" aria-label="7-day mini calendar">        {Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((date) => {
          const d = parseDateKey(date);
          const idx = (d.getDay() + 6) % 7;
          const done = new Set(checkins.filter((c) => c.date === date).map((c) => c.habitId)).size;
          const capped = Math.min(done, activeCount);
          const full = activeCount > 0 && capped === activeCount;
          const some = capped > 0 && !full;
          return (
            <li key={date} title={`${date}: ${capped}/${activeCount}`} className="text-center">
              <span className="text-xs font-medium text-slate-400">{HARI_SINGKAT[idx]}</span>
              <span
                className={`mx-auto mt-1 flex h-11 w-11 items-center justify-center rounded-full text-lg max-sm:h-9 max-sm:w-9 max-sm:text-base ${
                  full
                    ? 'bg-sage-500 text-white dark:bg-emerald-500'
                    : some
                      ? 'bg-sage-100 dark:bg-emerald-950'
                      : 'bg-cream-200/70 dark:bg-slate-800'
                }`}
              >
                <span aria-hidden="true">{full ? '●' : some ? '◐' : '○'}</span>
                <span className="sr-only">
                  {date}: {capped} of {activeCount} done
                </span>
              </span>
              <span className="mt-0.5 block text-xs text-slate-400 tabular-nums">{d.getDate()}</span>
            </li>
          );
        })}
      </ol>

      {goals.length > 0 ? (
        <>
          <div className="mt-10 flex items-baseline justify-between gap-3 border-t border-cream-200 pt-8 dark:border-slate-800">
            <h2 className="section-title text-slate-400 dark:text-slate-500">Weekly goals</h2>
            <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
              {goalSum.met}/{goalSum.total} met · {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          </div>
          <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
            {goals.map((g) => (
              <li key={g.habitId} className="py-2.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    {g.met ? <span aria-hidden="true">✓</span> : null}
                    {g.name}
                  </span>
                  <span className="text-ink-500 tabular-nums dark:text-slate-400">
                    {g.done}/{g.goal}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${g.met ? 'bg-summit-500' : 'bg-sage-500 dark:bg-emerald-400'}`}
                    style={{ width: `${Math.round(g.rate * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-10 border-t border-cream-200 pt-8 dark:border-slate-800">
        <Heatmap habits={habits} checkins={checkins} today={today} />
      </div>

      <h2 className="section-title mt-10 border-t border-cream-200 pt-8 text-slate-400 dark:border-slate-800 dark:text-slate-500">
        This week · from {cmp.thisWeek.monday}
      </h2>      <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
        {cmp.thisWeek.days.map((day, i) => (
          <li key={day.date} className="flex items-center gap-3 py-2">
            <span className="w-8 text-sm font-medium text-ink-500 sm:w-10">{HARI_SINGKAT[i]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-sage-500 dark:bg-emerald-400" style={{ width: `${Math.round(day.rate * 100)}%` }} />
            </div>
            <span className="w-14 text-right text-[13px] text-slate-400 tabular-nums sm:w-20">
              {day.done}/{day.total}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-cream-200 pt-8 dark:border-slate-800">
        <RankLadder xp={game.xp} level={game.progress.level} rank={game.rank} />
      </div>

      <div className="mt-10 border-t border-cream-200 pt-8 dark:border-slate-800">
        <AchievementsGrid achievements={game.achievements} unlockedCount={game.unlockedCount} />
      </div>
      <p className="mt-4 text-xs text-slate-400">Weeks start Monday ({startOfWeekMonday(today)}).</p>
    </div>
  );
}
