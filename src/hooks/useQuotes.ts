/**
 * Quotes Hook
 * Seeds the editable daily rotation on first launch, then keeps every add,
 * edit, and removal saved so the trail note survives refresh and export.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_QUOTES } from '../data/quotes';
import { useStorage } from '../storage/StorageContext';
import type { Quote, QuoteInput } from '../types';
import { createId } from '../utils/dates';

/** Builds the starter rotation with stable ids and one timestamp. */
function seedQuotes(): Quote[] {
  const createdAt = new Date().toISOString();
  return DEFAULT_QUOTES.map((quote) => ({
    id: createId('quote'),
    text: quote.text,
    author: quote.author,
    createdAt,
  }));
}

/** Trims input and turns a blank author into the "Trail note" fallback. */
function toQuote(input: QuoteInput, id: string, createdAt: string): Quote {
  const author = input.author.trim();
  return {
    id,
    text: input.text.trim(),
    author: author.length > 0 ? author : null,
    createdAt,
  };
}

/** Hook providing the quote rotation plus create, update, and remove actions. */
export function useQuotes() {
  const storage = useStorage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    storage
      .getQuotes()
      .then((saved) => {
        if (!alive) return;
        // null means this device never saved quotes; [] means the user deleted them all.
        setQuotes(saved === null ? seedQuotes() : saved);
        setLoading(false);
        loaded.current = true;
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [storage]);

  useEffect(() => {
    if (!loaded.current) return;
    void storage.saveQuotes(quotes).catch(() => undefined);
  }, [quotes, storage]);

  const addQuote = useCallback((input: QuoteInput): { ok: boolean; reason?: string } => {
    if (!input.text.trim()) return { ok: false, reason: 'Quote text is required.' };
    const quote = toQuote(input, createId('quote'), new Date().toISOString());
    setQuotes((prev) => [...prev, quote]);
    return { ok: true };
  }, []);

  const updateQuote = useCallback(
    (id: string, input: QuoteInput): { ok: boolean; reason?: string } => {
      if (!input.text.trim()) return { ok: false, reason: 'Quote text is required.' };
      setQuotes((prev) =>
        prev.map((quote) => (quote.id === id ? toQuote(input, id, quote.createdAt) : quote)),
      );
      return { ok: true };
    },
    [],
  );

  const removeQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((quote) => quote.id !== id));
  }, []);

  return {
    quotes,
    loading,
    addQuote,
    updateQuote,
    removeQuote,
  };
}
