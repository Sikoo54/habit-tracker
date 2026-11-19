/**
 * Stats & Analytics Page
 * Displays week-over-week performance rates, weekly goal progress meters,
 * annual activity heatmap, and unlocked achievement badges.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { AchievementsGrid } from '../components/AchievementsGrid';
import { DayDetail } from '../components/DayDetail';
import { EmptyState } from '../components/EmptyState';
import { Heatmap } from '../components/Heatmap';
import { daysLeftInWeek, weeklyGoalSummary, weeklyGoals } from '../game/weeklyGoals';
import type { GameStats } from '../hooks/useGame';
import type { useAttendance } from '../hooks/useAttendance';
import type { useCheckins } from '../hooks/useCheckins';
import type { useHabits } from '../hooks/useHabits';
import type { useReflections } from '../hooks/useReflections';
import type { useTasks } from '../hooks/useTasks';
import { habitsOn } from '../utils/checkins';
import { addDays, parseDateKey, todayKey } from '../utils/dates';
import { compareWeeks, formatPercent } from '../utils/stats';

const HARI_SINGKAT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  habitsApi: Pick<ReturnType<typeof useHabits>, 'habits'>;
  checkinsApi: Pick<ReturnType<typeof useCheckins>, 'checkins'>;
  attendanceApi: Pick<ReturnType<typeof useAttendance>, 'attendance'>;
  tasksApi: Pick<ReturnType<typeof useTasks>, 'tasks'>;
  reflectionsApi: Pick<ReturnType<typeof useReflections>, 'reflections'>;
  game: GameStats;
}

/** Statistics and historical performance analytics page */
export function StatsPage({
  habitsApi,
  checkinsApi,
  attendanceApi,
  tasksApi,
  reflectionsApi,
  game,
}: Props): ReactNode {
  const { habits } = habitsApi;
  const { checkins } = checkinsApi;
  const { tasks } = tasksApi;
  const { reflections } = reflectionsApi;
  const today = todayKey();
  const [openDay, setOpenDay] = useState<string | null>(null);

  const detail =
    openDay === null ? null : (
      <DayDetail
        date={openDay}
        today={today}
        habits={habits}
        checkins={checkins}
        tasks={tasks}
        reflections={reflections}
        attendance={attendanceApi.attendance}
        onSelectDate={setOpenDay}
        onClose={() => setOpenDay(null)}
      />
    );

  const cmp = useMemo(() => compareWeeks(habits, checkins, today), [habits, checkins, today]);
  const goals = useMemo(() => weeklyGoals(habits, checkins, today), [habits, checkins, today]);
  const goalSum = useMemo(
    () => weeklyGoalSummary(habits, checkins, today),
    [habits, checkins, today],
  );
  const daysLeft = daysLeftInWeek(today);

  if (habits.length === 0) {
    return (
      <div>
        <p className="section-title text-sage-600 dark:text-emerald-300">Statistics</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">📊 Adventure Log</h1>{' '}
        <EmptyState
          message="No active habits to measure yet."
          hint="Add a habit on the Today page first. 🌱"
        />
        <div className="mt-8 border-t border-cream-200 pt-8 dark:border-slate-800">
          <AchievementsGrid achievements={game.achievements} unlockedCount={game.unlockedCount} />
        </div>
        {detail}
      </div>
    );
  }

  const deltaTxt =
    cmp.delta > 0.005
      ? `▲ ${formatPercent(cmp.delta)} from last week`
      : cmp.delta < -0.005
        ? `▼ ${formatPercent(-cmp.delta)} from last week`
        : 'Same as last week';
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
            {cmp.thisWeek.totalDone} of {cmp.thisWeek.totalSlots} check-ins this week · +{game.xp}{' '}
            XP all time.
          </p>
        </div>
      </div>
      <h2 className="section-title mt-10 text-slate-400 dark:text-slate-500">Last 7 days</h2>
      <ol className="mt-3 grid grid-cols-7 gap-2 max-sm:gap-1" aria-label="7-day mini calendar">
        {Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((date) => {
          const d = parseDateKey(date);
          const idx = (d.getDay() + 6) % 7;
          const due = habitsOn(habits, date);
          const dueIds = new Set(due.map((h) => h.id));
          const done = new Set(
            checkins.filter((c) => c.date === date && dueIds.has(c.habitId)).map((c) => c.habitId),
          ).size;
          const total = due.length;
          const capped = Math.min(done, total);
          const full = total > 0 && capped === total;
          const some = capped > 0 && !full;
          return (
            <li key={date} className="text-center">
              <span className="text-xs font-medium text-slate-400">{HARI_SINGKAT[idx]}</span>
              <button
                type="button"
                onClick={() => setOpenDay(date)}
                title={`Open ${date}: ${capped} of ${total} habits`}
                className={`mx-auto mt-1 flex h-11 w-11 items-center justify-center rounded-full text-lg max-sm:h-9 max-sm:w-9 max-sm:text-base hover:ring-2 hover:ring-sage-500 focus-visible:ring-2 focus-visible:ring-sage-500 dark:hover:ring-emerald-400 dark:focus-visible:ring-emerald-400 ${
                  full
                    ? 'bg-sage-500 text-white dark:bg-emerald-500'
                    : some
                      ? 'bg-sage-100 dark:bg-emerald-950'
                      : 'bg-cream-200/70 dark:bg-slate-800'
                }`}
              >
                <span aria-hidden="true">{full ? '●' : some ? '◐' : '○'}</span>
                <span className="sr-only">
                  Open {date}: {capped} of {total} done
                </span>
              </button>
              <span className="mt-0.5 block text-xs text-slate-400 tabular-nums">
                {d.getDate()}
              </span>
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
        <div className="rounded-3xl border border-cream-200 bg-cream-50/60 p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <Heatmap
            habits={habits}
            checkins={checkins}
            attendance={attendanceApi.attendance}
            today={today}
            onSelectDay={setOpenDay}
          />
        </div>
      </div>
      <div className="mt-10 border-t border-cream-200 pt-8 dark:border-slate-800">
        <AchievementsGrid achievements={game.achievements} unlockedCount={game.unlockedCount} />
      </div>
      {detail}
    </div>
  );
}
