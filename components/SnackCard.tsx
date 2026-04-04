"use client";

import Link from "next/link";
import type { ScoredSnack, State } from "@/lib/types";

const STATE_META: Record<State, { label: string; emoji: string; badge: string }> = {
  energized:   { label: "Energized",   emoji: "⚡", badge: "bg-amber-100 text-amber-700"     },
  focused:     { label: "Focused",     emoji: "🎯", badge: "bg-blue-100 text-blue-700"       },
  calm:        { label: "Calm",        emoji: "🌿", badge: "bg-emerald-100 text-emerald-700" },
  uplifted:    { label: "Uplifted",    emoji: "✨", badge: "bg-violet-100 text-violet-700"   },
  sleep_ready: { label: "Sleep-Ready", emoji: "🌙", badge: "bg-indigo-100 text-indigo-700"   },
};

function NutritionPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
      <span className="text-gray-400">{label}</span> {value}
    </span>
  );
}

interface SnackCardProps {
  snack: ScoredSnack;
  variant: "top" | "alt";
  state: State;
  onChoose: (snack: ScoredSnack) => void;
  onSave: (snack: ScoredSnack) => void;
  detailHref?: string;
}

export default function SnackCard({ snack, variant, state, onChoose, onSave, detailHref }: SnackCardProps) {
  const meta = STATE_META[state];
  const n = snack.nutrition;
  const isTop = variant === "top";

  return (
    <div
      className={`bg-white rounded-2xl border ${
        isTop ? "border-gray-200 shadow-sm" : "border-gray-100"
      } p-5`}
    >
      {isTop && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badge}`}>
            {meta.emoji} Top pick
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        {detailHref ? (
          <Link href={detailHref} className={`font-bold ${isTop ? "text-lg" : "text-base"} text-gray-900 hover:underline`}>
            {snack.name}
          </Link>
        ) : (
          <h2 className={`font-bold ${isTop ? "text-lg" : "text-base"} text-gray-900`}>{snack.name}</h2>
        )}
        <span className="text-xs text-gray-400 whitespace-nowrap pt-0.5">
          ≤ {snack.prep_time_minutes} min
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{snack.explanation}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <NutritionPill label="Protein" value={`${n.protein_g}g`} />
        <NutritionPill label="Carbs" value={`${n.carbs_g}g`} />
        <NutritionPill label="Fiber" value={`${n.fiber_g}g`} />
        <NutritionPill label="Sugar" value={`${n.sugar_g}g`} />
        {n.magnesium_mg >= 30 && <NutritionPill label="Mg" value={`${n.magnesium_mg}mg`} />}
        {n.caffeine_mg > 0 && <NutritionPill label="Caffeine" value={`${n.caffeine_mg}mg`} />}
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {snack.ingredients.join(", ")}
      </p>

      {snack.warnings.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {snack.warnings.map((w) => (
            <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
              {w}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onChoose(snack)}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
            isTop
              ? "bg-gray-900 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          I'm making this
        </button>
        <button
          onClick={() => onSave(snack)}
          title="Save for later"
          className="px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
