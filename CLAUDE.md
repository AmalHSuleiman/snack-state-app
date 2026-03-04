# CLAUDE.md

This file provides guidance to Claude Code for working in this repository.

## Running the app

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). No separate seed step needed — the SQLite database is created and seeded automatically on first request.

```bash
npm run build   # production build
npm start       # run production build
```

## Git workflow

After completing any meaningful unit of work, commit and push to GitHub immediately so progress is never lost.

- Stage specific files by name rather than `git add .`
- Write clean, descriptive commit messages in imperative mood (e.g. `Add sleep-ready filter logic`, `Fix scoring penalty for late caffeine`)
- Push to the remote after every commit: `git add <files> && git commit -m "message" && git push`
- Never leave work uncommitted at the end of a session

## Architecture

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 16 (App Router, Turbopack)|
| Styling  | Tailwind CSS                      |
| Backend  | Next.js API Routes                |
| Database | SQLite via `node:sqlite` (built-in Node module, no native compilation) |
| Language | TypeScript                        |

### Project structure

```
app/
  page.tsx                  # Home: state selector + dietary filter toggles
  results/page.tsx          # Results: top pick + 2 alternatives
  saved/page.tsx            # Saved snacks (localStorage)
  layout.tsx                # Root layout with header/footer
  api/
    recommendations/        # POST /api/recommendations — scoring + ranking
    events/                 # POST /api/events — analytics logging
data/
  snacks.ts                 # 50 curated snack options with nutrition data
lib/
  types.ts                  # Shared TypeScript interfaces
  db.ts                     # SQLite setup, auto-seeding, query helpers
  scoring.ts                # Deterministic scoring + explanation builder
```

## Key implementation details

- **Snack library** — 50 generic snacks in `data/snacks.ts` with USDA-aligned nutrition values; seeded into SQLite on first boot
- **Scoring** — `lib/scoring.ts` computes a weighted nutrition score per state; a time-of-day adjustment applies heavier caffeine penalties after 2 PM
- **States** — `energized`, `focused`, `calm`, `uplifted`, `sleep_ready`; each has distinct scoring weights and penalty rules
- **Dietary filters** — `no_caffeine`, `nut_free`, `dairy_free`, `vegetarian`, `vegan`; passed as query params from the home page
- **Analytics** — four events logged to SQLite: `state_selected`, `recommendation_shown`, `recommendation_chosen`, `caffeine_snack_chosen`
- **Saved snacks** — stored in `localStorage`, no user auth required

## Extending the snack library

Add entries to `data/snacks.ts` following the existing format, then delete `snack-state.db` and restart the dev server to re-seed.
