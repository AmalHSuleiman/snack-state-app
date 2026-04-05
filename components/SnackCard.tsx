"use client";

import Link from "next/link";
import type { ScoredSnack, State } from "@/lib/types";

const NUTRITION_COLORS = {
  protein:  { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400" },
  carbs:    { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
  fiber:    { bg: "bg-teal-50",     text: "text-teal-700",    dot: "bg-teal-400"    },
  sugar:    { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-400"    },
  caffeine: { bg: "bg-purple-50",   text: "text-purple-700",  dot: "bg-purple-400"  },
  mg:       { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-400"    },
};

function NutritionPill({ label, value, color }: { label: string; value: string; color: keyof typeof NUTRITION_COLORS }) {
  const c = NUTRITION_COLORS[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg} text-xs font-medium ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label} {value}
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

export default function SnackCard({ snack, variant, onChoose, onSave, detailHref }: SnackCardProps) {
  const n = snack.nutrition;
  const isTop = variant === "top";

  return (
    <div className={`bg-white rounded-2xl p-5 ${isTop ? "shadow-md" : "shadow-sm border border-stone-100"}`}>
      {isTop && (
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
          Top pick
        </p>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        {detailHref ? (
          <Link href={detailHref} className={`font-bold ${isTop ? "text-lg" : "text-base"} text-stone-900 hover:underline`}>
            {snack.name}
          </Link>
        ) : (
          <h2 className={`font-bold ${isTop ? "text-lg" : "text-base"} text-stone-900`}>{snack.name}</h2>
        )}
        <span className="text-xs text-stone-400 whitespace-nowrap pt-0.5">
          {snack.prep_time_minutes === 0 ? "No prep" : `${snack.prep_time_minutes} min`}
        </span>
      </div>

      <p className="text-sm text-stone-500 mb-4 leading-relaxed">{snack.explanation}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <NutritionPill label="Protein" value={`${n.protein_g}g`} color="protein" />
        <NutritionPill label="Carbs"   value={`${n.carbs_g}g`}   color="carbs"   />
        <NutritionPill label="Fiber"   value={`${n.fiber_g}g`}   color="fiber"   />
        <NutritionPill label="Sugar"   value={`${n.sugar_g}g`}   color="sugar"   />
        {n.magnesium_mg >= 30 && <NutritionPill label="Mg" value={`${n.magnesium_mg}mg`} color="mg" />}
        {n.caffeine_mg > 0    && <NutritionPill label="Caffeine" value={`${n.caffeine_mg}mg`} color="caffeine" />}
      </div>

      <p className="text-xs text-stone-400 mb-4">{snack.ingredients.join(", ")}</p>

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
        {detailHref ? (
          <Link
            href={detailHref}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-center transition-all active:scale-95 bg-[#2A4A35] text-white hover:bg-[#1E3828]"
          >
            View recipe
          </Link>
        ) : (
          <button
            onClick={() => onChoose(snack)}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-[#2A4A35] text-white hover:bg-[#1E3828]"
          >
            I'm making this
          </button>
        )}
        <button
          onClick={() => onSave(snack)}
          title="Save for later"
          className="px-3 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
