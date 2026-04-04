export type State =
  | "energized"
  | "focused"
  | "calm"
  | "uplifted"
  | "sleep_ready";

export interface Nutrition {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  magnesium_mg: number;
  potassium_mg: number;
  iron_mg: number;
  vitamin_b6_mg: number;
  caffeine_mg: number;
}

export interface Dietary {
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_nut_free: boolean;
  is_dairy_free: boolean;
}

export interface SmartSwap {
  ingredient: string;
  swap: string;
}

export interface Snack {
  id: number;
  name: string;
  ingredients: string[];
  prep_time_minutes: number;
  tags: State[];
  nutrition: Nutrition;
  warnings: string[];
  dietary: Dietary;
  steps: string[];
  effort: "Easy" | "Medium";
  nutrition_highlights: string[];
  smart_swaps: SmartSwap[];
}

export interface Filters {
  no_caffeine?: boolean;
  nut_free?: boolean;
  dairy_free?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
}

export interface RecommendationRequest {
  state: State;
  hour?: number;
  filters?: Filters;
}

export interface ScoredSnack extends Snack {
  score: number;
  explanation: string;
}

export interface RecommendationResponse {
  top: ScoredSnack;
  alternatives: [ScoredSnack, ScoredSnack];
  state: State;
  hour: number;
}

export interface AnalyticsEvent {
  event:
    | "state_selected"
    | "recommendation_shown"
    | "recommendation_chosen"
    | "caffeine_snack_chosen";
  state?: State;
  snack_id?: number;
  snack_name?: string;
  hour?: number;
}

export interface SavedSnack {
  id: number;
  name: string;
  savedState: State | null;
  savedAt: number;
}
