import type { State } from "./types";

interface EmotionalContext {
  bestFor: string;
  whyItWorks: string;
}

export const EMOTIONAL_CONTEXT: Record<State, EmotionalContext> = {
  energized: {
    bestFor: "Sustained power for 2–3 hours of activity",
    whyItWorks:
      "Complex carbs and fiber release energy gradually, avoiding the crash that comes from sugar spikes. Potassium and B6 support muscle function and keep you moving.",
  },
  focused: {
    bestFor: "Staying sharp and in the zone for 2–3 hours",
    whyItWorks:
      "Protein and healthy fats stabilize blood sugar, keeping your brain fueled without the fog. Fiber slows digestion so your energy doesn't spike and crash mid-task.",
  },
  calm: {
    bestFor: "Settling into a relaxed, stress-reduced state",
    whyItWorks:
      "Magnesium supports your nervous system and helps reduce cortisol. Low-stimulant, fiber-rich foods keep your body steady rather than on edge.",
  },
  uplifted: {
    bestFor: "A natural mood boost that lasts without a crash",
    whyItWorks:
      "Vitamin B6 and protein support neurotransmitter production — the chemical messengers behind a good mood. Potassium keeps your energy balanced so the lift feels smooth.",
  },
  sleep_ready: {
    bestFor: "Winding down and falling asleep faster",
    whyItWorks:
      "Magnesium relaxes muscles and calms the nervous system. Keeping sugar low prevents the blood sugar swings that can wake you up in the night.",
  },
};

export function getEmotionalContext(state: State): EmotionalContext {
  return EMOTIONAL_CONTEXT[state];
}
