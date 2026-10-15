import { useState, type ReactNode } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Pomodoro } from '../components/Pomodoro';
import type { useTasks } from '../hooks/useTasks';

export function FocusPage({ tasksApi }: { tasksApi: ReturnType<typeof useTasks> }): ReactNode {
  const { todayTasks } = tasksApi;
  const open = todayTasks.filter((t) => !t.done);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [custom, setCustom] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const focusTitle = custom ?? open.find((t) => t.id === focusId)?.title ?? open[0]?.title ?? '';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <p className="section-title text-sage-600 dark:text-emerald-300">Focus session</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Focus Arena</h1>
        <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
          One quest, 25 minutes. Then rest 5. Small steps finish big things.
        </p>
      </div>

      {open.length === 0 && !custom ? (
        <EmptyState message="No open quests today." hint="Type a custom focus below, or add quests on the Today page. 🌱" />
      ) : null}

      {open.length > 0 ? (
        <div>
          <label htmlFor="focus-task" className="section-title text-slate-400 dark:text-slate-500">
            From today's quests
          </label>
          <select
            id="focus-task"
            value={open.find((t) => t.id === focusId)?.id ?? open[0]?.id ?? ''}
            onChange={(e) => setFocusId(e.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 text-[15px] focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            {open.map((t) => (
              <option key={t.id} value={t.id}>
                {t.priority ? '🎯 ' : '📝 '}
                {t.title}
              </option>
            ))}
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
