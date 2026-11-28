/**
 * Focus Page View
 * Pomodoro timer arena allowing users to pick a single main quest habit or a
 * side quest to focus on, with a custom option when the board is empty.
 */

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

/** Decorative target rings for the focus header. */
function FocusMark(): ReactNode {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 hidden h-32 w-32 -translate-y-1/2 text-lake-500/30 sm:block dark:text-lake-300/20"
    >
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="60"
        cy="60"
        r="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 5"
      />
      <circle cx="60" cy="60" r="17" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      <path
        d="M60 6v10M60 104v10M6 60h10M104 60h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Focus session view with Pomodoro timer and task selector */
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
    .map((h) => ({ id: h.id, title: h.name, icon: '🌿' }));
  const quests: FocusOption[] = open.map((t) => ({ id: t.id, title: t.title, icon: '📜' }));
  // Main quest (habits) first — they are what the day is really about.
  const options = [...trainings, ...quests];
  const [focusId, setFocusId] = useState<string | null>(null);
  const [custom, setCustom] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const focusTitle = custom ?? options.find((o) => o.id === focusId)?.title ?? options[0]?.title ?? '';
  const selectedId = options.some((o) => o.id === focusId) ? (focusId ?? '') : (options[0]?.id ?? '');

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header className="relative overflow-hidden rounded-3xl border border-lake-200/80 border-l-4 border-l-lake-500 bg-gradient-to-br from-cream-50 via-cream-50 to-lake-50/70 p-6 max-md:p-4 dark:border-slate-700 dark:border-l-lake-500 dark:from-slate-900/70 dark:via-slate-900/50 dark:to-lake-950/25">
        <FocusMark />
        <div className="relative max-w-xl sm:pr-32">
          <p className="section-title flex items-center gap-1.5 text-lake-600 dark:text-lake-300">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lake-500" />
            Focus session
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight max-sm:text-3xl">
            <span aria-hidden="true">🎯 </span>Focus arena
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-500 dark:text-slate-400">
            One quest, 25 minutes. Then rest 5. Small steps finish big things.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-lake-100/80 px-2.5 py-1 text-[11px] font-bold text-lake-700 dark:bg-lake-950/50 dark:text-lake-200">
              25 min focus
            </span>
            <span className="inline-flex items-center rounded-full bg-cream-200/70 px-2.5 py-1 text-[11px] font-bold text-ink-600 dark:bg-slate-800 dark:text-slate-300">
              5 min rest
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <span aria-hidden="true">◆</span>
              One thing only
            </span>
          </div>
        </div>
      </header>

      <section
        aria-label="Focus target"
        className="rounded-3xl border border-cream-200 bg-cream-50/80 p-5 max-md:p-4 dark:border-slate-700 dark:bg-slate-900/40"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title flex items-center gap-1.5 text-lake-600 dark:text-lake-300">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lake-500" />
            Choose your target
          </h2>
          <span className="text-[11px] font-semibold text-ink-500 tabular-nums dark:text-slate-400">
            {trainings.length} main · {quests.length} side
          </span>
        </div>

        {options.length > 0 ? (
          <div className="mt-3">
            <label
              htmlFor="focus-task"
              className="text-[12px] font-medium text-ink-500 dark:text-slate-400"
            >
              From today&rsquo;s board
            </label>
            <select
              id="focus-task"
              value={selectedId}
              onChange={(e) => setFocusId(e.target.value)}
              className="mt-1.5 min-h-[48px] w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 text-[15px] focus:border-lake-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
            >
              {trainings.length > 0 ? (
                <optgroup label="Main quest">
                  {trainings.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.title}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {quests.length > 0 ? (
                <optgroup label="Side quests">
                  {quests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.title}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </div>
        ) : (
          <EmptyState
            message="No open quests or habits left today."
            hint="Type a custom focus below, or add quests on the Today page. 🌱"
          />
        )}

        <div className="mt-4 border-t border-cream-200 pt-4 dark:border-slate-800">
          <label
            htmlFor="focus-custom"
            className="section-title text-ink-500 dark:text-slate-400"
          >
            Or a custom focus
          </label>
          {custom ? (
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-lake-200/70 bg-lake-100/70 px-4 py-3 dark:border-lake-900/40 dark:bg-lake-950/40">
              <span className="flex-1 text-[15px] font-semibold">{custom}</span>
              <button
                type="button"
                onClick={() => setCustom(null)}
                aria-label="Clear custom focus"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-500 hover:text-red-600 dark:text-slate-400"
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
                className="min-h-[48px] flex-1 rounded-2xl border border-cream-200 bg-cream-50 px-4 text-[15px] placeholder:text-slate-400 focus:border-lake-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                type="submit"
                className="min-h-[48px] rounded-2xl bg-lake-600 px-5 text-sm font-semibold text-white hover:bg-lake-700 dark:bg-lake-400 dark:text-slate-950 dark:hover:bg-lake-300"
              >
                Set
              </button>
            </form>
          )}
        </div>
      </section>

      <Pomodoro focusTitle={focusTitle} />
    </div>
  );
}
