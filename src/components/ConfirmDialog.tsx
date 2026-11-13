/**
 * Confirm Dialog Component
 * Reusable modal confirmation for destructive or history-changing actions.
 * Keeps the app's cream/sage styling instead of the browser's native prompt.
 */

import { useEffect, useId, type ReactNode } from 'react';

/** Visual tone for the dialog icon and primary action. */
export type ConfirmTone = 'danger' | 'archive';

interface Props {
  title: string;
  description: string;
  /** Optional impact summary shown in a tinted box below the description. */
  detail?: string;
  confirmLabel: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE = {
  danger: {
    icon: '🗑️',
    iconCls: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-200',
    detailCls:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200',
    buttonCls: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  },
  archive: {
    icon: '🗂️',
    iconCls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-200',
    detailCls:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
    buttonCls: 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:outline-amber-600',
  },
} as const;

/** Modal asking the user to confirm an action before it happens. */
export function ConfirmDialog({
  title,
  description,
  detail,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}: Props): ReactNode {
  const titleId = useId();
  const descriptionId = useId();
  const style = TONE[tone];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="dialog-in relative w-full max-w-md rounded-t-3xl bg-cream-50 p-5 shadow-2xl sm:rounded-3xl sm:p-6 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${style.iconCls}`}
          >
            {style.icon}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="font-display text-xl font-semibold leading-tight">
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-slate-400"
            >
              {description}
            </p>
          </div>
        </div>

        {detail ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2.5 text-[13px] leading-relaxed ${style.detailCls}`}
          >
            {detail}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="min-h-[44px] rounded-xl border border-cream-300 px-4 text-sm font-medium text-ink-600 hover:bg-cream-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] rounded-xl px-4 text-sm font-semibold shadow-sm ${style.buttonCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
