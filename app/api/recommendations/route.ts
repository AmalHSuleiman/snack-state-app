import { NextRequest, NextResponse } from "next/server";
import { getAllSnacks, logEvent } from "@/lib/db";
import { getRecommendations } from "@/lib/scoring";
import type { RecommendationRequest, State } from "@/lib/types";

export const runtime = "nodejs";

const VALID_STATES: State[] = ["energized", "focused", "calm", "uplifted", "sleep_ready"];

export async function GET() {
  try {
    const snacks = getAllSnacks();
    return NextResponse.json({
      ok: true,
      count: snacks.length,
      first: snacks[0]?.name ?? null,
      valid_states: VALID_STATES,
    });
  } catch (err) {
    console.error("[recommendations][GET]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RecommendationRequest = await req.json();
    const rawState = body.state as unknown as string;

    const state = (rawState ?? "").replace("-", "_") as State;
    const hour = body.hour;
    const filters = body.filters ?? {};

    if (!VALID_STATES.includes(state)) {
      return NextResponse.json(
        { error: "Invalid state", received: rawState, normalized: state, valid: VALID_STATES },
        { status: 400 }
      );
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

    logEvent({ event: "recommendation_shown", state, hour: resolvedHour });

    return NextResponse.json({ ...result, state, hour: resolvedHour });
  } catch (err) {
    console.error("[recommendations][POST]", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
