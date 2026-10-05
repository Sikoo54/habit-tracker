import type { ReactNode } from 'react';
import { EmptyState } from '../components/EmptyState';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { ProgressBar } from '../components/ProgressBar';
import { TaskList } from '../components/TaskList';
import { MAX_ACTIVE_HABITS, useHabits } from '../hooks/useHabits';
import { MAX_PRIORITIES, useTasks } from '../hooks/useTasks';
import { useCheckins } from '../hooks/useCheckins';
import { formatTanggalID, todayKey } from '../utils/dates';

function greeting(hour: number): string {
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good day';
  if (hour < 19) return 'Good afternoon';
  return 'Good evening';
}

export function TodayPage(): ReactNode {
  const today = todayKey();
  const { habits, addHabit, toggleActive, removeHabit } = useHabits();
  const { priorities, others, addTask, toggleTask, removeTask } = useTasks(today);
  const { checkins, toggleCheckin, checkinFor } = useCheckins();

  const activeHabits = habits.filter((h) => h.active);
  const doneHabits = activeHabits.filter((h) => checkinFor(h.id, today));
  const doneTasks = [...priorities, ...others].filter((t) => t.done).length;
  const totalItems = activeHabits.length + priorities.length + others.length;
  const doneItems = doneHabits.length + doneTasks;
  const allDone = totalItems > 0 && doneItems === totalItems;

  return (
    <div>
      {/* Hero: no card, just type + progress */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-cream-200 pb-6 dark:border-slate-800">
        <div>
          <p className="section-title text-sage-600 dark:text-emerald-300">{formatTanggalID(today)}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {greeting(new Date().getHours())} 🌱
          </h1>
          <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
            {totalItems === 0
              ? 'A fresh day. Add one tiny thing below.'
              : allDone
                ? 'Everything done. Rest easy — you earned it. 🎉'
                : `${doneItems} of ${totalItems} done. Small versions count too.`}
          </p>
        </div>
        <div className="w-full max-w-xs flex-1">
          <ProgressBar done={doneItems} total={totalItems} label="Today's progress" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-5 items-start gap-x-10 gap-y-10 max-md:grid-cols-1">
        <div className="col-span-2 max-md:col-span-1">
          <TaskList
            title={`Priorities (${priorities.length}/${MAX_PRIORITIES})`}
            subtitle="The 3 that matter. The rest can wait."
            tasks={priorities}
            onToggle={toggleTask}
            onRemove={removeTask}
            onAdd={(title) => addTask(title, true)}
            icon="🎯"
          />
          <div className="mt-8 border-t border-cream-200 pt-8 dark:border-slate-800">
            <TaskList
              title="Other List"
              subtitle="Extra tasks, no pressure."
              tasks={others}
              onToggle={toggleTask}
              onRemove={removeTask}
              onAdd={(title) => addTask(title, false)}
              icon="📝"
            />
          </div>
        </div>

        <div className="col-span-3 space-y-8 max-md:col-span-1 max-md:border-t max-md:border-cream-200 max-md:pt-8 md:border-l md:border-cream-200 md:pl-10 dark:max-md:border-slate-800 dark:md:border-slate-800">
          <section aria-label="Today's habits">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-bold">✅ Today's Habits</h2>
              {activeHabits.length > 0 ? (
                <span className="text-xs font-medium text-slate-400 tabular-nums dark:text-slate-500">
                  {doneHabits.length}/{activeHabits.length}
                </span>
              ) : null}
            </div>
            {activeHabits.length === 0 ? (
              <EmptyState message="No active habits yet." hint="Add your first one below. Start with the 2-minute version. 🌱" />
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
                      onToggleActive={() => toggleActive(h.id)}
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
