import type { ReactNode } from 'react';
import { AscentTrail } from '../components/AscentTrail';
import { CreatureCard } from '../components/CreatureCard';
import { EmptyState } from '../components/EmptyState';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { TaskList } from '../components/TaskList';
import type { AppliedPenalty } from '../game/decay';
import { penaltyFor } from '../game/decay';
import type { GameStats } from '../hooks/useGame';
import type { useCheckins } from '../hooks/useCheckins';
import { MAX_ACTIVE_HABITS, type useHabits } from '../hooks/useHabits';
import { MAX_PRIORITIES, type useTasks } from '../hooks/useTasks';
import { formatTanggalID, todayKey } from '../utils/dates';

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

export function TodayPage({ habitsApi, tasksApi, checkinsApi, game, penaltyNotice, onDismissPenalty }: Props): ReactNode {
  const today = todayKey();
  const { habits, addHabit, updateHabit, removeHabit } = habitsApi;
  const { priorities, others, addTask, toggleTask, removeTask } = tasksApi;
  const { checkins, toggleCheckin, checkinFor } = checkinsApi;

  const activeHabits = habits.filter((h) => h.active);
  const doneHabits = activeHabits.filter((h) => checkinFor(h.id, today));
  const doneTasks = [...priorities, ...others].filter((t) => t.done).length;
  const totalItems = activeHabits.length + priorities.length + others.length;
  const doneItems = doneHabits.length + doneTasks;
  const allDone = totalItems > 0 && doneItems === totalItems;
  const headline =
    totalItems === 0 ? 'Pack your bag.' : allDone ? 'Summit reached.' : 'On the ascent.';
  const frostTotal = (penaltyNotice ?? []).reduce((s, p) => s + p.amount, 0);

  return (
    <div>
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
      ) : game.streak > 0 && !game.todayActive ? (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-100 p-4 dark:bg-amber-950">
          <span className="text-2xl" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>{game.streak}-day streak at risk.</strong> Finish anything today, or frost burns ~
            {penaltyFor(game.xp)} XP overnight.
          </p>
        </div>
      ) : null}
      {/* Hero: greeting + companion side by side */}
      <div className="grid grid-cols-5 items-stretch gap-6 max-md:grid-cols-1">
        <div className="col-span-3 flex flex-col justify-center max-md:col-span-1">
          <p className="section-title text-sage-600 dark:text-emerald-300">{formatTanggalID(today)}</p>
          <h1 className="mt-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight max-md:text-4xl">
            {greeting(new Date().getHours())}. {headline}
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            {totalItems === 0
              ? 'A fresh quest board. Add one tiny quest below.'
              : allDone
                ? 'Everything cleared. Rest easy — you earned it.'
                : `${doneItems} of ${totalItems} behind you · +${game.xp} XP banked. Small versions count too.`}
          </p>
          <AscentTrail done={doneItems} total={totalItems} />
        </div>
        <div className="col-span-2 max-md:col-span-1">
          <CreatureCard creature={game.creature} progress={game.progress} next={game.next} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-5 items-start gap-x-10 gap-y-10 border-t border-cream-200 pt-8 max-md:grid-cols-1 dark:border-slate-800">
        <div className="col-span-2 space-y-8 max-md:col-span-1">
          <TaskList
            title={`Main Quests (${priorities.length}/${MAX_PRIORITIES})`}
            subtitle="The 3 that matter · +25 XP each."
            tasks={priorities}
            onToggle={toggleTask}
            onRemove={removeTask}
            onAdd={(title) => addTask(title, true)}
            icon="🗡️"
          />
          <div className="border-t border-cream-200 pt-8 dark:border-slate-800">
            <TaskList
              title="Side Quests"
              subtitle="Extra adventures · +15 XP each."
              tasks={others}
              onToggle={toggleTask}
              onRemove={removeTask}
              onAdd={(title) => addTask(title, false)}
              icon="📜"
            />
          </div>
        </div>

        <div className="col-span-3 space-y-8 max-md:col-span-1 max-md:border-t max-md:border-cream-200 max-md:pt-8 md:border-l md:border-cream-200 md:pl-10 dark:max-md:border-slate-800 dark:md:border-slate-800">
          <section aria-label="Today's habits">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-bold">🌿 Daily Training</h2>
              {activeHabits.length > 0 ? (
                <span className="text-xs font-medium text-slate-400 tabular-nums dark:text-slate-500">
                  {doneHabits.length}/{activeHabits.length} · full +20 / small +10 XP
                </span>
              ) : null}
            </div>
            {activeHabits.length === 0 ? (
              <EmptyState message="No training routines yet." hint="Add your first one below. Start with the 2-minute version. 🌱" />
            ) : (
              <ul className="divide-y divide-cream-200 dark:divide-slate-800">
                {activeHabits.map((h) => {
                  const c = checkinFor(h.id, today);
                  const dates = checkins.filter((x) => x.habitId === h.id).map((x) => x.date);
                  return (
                    <HabitCard
                      key={h.id}
                      habit={h}
                      completedDates={dates}
                      todayKey={today}
                      checked={Boolean(c)}
                      variant={c?.variant ?? null}
                      onToggle={(v) => toggleCheckin(h.id, today, v)}
                      onUpdate={(input) => updateHabit(h.id, input)}
                      onRemove={() => removeHabit(h.id)}
                    />
                  );
                })}
              </ul>
            )}
          </section>
          <HabitForm onAdd={addHabit} disabled={activeHabits.length >= MAX_ACTIVE_HABITS} />
        </div>
      </div>
    </div>
  );
}
