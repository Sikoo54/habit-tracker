# ⛰️ AscendHabit — Gamified Habit Tracker + To-Do

![CI](https://github.com/Sikoo54/habit-tracker/actions/workflows/ci.yml/badge.svg)

> A calm, forgiving productivity app turned ascension quest: earn XP, climb ranks, evolve a spirit companion, clear daily quests. UI in English.

**Live demo:** https://ascend-habit.vercel.app
**Screenshots:** _(add `docs/screenshot-today.png`, `docs/screenshot-stats.png`, `docs/screenshot-reflection.png`)_

## Problem statement

Most habit apps punish users: a forgotten tap can wipe weeks of consistency, endless task lists cause overwhelm, and guilt makes people quit. This app is designed around kindness:

- **Limit scope** — only 3 priorities per day, max 10 active habits.
- **Honest streak** — a day counts only when every daily training habit due that day is done.
- **Reflect, don't regret** — a 2-question nightly check-in with history.

## Features

- **Gamification (Ascend theme)** — XP for everything (full habit +20, small +10, priority quest +25, side +15, reflection +15/+20, morning/night absen +5 each), levels, level-up celebration, and a spirit companion ascending 🥚→🌱→🌿→🌳→🌸→🦉→🐉→👑.
- **Daily training streak + frost decay** — a day joins the streak only when **every** habit that existed that day is checked (full or small). Quests, reflections and absen do not feed it. Frost decay is separate: one fully idle day burns 15% XP (min 30), enough to drop a level.
- **Morning & night absen gate** — open the app after 04:00 and a full-screen logbook asks you to check in before the day starts; from 20:00 it's the before-sleep screen. Tapping grants +5 XP and counts as activity for frost decay, but not for the streak.
- **12 achievements** — First Step, Perfect Day, On Fire, Unstoppable, Week Warrior, and more, with progress counters.
- **Today page** — main/side quest boards, daily training list with streaks, greeting hero + XP summary.
- **Habits (max 10 active)** — name, full version, small version, trigger (habit stacking).
- **Per-habit streaks** — 🔥 counter per habit with friendly messages and an at-risk warning when yesterday was missed. The header streak is the stricter full-day number.
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
- **Why a full-day streak?** A streak that survives on one check-in says nothing about consistency. Counting only days where every training habit is done makes the number mean "I showed up for all of it", and achievements read the exact same calculation so the badge can never argue with the header. Per-habit 🔥 counters stay available for granular encouragement.
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
- [x] PWA offline support
- [ ] Habit notes & longer history charts

## Author

Built by **Sacha Ahsan** — https://sachaahsan.vercel.app/
