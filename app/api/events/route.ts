import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/db";
import type { AnalyticsEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: AnalyticsEvent = await req.json();
    const { event, state, snack_id, snack_name, hour, anon_id } = body;

    await logEvent({ event, state, snack_id, snack_name, hour, anon_id });

    // Console trace for MVP observability
    console.log(`[event] ${event}`, { state, snack_id, snack_name, hour, anon_id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
