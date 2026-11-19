/**
 * Heatmap Component
 * 52-week activity contribution grid. Hovering a square shows what was logged
 * that day (habits plus the wake and bed times), and clicking opens the full
 * day detail.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { clockLabel } from '../game/attendance';
import type { Attendance, Checkin, Habit } from '../types';
import { annualHeatmap, type HeatCell } from '../utils/stats';
import { formatTanggalID } from '../utils/dates';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const LEVEL_CLS = [
  'bg-cream-200/70 dark:bg-slate-800',
  'bg-sage-100 dark:bg-emerald-950',
  'bg-sage-500/45 dark:bg-emerald-800',
  'bg-sage-500/75 dark:bg-emerald-600',
  'bg-sage-600 dark:bg-emerald-400',
] as const;

/** Hovered square and where its tooltip should sit. */
interface Hover {
  cell: HeatCell;
  left: number;
  top: number;
}

/** Accessible label for a square; also used as the tooltip fallback. */
function cellLabel(cell: HeatCell, record: Attendance | undefined): string {
  if (cell.future) return cell.date;
  const parts = [`${cell.date}: ${cell.count} of ${cell.total} habits`];
  const wake = clockLabel(record?.morningAt);
  const bed = clockLabel(record?.nightAt);
  if (wake) parts.push(`awake ${wake}`);
  if (bed) parts.push(`bed ${bed}`);
  return parts.join(', ');
}

interface Props {
  habits: Habit[];
  checkins: Checkin[];
  attendance: Attendance[];
  today: string;
  onSelectDay: (date: string) => void;
}

/** Annual activity heatmap calendar grid */
export function Heatmap({ habits, checkins, attendance, today, onSelectDay }: Props): ReactNode {
  const map = annualHeatmap(habits, checkins, today);
  const span = map.weeks.length;
  const [hover, setHover] = useState<Hover | null>(null);

  // One lookup for every square instead of scanning the array per cell.
  const byDate = useMemo(
    () => new Map(attendance.map((record) => [record.date, record])),
    [attendance],
  );

  const hovered = hover ? byDate.get(hover.cell.date) : undefined;
  const hoveredWake = clockLabel(hovered?.morningAt);
  const hoveredBed = clockLabel(hovered?.nightAt);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="section-title text-slate-400 dark:text-slate-500">Activity · past year</h2>
        <span className="text-xs font-medium text-ink-500 tabular-nums dark:text-slate-400">
          {map.totalActiveDays} active {map.totalActiveDays === 1 ? 'day' : 'days'}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        Hover a day for a quick look, click for the full log.
      </p>

      <div className="mt-2 overflow-x-auto pb-1" onScroll={() => setHover(null)}>
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="ml-8 flex gap-[3px]">
            {map.weeks.map((_, i) => {
              const label = map.monthLabels.find((m) => m.index === i);
              return (
                <span
                  key={i}
                  className="w-[11px] text-[10px] font-medium text-ink-500 dark:text-slate-400"
                >
                  {label ? label.label : ''}
                </span>
              );
            })}
          </div>

          <div className="mt-[3px] flex gap-[3px]">
            {/* Weekday labels */}
            <div className="mr-1 flex w-7 flex-col gap-[3px]">
              {DAY_LABELS.map((l, i) => (
                <span
                  key={i}
                  className="h-[11px] text-[10px] leading-[11px] text-ink-500 dark:text-slate-400"
                >
                  {l}
                </span>
              ))}
            </div>

            {/* Weeks */}
            {map.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.cells.map((c) =>
                  c.future ? (
                    <span
                      key={c.date}
                      aria-hidden="true"
                      className={`h-[11px] w-[11px] rounded-[2px] opacity-40 ${LEVEL_CLS[c.level]}`}
                    />
                  ) : (
                    <button
                      key={c.date}
                      type="button"
                      tabIndex={-1}
                      aria-label={cellLabel(c, byDate.get(c.date))}
                      onClick={() => {
                        setHover(null);
                        onSelectDay(c.date);
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHover({
                          cell: c,
                          left: Math.min(
                            Math.max(rect.left + rect.width / 2, 108),
                            window.innerWidth - 108,
                          ),
                          top: rect.top - 6,
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                      onBlur={() => setHover(null)}
                      className={`h-[11px] w-[11px] rounded-[2px] transition-transform hover:scale-125 hover:ring-2 hover:ring-sage-600 focus-visible:ring-2 focus-visible:ring-sage-600 dark:hover:ring-emerald-300 dark:focus-visible:ring-emerald-300 ${LEVEL_CLS[c.level]}`}
                    />
                  ),
                )}
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
        Annual activity heatmap spanning {span} weeks, {map.totalActiveDays} days with at least one
        habit completed.
      </span>

      {hover ? (
        <div
          aria-hidden="true"
          role="presentation"
          className="pointer-events-none fixed z-[55] w-max max-w-[220px] -translate-x-1/2 -translate-y-full rounded-xl border border-cream-200 bg-cream-50 px-2.5 py-2 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900"
          style={{ left: hover.left, top: hover.top }}
        >
          <p className="text-[11px] font-bold text-ink-600 dark:text-slate-200">
            {formatTanggalID(hover.cell.date)}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-500 tabular-nums dark:text-slate-400">
            {hover.cell.total === 0
              ? 'No habits due'
              : `${hover.cell.count} of ${hover.cell.total} habits`}
          </p>
          {hoveredWake ? (
            <p className="mt-0.5 text-[11px] font-semibold tabular-nums">
              <span aria-hidden="true">🌅</span> Awake {hoveredWake}
            </p>
          ) : null}
          {hoveredBed ? (
            <p className="mt-0.5 text-[11px] font-semibold tabular-nums">
              <span aria-hidden="true">🌙</span> Bed {hoveredBed}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] text-slate-400">Click for the full day</p>
        </div>
      ) : null}
    </div>
  );
}
