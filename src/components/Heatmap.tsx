import type { ReactNode } from 'react';
import type { Checkin, Habit } from '../types';
import { annualHeatmap, type HeatCell } from '../utils/stats';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const LEVEL_CLS = [
  'bg-cream-200/70 dark:bg-slate-800',
  'bg-sage-100 dark:bg-emerald-950',
  'bg-sage-500/45 dark:bg-emerald-800',
  'bg-sage-500/75 dark:bg-emerald-600',
  'bg-sage-600 dark:bg-emerald-400',
] as const;

function cellTitle(c: HeatCell): string {
  if (c.future) return `${c.date}`;
  const noun = c.count === 1 ? 'habit' : 'habits';
  return `${c.count} ${noun} on ${c.date}`;
}

interface Props {
  habits: Habit[];
  checkins: Checkin[];
  today: string;
}

export function Heatmap({ habits, checkins, today }: Props): ReactNode {
  const map = annualHeatmap(habits, checkins, today);
  const span = map.weeks.length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title text-slate-400 dark:text-slate-500">Activity · past year</h2>
        <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
          {map.totalActiveDays} active {map.totalActiveDays === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="ml-8 flex gap-[3px]">
            {map.weeks.map((_, i) => {
              const label = map.monthLabels.find((m) => m.index === i);
              return (
                <span key={i} className="w-[11px] text-[10px] font-medium text-ink-500 dark:text-slate-400">
                  {label ? label.label : ''}
                </span>
              );
            })}
          </div>

          <div className="mt-[3px] flex gap-[3px]">
            {/* Weekday labels */}
            <div className="mr-1 flex w-7 flex-col gap-[3px]">
              {DAY_LABELS.map((l, i) => (
                <span key={i} className="h-[11px] text-[10px] leading-[11px] text-ink-500 dark:text-slate-400">
                  {l}
                </span>
              ))}
            </div>

            {/* Weeks */}
            {map.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.cells.map((c) => (
                  <span
                    key={c.date}
                    title={cellTitle(c)}
                    aria-hidden="true"
                    className={`h-[11px] w-[11px] rounded-[2px] ${c.future ? 'opacity-40 ' : ''}${LEVEL_CLS[c.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-500 dark:text-slate-400">
        <span>Less</span>
        {LEVEL_CLS.map((cls, i) => (
          <span key={i} className={`h-[11px] w-[11px] rounded-[2px] ${cls}`} aria-hidden="true" />
        ))}
        <span>More</span>
      </div>

      <span className="sr-only">
        Annual activity heatmap spanning {span} weeks, {map.totalActiveDays} days with at least one habit
        completed.
      </span>
    </div>
  );
}
