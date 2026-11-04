/**
 * Today Page View
 * Main dashboard showcasing daily greeting, ascent climb visualization,
 * the Main Quest habit list, side quests, and penalty alerts.
 */

import type { ReactNode } from 'react';
import { AscentTrail } from '../components/AscentTrail';
import { AscentCard } from '../components/AscentCard';
import { EmptyState } from '../components/EmptyState';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { LeftoverBanner } from '../components/LeftoverBanner';
import { QuoteCard } from '../components/QuoteCard';
import { TaskList } from '../components/TaskList';
import { YesterdayBackfill } from '../components/YesterdayBackfill';
import type { AppliedPenalty } from '../game/decay';
import type { useCheckins } from '../hooks/useCheckins';
import type { GameStats } from '../hooks/useGame';
import { MAX_ACTIVE_HABITS, type useHabits } from '../hooks/useHabits';
import type { useTasks } from '../hooks/useTasks';
import { habitsOn } from '../utils/checkins';
import { addDays, formatTanggalID, startOfWeekMonday, todayKey } from '../utils/dates';
import { showsStreak } from '../utils/streak';

function greeting(hour: number): string {
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good day';
  if (hour < 19) return 'Good afternoon';
  return 'Good evening';
}

interface Props {
  habitsApi: ReturnType<typeof useHabits>;
  tasksApi: ReturnType<typeof useTasks>;
  checkinsApi: ReturnType<typeof useCheckins>;
  game: GameStats;
  penaltyNotice: AppliedPenalty[] | null;
  onDismissPenalty: () => void;
}

/** Primary day dashboard component */
export function TodayPage({
  habitsApi,
  tasksApi,
  checkinsApi,
  game,
  penaltyNotice,
  onDismissPenalty,
}: Props): ReactNode {
  const today = todayKey();
  const weekMonday = startOfWeekMonday(today);
  const { habits, addHabit, updateHabit, removeHabit } = habitsApi;
  const { quests, addTask, toggleTask, removeTask } = tasksApi;
  const { leftovers, bringLeftovers, dropLeftovers } = tasksApi;
  const { checkins, toggleCheckin, setCheckin, checkinFor } = checkinsApi;
  const yesterday = addDays(today, -1);
  const backfillHabits = habitsOn(habits, yesterday);

  const activeHabits = habits.filter((h) => h.active);
  const doneHabits = activeHabits.filter((h) => checkinFor(h.id, today));
  // The Main Quest is the day: only habits move the trail and the headline.
  const mainTotal = activeHabits.length;
  const mainDone = doneHabits.length;
  const allDone = mainTotal > 0 && mainDone === mainTotal;
  const headline = mainTotal === 0 ? 'Pack your bag.' : allDone ? 'Summit reached.' : 'On the ascent.';
  const frostTotal = (penaltyNotice ?? []).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {penaltyNotice && penaltyNotice.length > 0 ? (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl bg-sky-100 p-4 dark:bg-sky-950">
          <span className="text-2xl" aria-hidden="true">
            ❄️
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sky-900 dark:text-sky-100">
              The ascent froze over — {frostTotal} XP lost.
            </p>
            <p className="text-sm text-sky-800 dark:text-sky-200">
              {penaltyNotice.length} idle {penaltyNotice.length === 1 ? 'day' : 'days'} with zero activity.
              Do one small thing today to thaw it.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismissPenalty}
            aria-label="Dismiss frost warning"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-sky-800 hover:bg-sky-200/60 dark:text-sky-200 dark:hover:bg-sky-900"
          >
            ✕
          </button>
        </div>
      ) : null}
      {/* Hero: greeting + companion side by side */}
      <div className="grid grid-cols-5 items-stretch gap-6 max-md:grid-cols-1">
        <div className="col-span-3 flex flex-col justify-center max-md:col-span-1">
          <p className="section-title text-sage-600 dark:text-emerald-300">{formatTanggalID(today)}</p>
          <h1 className="mt-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight max-md:text-4xl">
            {greeting(new Date().getHours())}. {headline}
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500 dark:text-slate-400">
            {mainTotal === 0
              ? 'A fresh route. Add your first main quest below.'
              : allDone
                ? `All main quests cleared${quests.length > 0 ? ' · side quests are optional.' : '.'} Rest easy — you earned it.`
                : `${mainDone} of ${mainTotal} main quests behind you · +${game.xp} XP banked. One tap per habit.`}
          </p>
          <AscentTrail done={mainDone} total={mainTotal} />
        </div>
        <div className="col-span-2 max-md:col-span-1">
          <AscentCard ascent={game.ascent} progress={game.progress} next={game.nextAscent} rank={game.rank} nextRank={game.nextRank} />
        </div>
      </div>

      <LeftoverBanner
        leftovers={leftovers}
        today={today}
        onBring={bringLeftovers}
        onDrop={dropLeftovers}
      />

      <div className="mx-auto mt-8 max-w-4xl space-y-6 border-t border-cream-200 pt-8 dark:border-slate-800">
        <section
          aria-label="Main quest"
          className="rounded-3xl border border-cream-200 bg-cream-50/80 p-5 max-md:p-4 dark:border-slate-700 dark:bg-slate-900/40"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="section-title text-sage-600 dark:text-emerald-300">Primary</p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                <span aria-hidden="true">🗡️ </span>Main Quest
              </h2>
              <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
                Your habit routine · only these feed the streak.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {showsStreak(game.streak) ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 tabular-nums dark:bg-amber-950 dark:text-amber-200">
                  🔥 {game.streak}
                </span>
              ) : null}
              {mainTotal > 0 ? (
                <span className="text-xs font-medium text-slate-400 tabular-nums dark:text-slate-500">
                  {mainDone}/{mainTotal} · +20 XP each
                </span>
              ) : null}
            </div>
          </div>

          {mainTotal === 0 ? (
            <EmptyState
              message="No main quests yet."
              hint="Add your first daily habit below — one clear target is enough. 🌱"
            />
          ) : (
            <ul className="mt-2 divide-y divide-cream-200 dark:divide-slate-800">
              {activeHabits.map((h) => {
                const c = checkinFor(h.id, today);
                return (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    checkins={checkins}
                    weekMonday={weekMonday}
                    todayKey={today}
                    checked={Boolean(c)}
                    onToggle={() => toggleCheckin(h.id, today)}
                    onUpdate={(input) => updateHabit(h.id, input)}
                    onRemove={() => removeHabit(h.id)}
                  />
                );
              })}
            </ul>
          )}

          <YesterdayBackfill
            habits={backfillHabits}
            checkins={checkins}
            date={yesterday}
            onSet={(habitId, done) => setCheckin(habitId, yesterday, done)}
          />

          <div className="mt-5">
            <HabitForm onAdd={addHabit} disabled={activeHabits.length >= MAX_ACTIVE_HABITS} />
          </div>
        </section>

        <section
          aria-label="Side quests"
          className="rounded-3xl border border-cream-200/70 bg-cream-50/40 p-5 max-md:p-4 dark:border-slate-800 dark:bg-slate-900/30"
        >
          <TaskList
            quiet
            title="Side Quests"
            subtitle="Optional extras · +15 XP each."
            tasks={quests}
            onToggle={toggleTask}
            onRemove={removeTask}
            onAdd={addTask}
            icon="📜"
          />
        </section>
      </div>

      {/* Trail note sits after the quests now, so the day starts at the habit list. */}
      <div className="mx-auto max-w-4xl">
        <QuoteCard todayKey={today} />
      </div>
    </div>
  );
}
