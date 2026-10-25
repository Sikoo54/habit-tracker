/**
 * Empty State Component
 * Reusable placeholder display for empty lists, stats, or unconfigured sections.
 */

import type { ReactNode } from 'react';

interface Props {
  message: string;
  hint?: string;
  icon?: string;
}

/** Placeholder rendered when a collection has no items */
export function EmptyState({ message, hint, icon = '🌿' }: Props): ReactNode {
  return (
    <div className="px-2 py-8 text-center">
      <p className="text-3xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{message}</p>
      {hint ? <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
