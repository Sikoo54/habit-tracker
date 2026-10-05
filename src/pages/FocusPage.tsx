import { useState, type ReactNode } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Pomodoro } from '../components/Pomodoro';
import { useTasks } from '../hooks/useTasks';
import { todayKey } from '../utils/dates';

export function FocusPage(): ReactNode {
  const today = todayKey();
  const { todayTasks } = useTasks(today);
  const open = todayTasks.filter((t) => !t.done);
  const [focusId, setFocusId] = useState<string | null>(null);
  const focusTitle = open.find((t) => t.id === focusId)?.title ?? open[0]?.title ?? '';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <p className="section-title text-sage-600 dark:text-emerald-300">Focus session</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">🍅 Focus</h1>
        <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
          One task, 25 minutes. Then rest 5. Small steps finish big things.
        </p>
      </div>

      {open.length === 0 ? (
        <EmptyState message="No open tasks today." hint="Add one on the Today page, then come back to focus. 🌱" />
      ) : (
        <div>
          <label htmlFor="focus-task" className="section-title text-slate-400 dark:text-slate-500">
            Focusing on
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
      )}

      <Pomodoro focusTitle={focusTitle} />
    </div>
  );
}
