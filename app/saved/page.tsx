"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SavedSnack, ScoredSnack, State } from "@/lib/types";

const STATE_LABELS: Record<State, string> = {
  energized:   "Energized",
  focused:     "Focused",
  calm:        "Calm",
  uplifted:    "Uplifted",
  sleep_ready: "Sleep-Ready",
};

function migrateLocalStorage(): SavedSnack[] {
  const v2 = localStorage.getItem("saved_snacks_v2");
  if (v2) return JSON.parse(v2);

  const old = localStorage.getItem("saved_snacks");
  if (old) {
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
      return migrated;
    } catch {
      return [];
    }
  }
  return [];
}

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedSnack[]>([]);

  useEffect(() => {
    setSaved(migrateLocalStorage());
  }, []);

  function remove(id: number) {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    localStorage.setItem("saved_snacks_v2", JSON.stringify(updated));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Saved snacks</h1>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-sm mb-6">No saved snacks yet.<br />Tap the bookmark icon on any recommendation.</p>
          <button onClick={() => router.push("/")} className="px-5 py-2.5 border-2 border-emerald-500 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all">
            Find a snack
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {saved.map((snack) => {
            const detailHref = snack.savedState
              ? `/snacks/${snack.id}?state=${snack.savedState}`
              : `/snacks/${snack.id}`;
            return (
              <div key={snack.id} className="bg-white rounded-xl border border-stone-100 px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={detailHref} className="font-semibold text-stone-900 text-sm hover:underline block">
                    {snack.name}
                  </Link>
                  {snack.savedState && (
                    <p className="text-xs text-stone-400 mt-0.5">Saved for: {STATE_LABELS[snack.savedState]}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(snack.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
