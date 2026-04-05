"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import type { RecommendationResponse, ScoredSnack, SavedSnack, State } from "@/lib/types";
import SnackCard from "@/components/SnackCard";

const STATE_META: Record<State, { label: string }> = {
  energized:   { label: "Energized"   },
  focused:     { label: "Focused"     },
  calm:        { label: "Calm"        },
  uplifted:    { label: "Uplifted"    },
  sleep_ready: { label: "Sleep-Ready" },
};

function migrateLocalStorage() {
  if (localStorage.getItem("saved_snacks_v2")) return;
  const old = localStorage.getItem("saved_snacks");
  if (!old) return;
  try {
    const oldItems: ScoredSnack[] = JSON.parse(old);
    const migrated: SavedSnack[] = oldItems.map((s) => ({
      id: s.id,
      name: s.name,
      savedState: null,
      savedAt: Date.now(),
    }));
    localStorage.setItem("saved_snacks_v2", JSON.stringify(migrated));
    localStorage.removeItem("saved_snacks");
  } catch {
    // ignore malformed data
  }
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
  const [showAll, setShowAll] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    if (!state) return;
    setData(null);
    setError(null);
    setChosen(null);
    setShowAll(false);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, hour: new Date().getHours(), filters }),
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

  useEffect(() => {
    migrateLocalStorage();
    const raw = localStorage.getItem("saved_snacks_v2");
    if (raw) setSavedIds(JSON.parse(raw).map((s: SavedSnack) => s.id));
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
    const raw = localStorage.getItem("saved_snacks_v2");
    const saved: SavedSnack[] = raw ? JSON.parse(raw) : [];
    if (!saved.find((s) => s.id === snack.id)) {
      saved.push({ id: snack.id, name: snack.name, savedState: state, savedAt: Date.now() });
      localStorage.setItem("saved_snacks_v2", JSON.stringify(saved));
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
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{meta.label}</h1>
          <p className="text-sm text-stone-400">Snacks to help you get there</p>
        </div>
      </div>

      {!data && !error && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 p-5 animate-pulse">
              <div className="h-4 bg-stone-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-stone-100 rounded w-full mb-2" />
              <div className="h-3 bg-stone-100 rounded w-4/5 mb-4" />
              <div className="flex gap-2">
                <div className="h-9 bg-stone-100 rounded-xl flex-1" />
                <div className="h-9 w-10 bg-stone-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={fetchRecommendations} className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50">
            Try again
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <SnackCard
            snack={data.top}
            variant="top"
            state={state}
            onChoose={handleChoose}
            onSave={handleSave}
            detailHref={`/snacks/${data.top.id}?state=${state}`}
          />

          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 text-center pt-2">
            Alternatives
          </p>

          {(showAll ? data.alternatives : data.alternatives.slice(0, 2)).map((snack) => (
            <SnackCard
              key={snack.id}
              snack={snack}
              variant="alt"
              state={state}
              onChoose={handleChoose}
              onSave={handleSave}
              detailHref={`/snacks/${snack.id}?state=${state}`}
            />
          ))}

          {!showAll && data.alternatives.length > 2 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 rounded-xl border border-dashed border-stone-200 text-sm text-stone-400 hover:bg-stone-50 hover:text-stone-700 font-medium transition-all"
            >
              + {data.alternatives.length - 2} more options
            </button>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border-2 border-emerald-500 text-emerald-600 text-sm font-medium px-5 py-2.5 rounded-full shadow-lg pointer-events-none z-50 transition-all">
          {toast}
        </div>
      )}

      {chosen !== null && (
        <div className="fixed inset-0 bg-black/20 flex items-end justify-center z-40 pb-10 px-4" onClick={() => setChosen(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-stone-900 mb-1">Great choice!</h3>
            <p className="text-sm text-stone-500 mb-4">Enjoy your snack. Come back and let us know how it went.</p>
            <button onClick={() => { setChosen(null); router.push("/"); }} className="w-full py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50">
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
