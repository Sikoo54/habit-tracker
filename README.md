# ⛰️ AscendHabit — From small changes to a Better Life

![CI](https://github.com/Sikoo54/habit-tracker/actions/workflows/ci.yml/badge.svg)

> A habit tracker that treats daily routines as a climb. One tap per habit, XP for showing up, and a route from Base Camp to the Starlit Summit. UI in English.

**Live demo:** https://ascend-habit.vercel.app

## Problem statement

Most habit apps punish users: one forgotten tap erases weeks of consistency, endless task lists cause overwhelm, and guilt makes people quit. AscendHabit keeps the scope small and the feedback honest:

- **Limit scope** — up to 10 active habits, each with a single target; side quests are optional extras.
- **Honest streak** — a day counts only when every main quest habit due that day is done. One missed habit breaks the chain.
- **Reflect, don't regret** — a two-question nightly entry with mood and energy history.
- **Forgive the midnight miss** — yesterday can be backfilled, explicitly marked not done, or left alone.

## Features

### Main Quest and Side Quests

- **Main Quest** is the habit board. One tap marks a habit done and awards a flat **+20 XP**. There is one target per habit — no "small version" / "full version" split.
- **Side Quests** are optional daily tasks worth **+15 XP**. Unfinished quests from earlier days surface in a banner so they can be carried over or let go instead of silently disappearing.
- **Yesterday backfill** — a "Fix yesterday" panel logs a forgotten habit the next morning. Late entries stay marked `late` and still count for XP and the streak; the user can also mark a habit explicitly **Not done**.
- **Weekly goals** — each habit can target 0–7 check-ins per week, shown as a `n/7 wk` chip on the row and as progress meters on Stats.

### Progression

- **XP** comes from habits (+20), side quests (+15), reflections (+15, +5 with mood and energy), and morning/night attendance (+5 each).
- **Levels and ranks** — reaching level `L` takes `150n² − 50n` XP, where `n = L − 1`; titles run **Grinder → Steady → Grindmaster → Warden of Routine → Knight of Consistency → Sentinel of Discipline → Eternal Ascender → Ascendant One**.
- **Ascent route** — the level also places you on a climbing route: 🏕️ Base Camp → 🌲 Tree Line → 🌄 Ridge → 🏞️ Alpine Lake → ☁️ Cloud Line → 🧗 Summit Push → 🏔️ Summit → 🌌 Starlit Summit.
- **Level-up modal** names the new rank and route stop.
- **Frost decay** — every fully idle day burns 15% of net XP (minimum 30 XP), enough to drop a level. A day is never idle if anything was logged: a check-in, a done quest, a reflection, or attendance. First run catches up at most 3 days.

### Streak

- **Daily and whole-board** — a day joins the streak only when every habit that existed on that day is checked. Side quests, reflections, and attendance never feed it.
- **Today in progress** — the count includes today once the board is complete; an unfinished today does not break the chain until midnight, so the number stays at the chain through yesterday.
- **Displayed from 2 days** — a single day is not a streak yet.
- **Reset notice** — the morning after a missed day, Today explains that the chain ended, how long it was, and how to start again. It hides once every main quest is done again, and can be dismissed for that day.
- **Habit rows stay factual** — a row only says "Yesterday missed." when yesterday was left open; no per-habit streak counters or reset explanations.

### Attendance gate

- A full-screen logbook opens at **04:00** (morning) and again at **22:00** (night). One tap logs attendance, awards +5 XP, and unlocks the app.
- The gate has no footline text; it shows the date, the current streak, and a single action.

### Stats, reflection, and focus

- **Adventure Log** — this week's completion rate, delta vs last week, a 7-day mini calendar, weekly goal meters, a 52-week activity heatmap, per-day bars, and the achievement grid.
- **12 achievements** — including First Step, Habit Devotee, Iron Routine, Perfect Day, On Fire, Unstoppable, Week Warrior, and Ascension, each with a progress counter. Unlocks appear as toasts.
- **Campfire Tales** — nightly reflection with "what happened" and "what to fix tomorrow", optional mood/energy 1–5, and a past-entry accordion.
- **Focus arena** — a 25/5 Pomodoro linked to an open main quest, a side quest, or a custom focus.

### App shell

- **Cream light theme and dark mode** with high-contrast text; dark mode persists.
- **Responsive** — top navigation on desktop, bottom tabs with 44px touch targets on phones; habits stay above side quests on small screens.
- **Installable PWA** with offline caching and auto-update.
- **Local-first storage** — data lives in this browser under `habittracker.v2.*`. Export/import moves it between devices; imports replace, never merge, and there is no sync.
- **Backup nudge** — Settings warns when the last export is older than 30 days or missing.
- **Reset** with a confirmation step.

## Tech stack

React 18 · Vite 6 · TypeScript (strict) · Tailwind CSS v4 · Vitest + jsdom · ESLint + Prettier · vite-plugin-pwa · Vercel (SPA rewrite) · GitHub Actions (lint, test, build)

## Run locally

```bash
git clone https://github.com/Sikoo54/habit-tracker.git
cd habit-tracker
npm install
npm run dev      # http://localhost:5173
npm run test     # Vitest, single run
npm run lint
npm run build && npm run preview   # production build + service worker on :4173
```

`npm run dev` does not register the service worker; use `build` + `preview` when testing PWA or offline behaviour.

## Data and privacy

- Everything is stored on the device in `localStorage`; nothing is sent to a server.
- Clearing browser data wipes the app, so export a JSON backup regularly from Settings.
- One export covers habits, side quests, check-ins, reflections, and attendance (`schemaVersion: 1`).
- Import **replaces** all local data and requires a reload. Devices do not sync.

## Design decisions

- **Why is the habit list the Main Quest?** The app is an ascent built on habits, not a task manager. Habits carry the streak, the hero progress, and the visual weight; quests are optional extras that earn XP without ever blocking a perfect day.
- **Why a whole-board streak?** A streak that survives on one check-in says nothing about consistency. Counting only days where every main quest habit is done makes the number mean "I showed up for all of it", and achievements read the same calculation, so the badge cannot disagree with the header.
- **Why one target per habit?** Two versions of the same habit split attention and make "did I do it?" ambiguous. One clear target and one tap keeps the daily board honest and fast to finish.
- **Why a storage adapter?** Components and hooks talk only to the `StorageAdapter` interface (injected via `StorageContext`). Today it is `LocalStorageAdapter` with validated reads and normalization; a Supabase adapter can replace it without touching the UI.
- **Why desktop-first responsive?** The base layout targets a wide screen with a top bar and a `max-w-5xl` board, then collapses to bottom tabs, one column, and larger touch targets on phones.
- **Why midnight, not noon?** A day is the local calendar day, and the shell ticks every 60 seconds so the board rolls over within a minute of 00:00.

## Project structure

```
src/
  components/  Layout, Hud, HabitCard, HabitForm, TaskList, QuoteCard, AscentCard,
               AscentTrail, AttendanceGate, YesterdayBackfill, LeftoverBanner,
               Heatmap, AchievementsGrid, AchievementToast, Pomodoro, ScorePicker,
               DataTools, EmptyState, RankInfo
  pages/       TodayPage, StatsPage, ReflectionPage, FocusPage
  hooks/       useHabits, useTasks, useCheckins, useReflections, useAttendance,
               useGame, useDarkMode, useAchievementToasts
  game/        xp, achievements, attendance, decay, trainingStreak, dailyStreak,
               weeklyGoals (+ tests)
  utils/       dates, streak, checkins, stats, tasks, backup, quote (+ tests)
  storage/     types (StorageAdapter), localStorageAdapter, supabaseAdapter (placeholder),
               StorageContext
  data/        seed, quotes
  types/       Habit, Task, Checkin, Reflection, Attendance, ExportPayload
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

- [ ] Supabase sync + login (see the TODOs in `src/storage/supabaseAdapter.ts`)
- [ ] Reminders / notifications
- [x] PWA offline support
- [ ] Habit notes and longer-range charts
- [ ] Per-day habit snapshot, so archiving or deleting a habit cannot rewrite past streak days

## Author

Built by **Sacha Ahsan** — https://sachaahsan.vercel.app/
