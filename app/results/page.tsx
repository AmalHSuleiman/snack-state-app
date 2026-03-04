"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import type { RecommendationResponse, ScoredSnack, State } from "@/lib/types";

const STATE_META: Record<State, { label: string; emoji: string; accent: string; badge: string }> = {
  energized: { label: "Energized", emoji: "⚡", accent: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  focused:   { label: "Focused",   emoji: "🎯", accent: "text-blue-600",  badge: "bg-blue-100 text-blue-700"   },
  calm:      { label: "Calm",      emoji: "🌿", accent: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  uplifted:  { label: "Uplifted",  emoji: "✨", accent: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
  sleep_ready: { label: "Sleep-Ready", emoji: "🌙", accent: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
};

function NutritionPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
      <span className="text-gray-400">{label}</span> {value}
    </span>
  );
}

function SnackCard({
  snack,
  variant,
  state,
  onChoose,
  onSave,
}: {
  snack: ScoredSnack;
  variant: "top" | "alt";
  state: State;
  onChoose: (snack: ScoredSnack) => void;
  onSave: (snack: ScoredSnack) => void;
}) {
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
        <h2 className={`font-bold ${isTop ? "text-lg" : "text-base"} text-gray-900`}>{snack.name}</h2>
        <span className="text-xs text-gray-400 whitespace-nowrap pt-0.5">
          ≤ {snack.prep_time_minutes} min
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{snack.explanation}</p>

      {/* Nutrition snapshot */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <NutritionPill label="Protein" value={`${n.protein_g}g`} />
        <NutritionPill label="Carbs" value={`${n.carbs_g}g`} />
        <NutritionPill label="Fiber" value={`${n.fiber_g}g`} />
        <NutritionPill label="Sugar" value={`${n.sugar_g}g`} />
        {n.magnesium_mg >= 30 && <NutritionPill label="Mg" value={`${n.magnesium_mg}mg`} />}
        {n.caffeine_mg > 0 && <NutritionPill label="Caffeine" value={`${n.caffeine_mg}mg`} />}
      </div>

      {/* Ingredients */}
      <p className="text-xs text-gray-400 mb-4">
        {snack.ingredients.join(", ")}
      </p>

      {/* Warnings */}
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

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const state = searchParams.get("state") as State | null;
  const filters = {
    no_caffeine: searchParams.get("no_caffeine") === "1",
    nut_free: searchParams.get("nut_free") === "1",
    dairy_free: searchParams.get("dairy_free") === "1",
    vegetarian: searchParams.get("vegetarian") === "1",
    vegan: searchParams.get("vegan") === "1",
  };

  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!state) return;
    setData(null);
    setError(null);
    setChosen(null);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          hour: new Date().getHours(),
          filters,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error ?? "Something went wrong.");
        return;
      }
      const json: RecommendationResponse = await res.json();
      setData(json);
    } catch {
      setError("Could not load recommendations. Check your connection.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, searchParams.toString()]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Load saved snack IDs from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("saved_snacks");
    if (raw) setSavedIds(JSON.parse(raw).map((s: ScoredSnack) => s.id));
  }, []);

  async function handleChoose(snack: ScoredSnack) {
    setChosen(snack.id);
    const hour = new Date().getHours();
    const events = [{ event: "recommendation_chosen", state: state!, snack_id: snack.id, snack_name: snack.name, hour }];
    if (snack.nutrition.caffeine_mg > 0) {
      events.push({ event: "caffeine_snack_chosen", state: state!, snack_id: snack.id, snack_name: snack.name, hour });
    }
    for (const evt of events) {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt),
      });
    }
    showToast(`Enjoy your ${snack.name}!`);
  }

  function handleSave(snack: ScoredSnack) {
    const raw = localStorage.getItem("saved_snacks");
    const saved: ScoredSnack[] = raw ? JSON.parse(raw) : [];
    if (!saved.find((s) => s.id === snack.id)) {
      saved.push(snack);
      localStorage.setItem("saved_snacks", JSON.stringify(saved));
      setSavedIds((prev) => [...prev, snack.id]);
      showToast("Saved for later!");
    } else {
      showToast("Already saved.");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  if (!state) {
    router.push("/");
    return null;
  }

  const meta = STATE_META[state];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className={`text-xl font-bold ${meta.accent}`}>{meta.emoji} {meta.label}</h1>
          <p className="text-sm text-gray-400">Snacks to help you get there</p>
        </div>
      </div>

      {/* Loading */}
      {!data && !error && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
              <div className="flex gap-2">
                <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                <div className="h-9 w-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={fetchRecommendations} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700">
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {/* Top pick */}
          <SnackCard
            snack={data.top}
            variant="top"
            state={state}
            onChoose={handleChoose}
            onSave={handleSave}
          />

          {/* Divider */}
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center pt-2">
            Alternatives
          </p>

          {/* Alternatives */}
          {data.alternatives.map((snack) => (
            <SnackCard
              key={snack.id}
              snack={snack}
              variant="alt"
              state={state}
              onChoose={handleChoose}
              onSave={handleSave}
            />
          ))}

          {/* Show another */}
          <button
            onClick={fetchRecommendations}
            className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium transition-all"
          >
            Show different options
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg pointer-events-none z-50 transition-all">
          {toast}
        </div>
      )}

      {/* Chosen confirmation */}
      {chosen !== null && (
        <div className="fixed inset-0 bg-black/20 flex items-end justify-center z-40 pb-10 px-4" onClick={() => setChosen(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-gray-900 mb-1">Great choice!</h3>
            <p className="text-sm text-gray-500 mb-4">Enjoy your snack. Come back and let us know how it went.</p>
            <button onClick={() => { setChosen(null); router.push("/"); }} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
