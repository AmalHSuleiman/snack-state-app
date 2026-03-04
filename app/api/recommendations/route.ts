import { NextRequest, NextResponse } from "next/server";
import { getAllSnacks, logEvent } from "@/lib/db";
import { getRecommendations } from "@/lib/scoring";
import type { RecommendationRequest, State } from "@/lib/types";

const VALID_STATES: State[] = ["energized", "focused", "calm", "uplifted", "sleep_ready"];

export async function POST(req: NextRequest) {
  try {
    const body: RecommendationRequest = await req.json();
    const { state, hour, filters = {} } = body;

    if (!VALID_STATES.includes(state)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const resolvedHour = hour ?? new Date().getHours();
    const snacks = getAllSnacks();
    const result = getRecommendations(snacks, state, resolvedHour, filters);

    if (!result) {
      return NextResponse.json(
        { error: "Not enough snacks match your filters. Try relaxing some options." },
        { status: 404 }
      );
    }

    // Log analytics event
    logEvent({ event: "recommendation_shown", state, hour: resolvedHour });

    return NextResponse.json({ ...result, state, hour: resolvedHour });
  } catch (err) {
    console.error("[recommendations]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
