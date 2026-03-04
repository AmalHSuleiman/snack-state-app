import type { Snack, ScoredSnack, State, Filters, Nutrition } from "./types";

// Hour after which caffeine receives a heavier penalty (2 PM = 14)
const CAFFEINE_CUTOFF_HOUR = 14;

// ─── Per-state positive scoring weights ─────────────────────────────────────
const WEIGHTS: Record<State, Partial<Record<keyof Nutrition, number>>> = {
  energized: {
    carbs_g: 1.5,
    fiber_g: 3.0,
    potassium_mg: 0.012,
    vitamin_b6_mg: 25,
    protein_g: 0.5,
  },
  focused: {
    protein_g: 3.5,
    fiber_g: 3.0,
    fat_g: 0.5,
    potassium_mg: 0.006,
    vitamin_b6_mg: 10,
  },
  calm: {
    magnesium_mg: 0.35,
    fiber_g: 2.0,
    protein_g: 0.5,
    potassium_mg: 0.005,
  },
  uplifted: {
    protein_g: 1.5,
    carbs_g: 0.8,
    potassium_mg: 0.008,
    vitamin_b6_mg: 15,
    magnesium_mg: 0.1,
  },
  sleep_ready: {
    magnesium_mg: 0.6,
    protein_g: 0.4,
    fiber_g: 1.0,
    potassium_mg: 0.006,
  },
};

// ─── Per-state penalty functions ─────────────────────────────────────────────
function computePenalty(state: State, n: Nutrition, hour: number): number {
  const isAfterCutoff = hour >= CAFFEINE_CUTOFF_HOUR;
  let penalty = 0;

  switch (state) {
    case "energized":
      if (n.sugar_g > 20) penalty += (n.sugar_g - 20) * 0.6;
      if (isAfterCutoff && n.caffeine_mg > 0) penalty += 18;
      else if (n.caffeine_mg > 0) penalty += 5; // mild penalty even before cutoff
      break;

    case "focused":
      penalty += n.sugar_g * 0.5; // sugar spikes hurt focus
      if (n.caffeine_mg > 50) penalty += 5; // too much caffeine = jitters
      break;

    case "calm":
      penalty += n.caffeine_mg * 2.5; // caffeine disrupts calm
      if (n.sugar_g > 15) penalty += (n.sugar_g - 15) * 0.4;
      break;

    case "uplifted":
      if (n.sugar_g > 20) penalty += (n.sugar_g - 20) * 0.4;
      if (isAfterCutoff && n.caffeine_mg > 0) penalty += 12;
      else if (n.caffeine_mg > 0) penalty += 3;
      break;

    case "sleep_ready":
      penalty += n.caffeine_mg * 12; // very strong caffeine penalty
      if (n.sugar_g > 15) penalty += (n.sugar_g - 15) * 1.2;
      break;
  }

  return penalty;
}

// ─── Score a single snack for a given state ──────────────────────────────────
export function scoreSnack(snack: Snack, state: State, hour: number): number {
  const n = snack.nutrition;
  const weights = WEIGHTS[state];
  let score = 0;

  for (const [key, weight] of Object.entries(weights) as [keyof Nutrition, number][]) {
    score += (n[key] as number) * weight;
  }

  score -= computePenalty(state, n, hour);
  return Math.round(score * 100) / 100;
}

// ─── Build a human-readable explanation ──────────────────────────────────────
export function buildExplanation(snack: Snack, state: State, hour: number): string {
  const n = snack.nutrition;
  const isAfterCutoff = hour >= CAFFEINE_CUTOFF_HOUR;
  const reasons: string[] = [];

  switch (state) {
    case "energized":
      if (n.carbs_g >= 20) reasons.push("complex carbs for sustained energy");
      if (n.fiber_g >= 4) reasons.push("fiber to keep energy steady");
      if (n.potassium_mg >= 350) reasons.push("potassium for muscle and nerve function");
      if (n.vitamin_b6_mg >= 0.3) reasons.push("vitamin B6 for energy metabolism");
      if (n.protein_g >= 6) reasons.push("protein to avoid a mid-afternoon dip");
      break;

    case "focused":
      if (n.protein_g >= 10) reasons.push("high protein to support concentration");
      if (n.fiber_g >= 4) reasons.push("fiber for steady blood sugar");
      if (n.fat_g >= 8) reasons.push("healthy fats for brain function");
      if (n.sugar_g <= 6) reasons.push("low sugar to avoid a focus crash");
      if (n.vitamin_b6_mg >= 0.2) reasons.push("B6 for cognitive support");
      break;

    case "calm":
      if (n.magnesium_mg >= 40) reasons.push("magnesium to support relaxation");
      if (n.caffeine_mg === 0) reasons.push("caffeine-free to avoid jitters");
      if (n.fiber_g >= 3) reasons.push("fiber for steady, calm energy");
      if (n.sugar_g <= 5) reasons.push("low sugar to prevent spikes");
      break;

    case "uplifted":
      if (n.vitamin_b6_mg >= 0.2) reasons.push("vitamin B6 linked to mood support");
      if (n.potassium_mg >= 250) reasons.push("potassium for nerve signaling");
      if (n.protein_g >= 6) reasons.push("protein for neurotransmitter production");
      if (n.magnesium_mg >= 30) reasons.push("magnesium for a positive mood baseline");
      break;

    case "sleep_ready":
      if (n.magnesium_mg >= 20) reasons.push("magnesium to help you wind down");
      if (n.caffeine_mg === 0) reasons.push("caffeine-free to support sleep onset");
      if (n.sugar_g <= 10) reasons.push("low sugar to avoid disrupting sleep");
      if (n.potassium_mg >= 200) reasons.push("potassium for muscle relaxation");
      break;
  }

  if (isAfterCutoff && n.caffeine_mg === 0 && state !== "calm") {
    reasons.push("no late-day caffeine to protect your sleep");
  }

  if (reasons.length === 0) {
    reasons.push("balanced nutrition that supports your selected state");
  }

  return `Chosen for its ${reasons.slice(0, 3).join(", ")}.`;
}

// ─── Apply dietary filters ───────────────────────────────────────────────────
function passesFilters(snack: Snack, filters: Filters): boolean {
  if (filters.no_caffeine && snack.nutrition.caffeine_mg > 0) return false;
  if (filters.nut_free && !snack.dietary.is_nut_free) return false;
  if (filters.dairy_free && !snack.dietary.is_dairy_free) return false;
  if (filters.vegetarian && !snack.dietary.is_vegetarian) return false;
  if (filters.vegan && !snack.dietary.is_vegan) return false;
  return true;
}

// ─── Main recommendation function ───────────────────────────────────────────
export function getRecommendations(
  snacks: Snack[],
  state: State,
  hour: number,
  filters: Filters = {}
): { top: ScoredSnack; alternatives: [ScoredSnack, ScoredSnack] } | null {
  const eligible = snacks.filter((s) => passesFilters(s, filters));

  if (eligible.length < 3) return null;

  const scored: ScoredSnack[] = eligible
    .map((snack) => ({
      ...snack,
      score: scoreSnack(snack, state, hour),
      explanation: buildExplanation(snack, state, hour),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    top: scored[0],
    alternatives: [scored[1], scored[2]],
  };
}
