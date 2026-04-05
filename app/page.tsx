"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { State, Filters } from "@/lib/types";

const STATES: { id: State; label: string; description: string; dot: string }[] = [
  { id: "energized",   label: "Energized",   description: "Steady power for the next few hours", dot: "bg-amber-400"   },
  { id: "focused",     label: "Focused",     description: "Sharp and in the zone",               dot: "bg-blue-400"    },
  { id: "calm",        label: "Calm",        description: "Relaxed and settled",                 dot: "bg-emerald-400" },
  { id: "uplifted",    label: "Uplifted",    description: "A mood boost, no crash",              dot: "bg-violet-400"  },
  { id: "sleep_ready", label: "Sleep-Ready", description: "Wind down naturally",                 dot: "bg-indigo-400"  },
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
    <div className="max-w-lg mx-auto px-5 py-12">
      {/* Two-tone heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          <span className="text-stone-900">How do you</span>
          <br />
          <span className="text-stone-400">want to feel?</span>
        </h1>
        <p className="text-stone-500 text-sm mt-3 leading-relaxed">
          Pick a state. Get a snack you can make in under 5 minutes.
        </p>
      </div>

      {/* State selector */}
      <div className="space-y-2.5 mb-10">
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-all shadow-sm ${
              selected === s.id
                ? "bg-white border-2 border-emerald-500 text-stone-900 shadow-md"
                : "bg-white border border-stone-100 text-stone-900 hover:border-stone-300 hover:shadow"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot} ${selected === s.id ? "opacity-60" : ""}`} />
              <div>
                <div className={`font-semibold text-sm ${selected === s.id ? "text-emerald-600" : "text-stone-900"}`}>
                  {s.label}
                </div>
                <div className={`text-xs mt-0.5 ${selected === s.id ? "text-stone-500" : "text-stone-400"}`}>
                  {s.description}
                </div>
              </div>
            </div>
            {selected === s.id && (
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filters[f.id]
                  ? "bg-white text-emerald-600 border-2 border-emerald-500"
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
        className={`w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all shadow-sm ${
          selected && !loading
            ? "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95 shadow-md"
            : "bg-white text-stone-300 border border-stone-100 cursor-not-allowed"
        }`}
      >
        {loading ? "Finding your snack…" : "Find my snack →"}
      </button>
    </div>
  );
}
