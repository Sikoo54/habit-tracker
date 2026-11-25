/**
 * Daily Quote Strip
 * Shows one deterministic line per day with a refresh button that skips to the
 * next one, plus a pencil that opens the quote editor. Sits under the goals as
 * a quiet trail note.
 */

import { useState, type ReactNode } from 'react';
import type { useQuotes } from '../hooks/useQuotes';
import { quoteIndexForDate } from '../utils/quote';
import { QuotesPanel } from './QuotesPanel';

interface Props {
  quotesApi: ReturnType<typeof useQuotes>;
  todayKey: string;
}

/** Pencil that marks the quote editor affordance. */
function PencilIcon(): ReactNode {
  return (
    <svg
      width="13"
      height="13"
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

// A quiet journal strip: one editable trail note a day, with a skip option.
export function QuoteCard({ quotesApi, todayKey }: Props): ReactNode {
  const { quotes } = quotesApi;
  const [offset, setOffset] = useState(0);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const total = quotes.length;
  // A just-saved quote wins over the date rotation so the writer sees it at once.
  const pinned = pinnedId ? quotes.find((item) => item.id === pinnedId) : undefined;
  const quote =
    pinned ?? (total > 0 ? quotes[(quoteIndexForDate(todayKey, total) + offset) % total] : undefined);

  /** Leave the pinned line and step through the rotation again. */
  const showAnother = (): void => {
    setPinnedId(null);
    setOffset((value) => value + 1);
  };

  return (
    <section
      aria-label="Daily motivational quote"
      className="mt-6 border-l-2 border-summit-500/70 pl-4 max-md:mt-5 max-md:pl-3"
    >
      {quote ? (
        <p aria-live="polite" className="font-display text-xl italic leading-snug text-ink-700 dark:text-slate-200 max-md:text-lg">
          “{quote.text}”
        </p>
      ) : (
        <p className="font-display text-lg italic leading-snug text-ink-500 dark:text-slate-400">
          No quotes yet. Add a line you want to read on a hard day.
        </p>
      )}
      <div className="mt-1.5 flex items-center gap-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500 dark:text-slate-400">
          {quote?.author ? `— ${quote.author}` : '— Trail note'}
        </p>
        {quote ? (
          <button
            type="button"
            onClick={showAnother}
            aria-label="Show another quote"
            title="Show another quote"
            className="-my-1 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-700 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={total === 0 ? 'Add a quote' : 'Edit quotes'}
          title={total === 0 ? 'Add a quote' : 'Edit quotes'}
          className="-my-1 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-700 max-md:min-h-[44px] max-md:min-w-[44px] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <PencilIcon />
        </button>
      </div>

      {open ? (
        <QuotesPanel
          quotesApi={quotesApi}
          onClose={() => setOpen(false)}
          onAdded={setPinnedId}
        />
      ) : null}
    </section>
  );
}
