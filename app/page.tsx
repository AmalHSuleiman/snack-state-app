"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { State, Filters } from "@/lib/types";

const STATES: { id: State; label: string; emoji: string; description: string; color: string; selected: string }[] = [
  {
    id: "energized",
    label: "Energized",
    emoji: "⚡",
    description: "Steady power for the next few hours",
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    selected: "border-amber-400 bg-amber-50 ring-2 ring-amber-300",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    description: "Sharp and in the zone",
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    selected: "border-blue-400 bg-blue-50 ring-2 ring-blue-300",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "🌿",
    description: "Relaxed and settled",
    color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    selected: "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300",
  },
  {
    id: "uplifted",
    label: "Uplifted",
    emoji: "✨",
    description: "A mood boost, no crash",
    color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50",
    selected: "border-violet-400 bg-violet-50 ring-2 ring-violet-300",
  },
  {
    id: "sleep_ready",
    label: "Sleep-Ready",
    emoji: "🌙",
    description: "Wind down naturally",
    color: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
    selected: "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-300",
  },
];

const FILTER_OPTIONS: { id: keyof Filters; label: string }[] = [
  { id: "no_caffeine", label: "No caffeine" },
  { id: "nut_free", label: "Nut-free" },
  { id: "dairy_free", label: "Dairy-free" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<State | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);

  function toggleFilter(id: keyof Filters) {
    setFilters((f) => ({ ...f, [id]: !f[id] }));
  }

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);

    // Fire state_selected event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "state_selected", state: selected, hour: new Date().getHours() }),
    });

    const params = new URLSearchParams({ state: selected });
    if (filters.no_caffeine) params.set("no_caffeine", "1");
    if (filters.nut_free) params.set("nut_free", "1");
    if (filters.dairy_free) params.set("dairy_free", "1");
    if (filters.vegetarian) params.set("vegetarian", "1");
    if (filters.vegan) params.set("vegan", "1");

    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How do you want to feel?</h1>
        <p className="text-gray-500 text-base">Pick a state. Get a snack idea you can make in under 5 minutes.</p>
      </div>

      {/* State selector */}
      <div className="space-y-3 mb-8">
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-white text-left transition-all ${
              selected === s.id ? s.selected : s.color
            }`}
          >
            <span className="text-2xl">{s.emoji}</span>
            <div>
              <div className="font-semibold text-gray-900">{s.label}</div>
              <div className="text-sm text-gray-500">{s.description}</div>
            </div>
            {selected === s.id && (
              <span className="ml-auto text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Dietary filters */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Dietary preferences (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filters[f.id]
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!selected || loading}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          selected && !loading
            ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Finding your snack…" : "Find my snack →"}
      </button>
    </div>
  );
}
