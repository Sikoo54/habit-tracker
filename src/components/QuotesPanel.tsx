/**
 * Quotes Panel
 * Full-screen editor for the daily trail notes: add a line, edit one in place,
 * or remove it with a confirmation. Closing returns to the quote strip.
 */

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { useQuotes } from '../hooks/useQuotes';
import type { Quote, QuoteInput } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

interface Props {
  quotesApi: ReturnType<typeof useQuotes>;
  onClose: () => void;
  /** Receives the id of a freshly added quote so the strip can show it at once. */
  onAdded?: (id: string) => void;
}

/** Shared field styling for the add and edit forms. */
const inputCls =
  'w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-sage-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

/** Add or edit form for one quote; a blank author becomes "Trail note". */
function QuoteForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Quote;
  submitLabel: string;
  onSubmit: (input: QuoteInput) => { ok: boolean; reason?: string };
  onCancel?: () => void;
}): ReactNode {
  const [text, setText] = useState(initial?.text ?? '');
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const result = onSubmit({ text, author });
    if (!result.ok) {
      setError(result.reason ?? 'Could not save this quote.');
      return;
    }
    setError(null);
    if (!initial) {
      setText('');
      setAuthor('');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={initial ? 'Edit quote' : 'Add a quote'}>
      <div>
        <label
          htmlFor={`quote-text-${initial?.id ?? 'new'}`}
          className="text-xs font-semibold text-ink-500 dark:text-slate-400"
        >
          Quote
        </label>
        <textarea
          id={`quote-text-${initial?.id ?? 'new'}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A line you want to read on a hard day."
          maxLength={240}
          rows={3}
          className={inputCls}
        />
      </div>
      <div>
        <label
          htmlFor={`quote-author-${initial?.id ?? 'new'}`}
          className="text-xs font-semibold text-ink-500 dark:text-slate-400"
        >
          Author — optional
        </label>
        <input
          id={`quote-author-${initial?.id ?? 'new'}`}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Leave blank for Trail note"
          maxLength={80}
          className={inputCls}
        />
      </div>
      {error ? (
        <p role="alert" className="text-[13px] text-amber-700 dark:text-amber-300">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-[44px] flex-1 rounded-xl bg-sage-600 px-3 text-sm font-semibold text-white hover:bg-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {submitLabel}
        </button>
        {initial ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-cream-300 px-4 text-sm dark:border-slate-600"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

/** Panel that lets the user write and maintain the daily quote rotation. */
export function QuotesPanel({ quotesApi, onClose, onAdded }: Props): ReactNode {
  const { quotes, addQuote, updateQuote, removeQuote } = quotesApi;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      // The confirm dialog owns Escape while it is open.
      if (e.key === 'Escape' && !confirmingId) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, confirmingId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const confirmingQuote = confirmingId
    ? quotes.find((quote) => quote.id === confirmingId)
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quotes"
    >
      <button
        type="button"
        aria-label="Close quotes"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative flex h-full w-full flex-col bg-cream-50 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="section-title text-amber-700 dark:text-amber-300">Trail notes</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Your quotes
              <span className="ml-2 text-base font-medium text-slate-400 tabular-nums">
                {quotes.length}
              </span>
            </h2>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-slate-400">
              Every quote joins the daily rotation. Leave the author blank to show it as a trail
              note.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close quotes"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-xl hover:bg-cream-200/70 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mb-4 rounded-2xl border border-cream-200 bg-cream-100/50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <QuoteForm
              submitLabel={quotes.length === 0 ? 'Save first quote' : 'Add quote'}
              onSubmit={(input) => {
                const result = addQuote(input);
                if (result.ok && result.quote) onAdded?.(result.quote.id);
                return result;
              }}
            />
          </div>

          {quotes.length === 0 ? (
            <EmptyState
              icon="💬"
              message="No quotes yet."
              hint="Write one line above. It will join the daily rotation."
            />
          ) : (
            <ul className="space-y-3">
              {quotes.map((quote) => (
                <li
                  key={quote.id}
                  className="rounded-2xl border border-cream-200 bg-cream-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                >
                  {editingId === quote.id ? (
                    <QuoteForm
                      initial={quote}
                      submitLabel="Save quote"
                      onSubmit={(input) => {
                        const result = updateQuote(quote.id, input);
                        if (result.ok) setEditingId(null);
                        return result;
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <p className="font-display text-lg italic leading-snug text-ink-700 dark:text-slate-200">
                        “{quote.text}”
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500 dark:text-slate-400">
                        {quote.author ? `— ${quote.author}` : '— Trail note'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-stretch gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(quote.id)}
                          className="min-h-[44px] flex-1 rounded-xl border border-cream-300 px-3 text-sm font-medium hover:bg-cream-100 dark:border-slate-600 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(quote.id)}
                          className="min-h-[44px] flex-1 rounded-xl border border-red-300 px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirmingQuote ? (
        <ConfirmDialog
          tone="danger"
          title="Remove this quote?"
          description={`“${confirmingQuote.text}” leaves the daily rotation. Nothing else is touched.`}
          confirmLabel="Remove quote"
          onConfirm={() => {
            removeQuote(confirmingQuote.id);
            setConfirmingId(null);
            setEditingId(null);
          }}
          onCancel={() => setConfirmingId(null)}
        />
      ) : null}
    </div>
  );
}
