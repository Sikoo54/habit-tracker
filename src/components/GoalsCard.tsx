/**
 * Goals Card
 * The goals signpost on the Goals page. Starred goals carry the display type
 * and their reason; the rest wait in a quiet list so the reminder stays scannable.
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

/** Example directions offered when the board is still empty. */
const STARTER_GOALS = [
  'Run my first 10K',
  'Read 12 books this year',
  'Ship the project I keep postponing',
];

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

/** Goals card: starred goals get the big treatment, the rest a quiet list. */
export function GoalsCard({ goalsApi, todayKey }: Props): ReactNode {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [starterTitle, setStarterTitle] = useState('');
  const { goals, toggleGoalStar } = goalsApi;
  const featured = goals.filter((goal) => goal.starred);
  const supporting = goals.filter((goal) => !goal.starred);

  const folded = !expanded && supporting.length > VISIBLE_SUPPORTING;
  const shownSupporting = folded ? supporting.slice(0, VISIBLE_SUPPORTING) : supporting;
  const hiddenCount = supporting.length - VISIBLE_SUPPORTING;

  /** Opens the editor, optionally pre-filled from an example direction. */
  const openEditor = (title = ''): void => {
    setStarterTitle(title);
    setOpen(true);
  };

  return (
    <section
      aria-label="Goals"
      className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-5 py-4 max-md:px-4 max-md:py-3.5 dark:border-amber-900/40 dark:bg-amber-950/20"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="section-title flex items-center gap-1.5 text-summit-600 dark:text-amber-300">
            <span aria-hidden="true" className="text-[13px] leading-none">
              ★
            </span>
            My goals
            {goals.length > 0 ? (
              <span className="rounded-full bg-amber-100/80 px-1.5 text-[10px] tabular-nums text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                {goals.length}
              </span>
            ) : null}
          </h2>
          {goals.length > 0 ? (
            <p className="mt-0.5 text-[12px] text-ink-500 dark:text-slate-400">
              Featured goals lead the page. Star any goal to bring it forward.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="-mr-1 flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-ink-600 hover:bg-amber-100/70 max-md:min-h-[44px] max-md:px-3 dark:text-slate-300 dark:hover:bg-amber-900/30"
        >
          <PencilIcon />
          {goals.length === 0 ? 'Set a goal' : 'Edit'}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-amber-300/70 bg-cream-50/60 p-5 max-md:p-4 dark:border-amber-900/50 dark:bg-slate-900/30">
          <div className="flex gap-4 max-sm:flex-col">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100/80 text-2xl dark:bg-amber-950/50"
            >
              🧭
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink-700 dark:text-slate-100">
                What are you climbing toward?
              </h3>
              <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-ink-500 dark:text-slate-400">
                One clear direction gives the daily quests their weight. Add a goal, then star it
                to keep the reason in sight.
              </p>
              <p className="section-title mt-4 text-ink-500 dark:text-slate-400">
                Need a starting point?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STARTER_GOALS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => openEditor(prompt)}
                    className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-amber-200/80 bg-cream-50 px-3 text-[12px] font-medium text-ink-600 transition-colors hover:border-amber-300 hover:bg-amber-100/60 max-md:min-h-[44px] dark:border-amber-900/50 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/30"
                  >
                    <span aria-hidden="true" className="text-amber-500 dark:text-amber-300">
                      +
                    </span>
                    {prompt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openEditor()}
                className="mt-4 flex min-h-[44px] items-center gap-2 rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Write your first goal
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {featured.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {featured.map((goal) => (
                <li
                  key={goal.id}
                  className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-cream-50 to-cream-50 p-4 dark:border-amber-900/50 dark:from-amber-950/25 dark:via-slate-900/60 dark:to-slate-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="section-title text-summit-600 dark:text-amber-300">Featured</p>
                    <button
                      type="button"
                      onClick={() => toggleGoalStar(goal.id)}
                      aria-pressed={Boolean(goal.starred)}
                      aria-label={`Stop featuring "${goal.title}"`}
                      title="Featured big on the Goals page"
                      className="-mr-1 -mt-1 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-lg text-amber-500 transition-colors hover:bg-amber-100/80 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-amber-300 dark:hover:bg-amber-950/40"
                    >
                      <span aria-hidden="true">★</span>
                    </button>
                  </div>
                  <h3 className="mt-0.5 font-display text-2xl font-semibold leading-snug tracking-tight text-ink-700 dark:text-slate-100">
                    {goal.title}
                  </h3>
                  {goal.why ? (
                    <p className="mt-2 border-l-2 border-amber-300/80 pl-3 font-display text-[15px] italic leading-relaxed text-ink-600 dark:border-amber-800/80 dark:text-slate-300">
                      &ldquo;{goal.why}&rdquo;
                    </p>
                  ) : null}
                  {formatGoalDate(goal.targetDate) ? (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-bold tabular-nums text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                        <span aria-hidden="true">◷</span>
                        {formatGoalDate(goal.targetDate)}
                        {goalDeadlineLabel(goal.targetDate, todayKey)
                          ? ` · ${goalDeadlineLabel(goal.targetDate, todayKey)}`
                          : ''}
                      </span>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-amber-300/70 px-3 py-2 text-[13px] text-ink-500 dark:border-amber-900/50 dark:text-slate-400">
              <span aria-hidden="true" className="mr-1 text-amber-500 dark:text-amber-300">
                ★
              </span>
              Star a goal to put it front and center.
            </p>
          )}

          {supporting.length > 0 ? (
            <>
              <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-amber-200/70 pt-3 dark:border-amber-900/40">
                <h3 className="section-title text-ink-500 dark:text-slate-400">Also on the path</h3>
                <span className="text-[11px] font-semibold text-ink-500 tabular-nums dark:text-slate-400">
                  {supporting.length}
                </span>
              </div>
              <ul className="mt-1">
                {shownSupporting.map((goal) => {
                  const date = formatGoalDate(goal.targetDate);
                  return (
                    <li
                      key={goal.id}
                      className="group flex items-start gap-2 rounded-xl px-1 py-1.5 transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-950/20"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 dark:bg-amber-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            className="truncate text-[13px] font-semibold text-ink-600 dark:text-slate-300"
                            title={goal.title}
                          >
                            {goal.title}
                          </span>
                          {date ? (
                            <span className="shrink-0 text-[11px] tabular-nums text-ink-500 dark:text-slate-400">
                              {date}
                            </span>
                          ) : null}
                        </div>
                        {goal.why ? (
                          <p
                            className="mt-0.5 truncate text-[12px] text-ink-500 dark:text-slate-400"
                            title={goal.why}
                          >
                            {goal.why}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleGoalStar(goal.id)}
                        aria-pressed={Boolean(goal.starred)}
                        aria-label={`Feature "${goal.title}"`}
                        title="Show this goal big on the Goals page"
                        className="-mr-1 flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-full text-base text-ink-500 transition-colors hover:bg-amber-100/80 hover:text-amber-600 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-slate-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                      >
                        <span aria-hidden="true">☆</span>
                      </button>
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
      )}

      {open ? (
        <GoalsPanel
          goalsApi={goalsApi}
          todayKey={todayKey}
          starterTitle={starterTitle}
          onClose={() => {
            setOpen(false);
            setStarterTitle('');
          }}
        />
      ) : null}
    </section>
  );
}
