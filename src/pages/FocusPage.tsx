import { useState, type ReactNode } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Pomodoro } from '../components/Pomodoro';
import type { useCheckins } from '../hooks/useCheckins';
import type { useHabits } from '../hooks/useHabits';
import type { useTasks } from '../hooks/useTasks';
import { todayKey } from '../utils/dates';

interface FocusOption {
  id: string;
  title: string;
  icon: string;
}

export function FocusPage({
  tasksApi,
  habitsApi,
  checkinsApi,
}: {
  tasksApi: ReturnType<typeof useTasks>;
  habitsApi: ReturnType<typeof useHabits>;
  checkinsApi: ReturnType<typeof useCheckins>;
}): ReactNode {
  const { todayTasks } = tasksApi;
  const { habits } = habitsApi;
  const { checkinFor } = checkinsApi;
  const today = todayKey();
  const open = todayTasks.filter((t) => !t.done);
  const trainings: FocusOption[] = habits
    .filter((h) => h.active && !checkinFor(h.id, today))
    .map((h) => ({ id: h.id, title: h.name, icon: '🏋️' }));
  const quests: FocusOption[] = open.map((t) => ({ id: t.id, title: t.title, icon: t.priority ? '🎯' : '📝' }));
  const options = [...quests, ...trainings];
  const [focusId, setFocusId] = useState<string | null>(null);
  const [custom, setCustom] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const focusTitle = custom ?? options.find((o) => o.id === focusId)?.title ?? options[0]?.title ?? '';
  const selectedId = options.some((o) => o.id === focusId) ? (focusId ?? '') : (options[0]?.id ?? '');

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <p className="section-title text-sage-600 dark:text-emerald-300">Focus session</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Focus arena</h1>
        <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
          One quest, 25 minutes. Then rest 5. Small steps finish big things.
        </p>
      </div>

      {options.length === 0 && !custom ? (
        <EmptyState
          message="No open quests or habits left today."
          hint="Type a custom focus below, or add quests on the Today page. 🌱"
        />
      ) : null}

      {options.length > 0 ? (
        <div>
          <label htmlFor="focus-task" className="section-title text-slate-400 dark:text-slate-500">
            From today's quests or habits
          </label>
          <select
            id="focus-task"
            value={selectedId}
            onChange={(e) => setFocusId(e.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 text-[15px] focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            {quests.length > 0 ? (
              <optgroup label="Quests">
                {quests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.title}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {trainings.length > 0 ? (
              <optgroup label="Daily training">
                {trainings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.icon} {h.title}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="focus-custom" className="section-title text-slate-400 dark:text-slate-500">
          Or a custom focus
        </label>
        {custom ? (
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-sage-100 px-4 py-3 dark:bg-emerald-950">
            <span className="flex-1 text-[15px] font-semibold">{custom}</span>
            <button
              type="button"
              onClick={() => setCustom(null)}
              aria-label="Clear custom focus"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = draft.trim();
              if (v) {
                setCustom(v);
                setDraft('');
              }
            }}
          >
            <label htmlFor="focus-custom" className="sr-only">
              Custom focus
            </label>
            <input
              id="focus-custom"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Read chapter 4, fix login bug…"
              maxLength={120}
              className="min-h-[48px] flex-1 rounded-2xl border border-cream-200 bg-cream-50 px-4 text-[15px] placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="submit"
              className="min-h-[48px] rounded-2xl bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Set
            </button>
          </form>
        )}
      </div>

      <Pomodoro focusTitle={focusTitle} />
    </div>
  );
}
