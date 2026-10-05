# 🌱 Kebiasaan Baik — Gentle Habit Tracker + To-Do

![CI](https://github.com/Sikoo54/habit-tracker/actions/workflows/ci.yml/badge.svg)

> A calm, forgiving productivity app: max 3 daily priorities, tolerant streaks, nightly reflection. UI in English.

**Live demo:** https://your-app.vercel.app _(replace with your Vercel URL)_
**Screenshots:** _(add `docs/screenshot-today.png`, `docs/screenshot-stats.png`, `docs/screenshot-reflection.png`)_

## Problem statement

Most habit apps punish users: one missed day kills the streak, endless task lists cause overwhelm, and guilt makes people quit. This app is designed around kindness:

- **Limit scope** — only 3 priorities per day, max 5 active habits.
- **Forgive slips** — a streak breaks only after 2 consecutive missed days.
- **Reflect, don't regret** — a 2-question nightly check-in with history.

## Features

- **Today page** — 3 priorities + overflow list, daily habit checklist (full/small version), date + progress bar.
- **Habits (max 5 active)** — name, full version, small version, trigger (habit stacking).
- **Tolerant streaks** — 🔥 counter + friendly messages, at-risk warning after 1 missed day.
- **Nightly reflection** — "what went well / what to change", history accordion, optional mood/energy 1–5.
- **Weekly stats** — completion %, this-week vs last-week delta, 7-day mini calendar, per-day bars.
- **Extras** — Pomodoro 25/5 linked to top priority, dark mode, JSON export/import, reset with confirm dialog.

## Tech stack

React 18 · Vite 6 · TypeScript (strict, no `any`) · Tailwind CSS v4 · Vitest + jsdom · ESLint + Prettier · Vercel (SPA rewrite) · GitHub Actions (lint/test/build only)

## Run locally

```bash
npm create vite@latest habit-tracker -- --template react-ts
cd habit-tracker
# copy files from this repo, then:
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest run
npm run lint
npm run build && npm run preview
```

## Design decisions

- **Why max 3 priorities?** Decision fatigue kills action. Three forces a real choice; extras go to "Daftar Lain" without guilt.
- **Why tolerant streaks?** Research on habit formation shows one slip is normal; all-or-nothing streaks cause abandonment. Breaking only after 2 missed days keeps momentum while staying honest.
- **Why a storage adapter?** Components/hooks talk only to the `StorageAdapter` interface (injected via `StorageContext`). Today it is `LocalStorageAdapter` (validated reads, schemaVersion for migration); tomorrow it can be `SupabaseAdapter` with zero UI changes. See `src/storage/`.
- **Why desktop-first responsive?** Base layout targets laptop (1100px centered, left sidebar, 2 columns), then collapses with `max-lg:`/`max-md:` variants to top bar (tablet) and bottom tabs + 1 column + 44px touch targets (phone).
- **Why full/small versions?** A "2-minute version" removes the start barrier on hard days; both count as done.

## Project structure

```
src/
  components/  Layout, TaskList, HabitCard, HabitForm, Pomodoro, ScorePicker, ProgressBar, DataTools, EmptyState
  pages/       TodayPage, StatsPage, ReflectionPage
  hooks/       useHabits, useTasks, useCheckins, useReflections, useDarkMode
  utils/       dates, streak, stats (+ vitest files)
  types/       Habit, Task, Checkin, Reflection
  storage/     types (StorageAdapter), localStorageAdapter, supabaseAdapter (TODO placeholder), StorageContext
  data/        seed.ts
```

## Deploy to Vercel

`vercel.json` rewrites all routes to `index.html` (SPA fallback, no base path). Then:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

Or connect the GitHub repo in the Vercel dashboard (framework preset: Vite).

## Roadmap

- [ ] Supabase sync + login (see `src/storage/supabaseAdapter.ts` TODOs)
- [ ] Reminders / notifications
- [ ] PWA offline support
- [ ] Habit notes & longer history charts
