import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}

export function ScorePicker({ label, value, onChange }: Props): ReactNode {
  return (
    <div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <div className="mt-1 flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(value === n ? null : n)}
            className={`min-h-[44px] min-w-[44px] rounded-xl border text-lg ${
              value === n
                ? 'border-sage-600 bg-sage-500 text-white dark:border-emerald-400 dark:bg-emerald-500'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
