import { SNACKS } from "@/data/snacks";
import type { Snack } from "./types";
import { createClient } from "@supabase/supabase-js";

export function getAllSnacks(): Snack[] {
  return SNACKS;
}

export function getSnackById(id: number): Snack | undefined {
  return SNACKS.find((s) => s.id === id);
}

export async function logEvent(params: {
  event: string;
  state?: string;
  snack_id?: number;
  snack_name?: string;
  hour?: number;
  anon_id?: string;
}) {
  console.log("[event]", params);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // local dev: console log only

  const supabase = createClient(url, key);
  const { error } = await supabase.from("events").insert(params);
  if (error) console.error("[logEvent] Supabase insert failed:", error.message);
}
