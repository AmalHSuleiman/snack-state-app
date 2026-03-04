"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ScoredSnack } from "@/lib/types";

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<ScoredSnack[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("saved_snacks");
    if (raw) setSaved(JSON.parse(raw));
  }, []);

  function remove(id: number) {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    localStorage.setItem("saved_snacks", JSON.stringify(updated));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Saved snacks</h1>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🔖</div>
          <p className="text-sm">No saved snacks yet.<br />Tap the bookmark icon on any recommendation.</p>
          <button onClick={() => router.push("/")} className="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700">
            Find a snack
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((snack) => (
            <div key={snack.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{snack.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{snack.explanation}</p>
                <p className="text-xs text-gray-400 mt-1">≤ {snack.prep_time_minutes} min · {snack.ingredients.join(", ")}</p>
              </div>
              <button
                onClick={() => remove(snack.id)}
                className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 flex-shrink-0"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
