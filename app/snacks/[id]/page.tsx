import { notFound } from "next/navigation";
import Link from "next/link";
import { getSnackById } from "@/lib/db";
import { getEmotionalContext } from "@/lib/emotional-context";
import type { State } from "@/lib/types";

const VALID_STATES: State[] = ["energized", "focused", "calm", "uplifted", "sleep_ready"];

const STATE_META: Record<State, { label: string }> = {
  energized:   { label: "Energized"   },
  focused:     { label: "Focused"     },
  calm:        { label: "Calm"        },
  uplifted:    { label: "Uplifted"    },
  sleep_ready: { label: "Sleep-Ready" },
};

export default async function SnackDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { id } = await params;
  const { state: rawState } = await searchParams;

  const snackId = parseInt(id, 10);
  if (isNaN(snackId)) notFound();

  const snack = getSnackById(snackId);
  if (!snack) notFound();

  const state = VALID_STATES.includes(rawState as State) ? (rawState as State) : null;
  const emotionalCtx = state ? getEmotionalContext(state) : null;
  const meta = state ? STATE_META[state] : null;

  const backHref = state ? `/results?state=${state}` : "/";

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      {/* Back button */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {state ? "Back to recommendations" : "Back to home"}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">{snack.name}</h1>
          <div className="flex items-center gap-2 shrink-0 pt-2">
            <span className="text-xs text-stone-400">
              {snack.prep_time_minutes === 0 ? "No prep" : `${snack.prep_time_minutes} min`}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
              snack.effort === "Easy"
                ? "border-stone-200 text-stone-500"
                : "border-stone-200 text-stone-500"
            }`}>
              {snack.effort}
            </span>
          </div>
        </div>
      </div>

      {/* Emotional context */}
      {emotionalCtx && meta && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
            {meta.label}
          </p>
          <p className="text-sm font-semibold text-stone-800 mb-1">
            Best for: {emotionalCtx.bestFor}
          </p>
          <p className="text-sm text-stone-500 leading-relaxed">
            Why this works: {emotionalCtx.whyItWorks}
          </p>
        </div>
      )}

      {/* Nutrition highlights */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Highlights</h2>
        <div className="flex flex-wrap gap-2">
          {snack.nutrition_highlights.map((highlight) => (
            <span
              key={highlight}
              className="px-3 py-1 rounded-md bg-[#2A4A35] text-white text-xs font-medium"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Nutrition per serving</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Protein", value: `${snack.nutrition.protein_g}g` },
            { label: "Carbs",   value: `${snack.nutrition.carbs_g}g`   },
            { label: "Fat",     value: `${snack.nutrition.fat_g}g`     },
            { label: "Fiber",   value: `${snack.nutrition.fiber_g}g`   },
            { label: "Sugar",   value: `${snack.nutrition.sugar_g}g`   },
            { label: "Magnesium", value: `${snack.nutrition.magnesium_mg}mg` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center bg-stone-50 rounded-lg py-3 px-2">
              <p className="text-base font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {snack.nutrition.caffeine_mg > 0 && (
          <p className="text-xs text-stone-400 mt-3 text-center">
            Contains {snack.nutrition.caffeine_mg}mg caffeine
          </p>
        )}
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Ingredients</h2>
        <ul className="space-y-1.5">
          {snack.ingredients.map((ingredient) => (
            <li key={ingredient} className="flex items-center gap-2 text-sm text-stone-700">
              <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl border border-stone-100 p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">How to make it</h2>
        <ol className="space-y-3">
          {snack.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-stone-700">
              <span className="shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Smart swaps */}
      {snack.smart_swaps.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-100 p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Smart swaps</h2>
          <ul className="space-y-2">
            {snack.smart_swaps.map((swap) => (
              <li key={swap.ingredient} className="text-sm text-stone-700">
                <span className="font-medium text-stone-900">No {swap.ingredient}?</span>{" "}
                Try {swap.swap}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {snack.warnings.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {snack.warnings.map((w) => (
            <span key={w} className="text-xs px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Back CTA */}
      <Link
        href={backHref}
        className="block w-full py-3 text-center rounded-xl border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 font-medium transition-all"
      >
        {state ? "Back to recommendations" : "Find a snack"}
      </Link>
    </div>
  );
}
