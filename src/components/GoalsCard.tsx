/**
 * Goals Card
 * The North Star signpost on Today. The lead goal carries the display type and
 * its reason; the rest wait in a quiet list so the reminder stays scannable.
 */

import { useState, type ReactNode } from 'react';
import type { useGoals } from '../hooks/useGoals';
import { formatGoalDate, goalDeadlineLabel } from '../utils/goals';
import { GoalsPanel } from './GoalsPanel';

interface Props {
  goalsApi: ReturnType<typeof useGoals>;
  todayKey: string;
}

/** Supporting goals shown before the list folds behind a "more" control. */
const VISIBLE_SUPPORTING = 2;

/** Small pencil that marks the edit affordance. */
function PencilIcon(): ReactNode {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/** North Star card: one lead goal, then the supporting ones as a quiet list. */
export function GoalsCard({ goalsApi, todayKey }: Props): ReactNode {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { goals } = goalsApi;
  const [lead, ...supporting] = goals;

  const folded = !expanded && supporting.length > VISIBLE_SUPPORTING;
  const shownSupporting = folded ? supporting.slice(0, VISIBLE_SUPPORTING) : supporting;
  const hiddenCount = supporting.length - VISIBLE_SUPPORTING;

  return (
    <section
      aria-label="Goals"
      className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-5 py-4 max-md:px-4 max-md:py-3.5 dark:border-amber-900/40 dark:bg-amber-950/20"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title flex items-center gap-1.5 text-summit-600 dark:text-amber-300">
          <span aria-hidden="true" className="text-[13px] leading-none">
            ★
          </span>
          North Star
        </h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-mr-1 flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-ink-600 hover:bg-amber-100/70 max-md:min-h-[44px] max-md:px-3 dark:text-slate-300 dark:hover:bg-amber-900/30"
        >
          <PencilIcon />
          {goals.length === 0 ? 'Set a goal' : 'Edit'}
        </button>
      </div>

      {lead ? (
        <>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="min-w-0 flex-1 font-display text-xl font-semibold leading-snug tracking-tight text-ink-700 sm:text-[22px] dark:text-slate-100">
              {lead.title}
            </h3>
            {formatGoalDate(lead.targetDate) ? (
              <span className="shrink-0 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                {formatGoalDate(lead.targetDate)}
                {goalDeadlineLabel(lead.targetDate, todayKey)
                  ? ` · ${goalDeadlineLabel(lead.targetDate, todayKey)}`
                  : ''}
              </span>
            ) : null}
          </div>

          {lead.why ? (
            <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-ink-500 dark:text-slate-400">
              {lead.why}
            </p>
          ) : null}

          {supporting.length > 0 ? (
            <>
              <ul className="mt-3 space-y-0.5 border-t border-amber-200/70 pt-2 dark:border-amber-900/40">
                {shownSupporting.map((goal) => {
                  const date = formatGoalDate(goal.targetDate);
                  return (
                    <li key={goal.id} className="flex items-baseline justify-between gap-4">
                      <span
                        className="min-w-0 truncate text-[13px] font-medium text-ink-600 dark:text-slate-300"
                        title={goal.why || undefined}
                      >
                        {goal.title}
                      </span>
                      {date ? (
                        <span className="shrink-0 text-[11px] tabular-nums text-ink-500 dark:text-slate-400">
                          {date}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {supporting.length > VISIBLE_SUPPORTING ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-1 flex min-h-[32px] items-center gap-1 rounded-full pr-2 text-[12px] font-semibold text-summit-600 hover:underline max-md:min-h-[44px] dark:text-amber-300"
                >
                  {expanded ? 'Show less' : `${hiddenCount} more`}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
          Name the reason you climb — it greets you here, every day.
        </p>
      )}

      {open ? (
        <GoalsPanel goalsApi={goalsApi} todayKey={todayKey} onClose={() => setOpen(false)} />
      ) : null}
    </section>
  );
}
