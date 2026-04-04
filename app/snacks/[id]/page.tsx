import { notFound } from "next/navigation";
import Link from "next/link";
import { getSnackById } from "@/lib/db";
import { getEmotionalContext } from "@/lib/emotional-context";
import type { State } from "@/lib/types";

const VALID_STATES: State[] = ["energized", "focused", "calm", "uplifted", "sleep_ready"];

const STATE_META: Record<State, { label: string; emoji: string; accent: string; bg: string }> = {
  energized:   { label: "Energized",   emoji: "⚡", accent: "text-amber-600",   bg: "bg-amber-50"   },
  focused:     { label: "Focused",     emoji: "🎯", accent: "text-blue-600",    bg: "bg-blue-50"    },
  calm:        { label: "Calm",        emoji: "🌿", accent: "text-emerald-600", bg: "bg-emerald-50" },
  uplifted:    { label: "Uplifted",    emoji: "✨", accent: "text-violet-600",  bg: "bg-violet-50"  },
  sleep_ready: { label: "Sleep-Ready", emoji: "🌙", accent: "text-indigo-600",  bg: "bg-indigo-50"  },
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

  const backHref = state
    ? `/results?state=${state}`
    : "/";

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Back button */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {state ? "Back to recommendations" : "Back to home"}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{snack.name}</h1>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <span className="text-xs text-gray-400">⏱ {snack.prep_time_minutes === 0 ? "No prep" : `${snack.prep_time_minutes} min`}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              snack.effort === "Easy" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            }`}>
              {snack.effort === "Easy" ? "🟢 Easy" : "🟡 Medium"}
            </span>
          </div>
        </div>
      </div>

      {/* Emotional context */}
      {emotionalCtx && meta && (
        <div className={`rounded-2xl p-5 mb-6 ${meta.bg}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${meta.accent} mb-3`}>
            {meta.emoji} {meta.label}
          </p>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Best for: {emotionalCtx.bestFor}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Why this works: {emotionalCtx.whyItWorks}
          </p>
        </div>
      )}

      {/* Nutrition highlights */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Nutrition highlights</h2>
        <div className="flex flex-wrap gap-2">
          {snack.nutrition_highlights.map((highlight) => (
            <span
              key={highlight}
              className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Ingredients</h2>
        <ul className="space-y-1.5">
          {snack.ingredients.map((ingredient) => (
            <li key={ingredient} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">How to make it</h2>
        <ol className="space-y-3">
          {snack.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Smart swaps */}
      {snack.smart_swaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Smart swaps</h2>
          <ul className="space-y-2">
            {snack.smart_swaps.map((swap) => (
              <li key={swap.ingredient} className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">No {swap.ingredient}?</span>{" "}
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
            <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Back CTA */}
      <Link
        href={backHref}
        className="block w-full py-3 text-center rounded-2xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium transition-all"
      >
        {state ? "Back to recommendations" : "Find a snack"}
      </Link>
    </div>
  );
}
