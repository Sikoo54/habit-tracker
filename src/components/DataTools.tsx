/**
 * Data Tools Component
 * Provides backup export (JSON download), import with validation,
 * and data reset controls inside the settings drawer.
 */

import { useRef, useState, type ReactNode } from 'react';
import { useStorage } from '../storage/StorageContext';
import type { ExportPayload } from '../types';

/** Import/Export and reset data settings component */
export function DataTools({ onResetDone }: { onResetDone: () => void }): ReactNode {
  const storage = useStorage();
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async (): Promise<void> => {
    try {
      const data = await storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-tracker-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Data exported. 📦');
    } catch {
      setMsg('Could not export data.');
    }
  };

  const doImportFile = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportPayload;
      await storage.importAll(parsed);
      setMsg('Import done. Reload the page to see the data. ✅');
      setNeedsReload(true);
    } catch {
      setMsg('Invalid file. Import cancelled.');
    }
  };

  const doReset = async (): Promise<void> => {
    try {
      await storage.clearAll();
      setConfirmReset(false);
      setMsg('All data deleted. Reload the page. 🧹');
      setNeedsReload(true);
      onResetDone();
    } catch {
      setMsg('Could not reset data.');
    }
  };

  const btn =
    'min-h-[44px] w-full rounded-xl px-4 text-left text-sm font-medium hover:bg-cream-200/70 dark:hover:bg-slate-700';

  return (
    <div aria-label="Manage data">
      <p className="section-title px-1 text-slate-400 dark:text-slate-500">Manage data</p>
      <div className="mt-1">
        <button type="button" onClick={doExport} className={btn}>
          📦 Export JSON
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
          📥 Import JSON
        </button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className={`${btn} text-red-600 dark:text-red-300`}
        >
          🧹 Reset data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          aria-label="Pick a JSON file to import"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doImportFile(f);
            e.target.value = '';
          }}
        />
      </div>
      {msg ? (
        <div className="mt-1 px-1">
          <p role="status" className="text-sm text-ink-500 dark:text-slate-400">
            {msg}
          </p>
          {needsReload ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1.5 min-h-[36px] rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Reload now
            </button>
          ) : null}
        </div>
      ) : null}

      <details className="mx-1 mt-2 rounded-xl border border-cream-200 bg-cream-100/60 dark:border-slate-700 dark:bg-slate-800/60">
        <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-cream-200/60 dark:text-slate-300 dark:hover:bg-slate-700/60">
          <span aria-hidden="true">📱</span> How to move my data to another device
        </summary>

        <div className="px-3 pb-3 pt-1">
          <p className="text-[13px] text-ink-500 dark:text-slate-400">
            Data lives inside this browser, so each device keeps its own copy. Copying it over takes one export and one import.
          </p>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">On the device you are leaving</p>
          <ol className="mt-1 space-y-1.5">
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">1.</span>
              <span>Tap <strong>Export JSON</strong> above.</span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">2.</span>
              <span>
                The file <code className="rounded bg-cream-200 px-1 text-[12px] dark:bg-slate-700">habit-tracker-YYYY-MM-DD.json</code> lands in Downloads (or Files on iPhone).
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">3.</span>
              <span>Send it to yourself — Telegram, WhatsApp, Drive, or email.</span>
            </li>
          </ol>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">On the new device</p>
          <ol className="mt-1 space-y-1.5">
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">4.</span>
              <span>
                Open <span className="whitespace-nowrap">ascend-habit.vercel.app</span> and add it to your home screen (browser menu → <strong>Add to Home screen</strong>).
              </span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">5.</span>
              <span>Open the app from that icon, then Settings → <strong>Import JSON</strong> → pick the file.</span>
            </li>
            <li className="flex gap-2 text-[13px]">
              <span className="font-bold text-sage-600 dark:text-emerald-300">6.</span>
              <span>Reload the page once the import message appears.</span>
            </li>
          </ol>

          <div className="mt-3 rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950/40">
            <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-100">
              <strong>Import replaces everything</strong> on that device — it is not a merge. Devices do <strong>not</strong> sync, so move data again from whichever device you used last.
            </p>
          </div>

          <p className="mt-2 text-[12px] text-ink-500 dark:text-slate-400">
            Tip: export once a month and keep the file in Drive. A cleared browser can wipe local data.
          </p>
        </div>
      </details>
      {confirmReset ? (
        <div role="alertdialog" aria-modal="true" aria-label="Confirm reset" className="mt-2 rounded-xl bg-red-50 p-3 dark:bg-red-950">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            Delete all data? This cannot be undone.
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={doReset} className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[44px] flex-1 rounded-xl border border-cream-300 px-3 text-sm dark:border-slate-600">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
