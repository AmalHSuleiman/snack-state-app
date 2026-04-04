import { SNACKS } from "@/data/snacks";
import type { Snack } from "./types";

export function getAllSnacks(): Snack[] {
  return SNACKS;
}

export function getSnackById(id: number): Snack | undefined {
  return SNACKS.find((s) => s.id === id);
}

// Keep analytics as console logs for now (works on Vercel)
export function logEvent(params: {
  event: string;
  state?: string;
  snack_id?: number;
  snack_name?: string;
  hour?: number;
}) {
  console.log("[event]", params);
}
