import type { ReactNode } from 'react';

interface Props {
  message: string;
  hint?: string;
  icon?: string;
}

export function EmptyState({ message, hint, icon = '🌿' }: Props): ReactNode {
  return (
    <div className="px-2 py-8 text-center">
      <p className="text-3xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{message}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
