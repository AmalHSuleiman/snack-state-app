# Snack State

> Tell us how you want to feel. Get a fast snack idea you can make in under 5 minutes.

A minimal MVP web app that translates a desired mental/physical state into a personalized snack recommendation backed by deterministic nutrition scoring.

---

## Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | Next.js 14 (App Router)   |
| Styling  | Tailwind CSS              |
| Backend  | Next.js API Routes        |
| Database | SQLite (`better-sqlite3`) |
| Language | TypeScript                |

---

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
cd snack-state-app
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database (`snack-state.db`) is created automatically on first request and seeded with the 50-snack library. No separate seed step needed.

### Build for production

```bash
npm run build
npm start
```

---

## Project structure

```
snack-state-app/
├── app/
│   ├── page.tsx               # Home: state selector + dietary filters
│   ├── results/page.tsx       # Results: top pick + 2 alternatives
│   ├── saved/page.tsx         # Saved snacks (localStorage)
│   ├── layout.tsx             # Root layout with header/footer
│   └── api/
│       ├── recommendations/   # POST /api/recommendations
│       └── events/            # POST /api/events (analytics)
├── lib/
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── db.ts                  # SQLite setup, seeding, helpers
│   └── scoring.ts             # Deterministic scoring + explanation builder
├── data/
│   └── snacks.ts              # 50 curated snack options with nutrition data
└── README.md
```

---

## How it works

### State selection

The user picks one of five desired states: **Energized**, **Focused**, **Calm**, **Uplifted**, or **Sleep-Ready**. Optional dietary filters (no caffeine, nut-free, dairy-free, vegetarian, vegan) are available as toggles.

### Recommendation scoring

Each snack is scored deterministically using weighted nutrition fields tuned for each state:

| State       | Favors                          | Penalizes                         |
|-------------|----------------------------------|-----------------------------------|
| Energized   | Carbs, fiber, potassium, B6      | High sugar, late-day caffeine     |
| Focused     | Protein, fiber, healthy fat      | Sugar spikes                      |
| Calm        | Magnesium, fiber                 | Caffeine                          |
| Uplifted    | B6, potassium, protein           | High sugar, late-day caffeine     |
| Sleep-Ready | Magnesium, low sugar             | Caffeine (5× penalty), high sugar |

A **time-of-day adjustment** applies a heavier caffeine penalty after 2 PM to align with sleep disruption concerns.

### Snack library

50 curated generic snack options (no branded items), all with prep time ≤ 5 minutes. Nutrition values are based on USDA FoodData Central data for standard serving sizes.

### Analytics events

Four events are logged to SQLite for the North Star Metric (Helpful Recommendation Rate):

| Event                   | Triggers when                              |
|-------------------------|--------------------------------------------|
| `state_selected`        | User selects a desired state               |
| `recommendation_shown`  | Results page loads                         |
| `recommendation_chosen` | User clicks "I'm making this"              |
| `caffeine_snack_chosen` | Chosen snack contains caffeine             |

---

## Extending the snack library

Add entries to `data/snacks.ts` following the existing format, then delete `snack-state.db` and restart the server to re-seed.

---

## MVP scope (not included)

- User accounts / authentication
- User-entered foods
- Branded food items
- Full nutrition/meal tracking
- USDA API live fetching (data is pre-populated)
