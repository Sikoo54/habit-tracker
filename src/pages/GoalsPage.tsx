/**
 * Goals Page View
 * The long-range goals and the daily trail note, kept together so the reason
 * for the climb is always one tap away from the daily quest board.
 */

import type { ReactNode } from 'react';
import { GoalsCard } from '../components/GoalsCard';
import { QuoteCard } from '../components/QuoteCard';
import type { useGoals } from '../hooks/useGoals';
import type { useQuotes } from '../hooks/useQuotes';
import { todayKey } from '../utils/dates';

interface Props {
  goalsApi: ReturnType<typeof useGoals>;
  quotesApi: ReturnType<typeof useQuotes>;
}

/** Goals and quotes page: what the climb is for, in one place. */
export function GoalsPage({ goalsApi, quotesApi }: Props): ReactNode {
  const today = todayKey();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="section-title text-summit-600 dark:text-amber-300">Direction</p>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight max-md:text-3xl">
        <span aria-hidden="true">🎯 </span>Goals
      </h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500 dark:text-slate-400">
        What the climb is for. Keep the reason visible, then go clear today&rsquo;s quests.
      </p>

      <GoalsCard goalsApi={goalsApi} todayKey={today} />

      <QuoteCard quotesApi={quotesApi} todayKey={today} />
    </div>
  );
}
