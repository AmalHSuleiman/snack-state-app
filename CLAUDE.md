# CLAUDE.md

This file provides guidance to Claude Code for working in this repository.

## Running the app

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # run production build
```

## Deployment

- **Live URL:** https://snack-state-app.vercel.app
- **Hosting:** Vercel
- **Database:** Supabase (production analytics only); snack data is static in `data/snacks.ts`
- Supabase credentials are stored as Vercel environment variables — never hardcode them in source files

## Git workflow

After completing any meaningful unit of work, commit and push to GitHub immediately so progress is never lost.

- Stage specific files by name rather than `git add .`
- Write clean, descriptive commit messages in imperative mood (e.g. `Add sleep-ready filter logic`, `Fix scoring penalty for late caffeine`)
- Push to the remote after every commit: `git add <files> && git commit -m "message" && git push`
- Never leave work uncommitted at the end of a session

## Architecture

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Styling  | Tailwind CSS                       |
| Backend  | Next.js API Routes                 |
| Database | Supabase (analytics events only)   |
| Language | TypeScript                         |

### Project structure

```
app/
  page.tsx                  # Home: state selector + dietary filter toggles
  results/page.tsx          # Results: top pick + alternatives (expandable)
  saved/page.tsx            # Saved snacks (localStorage)
  snacks/[id]/page.tsx      # Snack detail: recipe, macros, smart swaps
  layout.tsx                # Root layout with header/footer + Analytics component
  api/
    recommendations/        # POST /api/recommendations — scoring + ranking
    events/                 # POST /api/events — analytics logging to Supabase
components/
  SnackCard.tsx             # Reusable snack card (top pick + alt variants)
  Analytics.tsx             # Client component: fires first_visit/return_visit on load
data/
  snacks.ts                 # 80 curated snacks with nutrition data (never insert mid-array — append only)
lib/
  types.ts                  # Shared TypeScript interfaces
  db.ts                     # Snack lookups + logEvent (writes to Supabase in prod)
  scoring.ts                # Weighted nutrition scoring + explanation builder
  emotional-context.ts      # Per-state bestFor/whyItWorks copy for detail page
```

## Key implementation details

- **Snack library** — 80 snacks in `data/snacks.ts` with USDA-aligned nutrition values. IDs are positional (index + 1) — never insert mid-array, only append.
- **Scoring** — `lib/scoring.ts` computes a weighted nutrition score per state; heavier caffeine penalties apply after 2 PM
- **States** — `energized`, `focused`, `calm`, `uplifted`, `sleep_ready`; each has distinct scoring weights and penalty rules
- **Dietary filters** — `no_caffeine`, `nut_free`, `dairy_free`, `vegetarian`, `vegan`; passed as query params
- **Analytics** — events logged to Supabase: `state_selected`, `recommendation_shown`, `recommendation_chosen`, `caffeine_snack_chosen`, `first_visit`, `return_visit`. All events include `anon_id` (UUID stored in localStorage) for return-visit tracking.
- **Saved snacks** — stored in `localStorage` under `saved_snacks_v2`, no user auth required

## Extending the snack library

Add entries to the **end** of the array in `data/snacks.ts` following the existing format. Each snack needs: `name`, `ingredients` (with amounts), `prep_time_minutes`, `tags`, `nutrition`, `warnings`, `dietary`, `steps`, `effort`, `nutrition_highlights`, `smart_swaps`.
