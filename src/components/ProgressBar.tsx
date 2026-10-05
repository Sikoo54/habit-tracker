import type { ReactNode } from 'react';

interface Props {
  done: number;
  total: number;
  label: string;
}

export function ProgressBar({ done, total, label }: Props): ReactNode {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label={label}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="section-title text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-sage-700 tabular-nums dark:text-emerald-300">
          {done}/{total} · {pct}%
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-sage-500 transition-all duration-500 dark:bg-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
