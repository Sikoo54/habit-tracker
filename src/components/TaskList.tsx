import { useState, type FormEvent, type ReactNode } from 'react';
import type { Task } from '../types';
import { EmptyState } from './EmptyState';

interface Props {
  title: string;
  subtitle: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (title: string) => { ok: boolean; reason?: string };
  icon: string;
  /** Render list in 2 CSS columns on desktop (for full-width zones). */
  twoCol?: boolean;
}

export function TaskList({ title, subtitle, tasks, onToggle, onRemove, onAdd, icon, twoCol = false }: Props): ReactNode {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const res = onAdd(draft);
    if (!res.ok) {
      setError(res.reason ?? 'Could not add task.');
      return;
    }
    setDraft('');
    setError(null);
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          <span aria-hidden="true">{icon} </span>
          {title}
        </h2>
        {tasks.length > 0 ? (
          <span className="text-xs font-medium text-slate-400 tabular-nums dark:text-slate-500">
            {doneCount}/{tasks.length}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label htmlFor={`tambah-${icon}`} className="sr-only">
          New {title}
        </label>
        <input
          id={`tambah-${icon}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          maxLength={120}
          className="min-h-[44px] flex-1 rounded-full border border-cream-200 bg-cream-50 px-4 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-800 text-lg text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <span aria-hidden="true">+</span>
        </button>
      </form>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          {error}
        </p>
      ) : null}

      {tasks.length === 0 ? (
        <EmptyState message="Nothing here yet." hint="Add one small step above. 🌱" />
      ) : (
        <ul className={`mt-2 divide-y divide-cream-200 dark:divide-slate-800 ${twoCol ? 'md:columns-2 md:gap-10' : ''}`}>
          {tasks.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 py-2.5">
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                aria-pressed={t.done}
                aria-label={t.done ? `Reopen ${t.title}` : `Complete ${t.title}`}
                className={`check-pop flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 max-md:h-8 max-md:w-8 ${
                  t.done
                    ? 'border-sage-600 bg-sage-500 text-white dark:border-emerald-400 dark:bg-emerald-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {t.done ? '✓' : ''}
              </button>
              <span
                className={`flex-1 text-[15px] ${t.done ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}
              >
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                aria-label={`Delete ${t.title}`}
                className="rounded-lg px-2 py-1 text-sm text-slate-300 opacity-0 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 max-md:min-h-[44px] max-md:min-w-[44px] max-md:opacity-100 dark:text-slate-600 dark:hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
