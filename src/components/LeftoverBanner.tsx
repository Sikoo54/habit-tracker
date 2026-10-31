/**
 * Leftover Quests Banner
 * Unfinished quests from earlier days stay in storage but vanish from the UI.
 * This banner surfaces them so the user can carry them over or let them go.
 */

import type { ReactNode } from 'react';
import type { Task } from '../types';
import { addDays } from '../utils/dates';

interface Props {
  leftovers: Task[];
  today: string;
  onBring: () => void;
  onDrop: () => void;
}

/** Amber strip listing stale quests with carry-over / let-go actions */
export function LeftoverBanner({ leftovers, today, onBring, onDrop }: Props): ReactNode {
  if (leftovers.length === 0) return null;

  const count = leftovers.length;
  const yesterday = addDays(today, -1);
  const dayCount = new Set(leftovers.map((t) => t.date)).size;
  const when =
    leftovers.every((t) => t.date === yesterday)
      ? 'yesterday'
      : dayCount === 1
        ? 'an earlier day'
        : `${dayCount} earlier days`;
  const shown = leftovers.slice(0, 3);
  const hidden = count - shown.length;

  return (
    <section
      aria-label="Unfinished quests from earlier days"
      className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 max-md:p-3 dark:border-amber-900/60 dark:bg-amber-950/30"
    >
      <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
        {count} quest{count > 1 ? 's' : ''} left open from {when}
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {shown.map((t) => (
          <li key={t.id} className="truncate text-[13px] text-amber-900/80 dark:text-amber-100/80">
            <span aria-hidden="true">{t.priority ? '🗡️' : '📜'}</span> {t.title}
          </li>
        ))}
        {hidden > 0 ? (
          <li className="text-[13px] text-amber-900/70 dark:text-amber-100/70">+{hidden} more</li>
        ) : null}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBring}
          className="min-h-[40px] rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Bring to today
        </button>
        <button
          type="button"
          onClick={onDrop}
          className="min-h-[40px] rounded-xl border border-amber-300/80 px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/60"
        >
          Let them go
        </button>
      </div>
    </section>
  );
}
