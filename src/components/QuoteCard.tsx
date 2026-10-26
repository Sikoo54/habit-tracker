import { useState, type ReactNode } from 'react';
import { QUOTES } from '../data/quotes';
import { nextQuote, quoteIndexForDate } from '../utils/quote';

interface Props {
  todayKey: string;
}

// A quiet journal strip: one trail note a day, with the option to skip ahead.
export function QuoteCard({ todayKey }: Props): ReactNode {
  const [index, setIndex] = useState(() => quoteIndexForDate(todayKey));
  const quote = QUOTES[index];

  if (!quote) return null;

  return (
    <section
      aria-label="Daily motivational quote"
      className="mt-8 flex items-start gap-4 border-l-2 border-summit-500/70 pl-4 max-md:mt-6 max-md:gap-3 max-md:pl-3"
    >
      <div className="min-w-0 flex-1">
        <p aria-live="polite" className="font-display text-xl italic leading-snug text-ink-700 dark:text-slate-200 max-md:text-lg">
          “{quote.text}”
        </p>
        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500 dark:text-slate-400">
          {quote.author ? `— ${quote.author}` : '— Trail note'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIndex((i) => nextQuote(i))}
        aria-label="Show another quote"
        title="Show another quote"
        className="mt-0.5 flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 max-md:min-h-[44px] max-md:min-w-[44px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v6h-6" />
        </svg>
      </button>
    </section>
  );
}
