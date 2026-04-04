"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { State, Filters } from "@/lib/types";

const STATES: { id: State; label: string; emoji: string; description: string }[] = [
  { id: "energized",   label: "Energized",   emoji: "⚡", description: "Steady power for the next few hours" },
  { id: "focused",     label: "Focused",     emoji: "◎", description: "Sharp and in the zone" },
  { id: "calm",        label: "Calm",        emoji: "○", description: "Relaxed and settled" },
  { id: "uplifted",    label: "Uplifted",    emoji: "↑", description: "A mood boost, no crash" },
  { id: "sleep_ready", label: "Sleep-Ready", emoji: "◗", description: "Wind down naturally" },
];

const FILTER_OPTIONS: { id: keyof Filters; label: string }[] = [
  { id: "no_caffeine", label: "No caffeine" },
  { id: "nut_free",    label: "Nut-free" },
  { id: "dairy_free",  label: "Dairy-free" },
  { id: "vegetarian",  label: "Vegetarian" },
  { id: "vegan",       label: "Vegan" },
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
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-3">
          How do you want to feel?
        </h1>
        <p className="text-stone-500 text-base leading-relaxed">
          Pick a state. Get a snack you can make in under 5 minutes.
        </p>
      </div>

      {/* State selector */}
      <div className="space-y-2 mb-10">
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all ${
              selected === s.id
                ? "bg-stone-900 border-stone-900 text-white"
                : "bg-white border-stone-200 hover:border-stone-400 text-stone-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-sm font-mono ${selected === s.id ? "text-stone-300" : "text-stone-400"}`}>
                {s.emoji}
              </span>
              <div>
                <div className={`font-semibold text-sm tracking-wide ${selected === s.id ? "text-white" : "text-stone-900"}`}>
                  {s.label}
                </div>
                <div className={`text-sm mt-0.5 ${selected === s.id ? "text-stone-400" : "text-stone-500"}`}>
                  {s.description}
                </div>
              </div>
            </div>
            {selected === s.id && (
              <svg className="w-4 h-4 text-stone-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Dietary filters */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
          Dietary preferences
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                filters[f.id]
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
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
        className={`w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all ${
          selected && !loading
            ? "bg-stone-900 text-white hover:bg-stone-700 active:scale-95"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Finding your snack…" : "Find my snack →"}
      </button>
    </div>
  );
}
