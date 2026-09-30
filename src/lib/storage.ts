import type { Scenario } from "./finance";

export interface SavedSimulation {
  id: string;
  name: string;
  monthly_investment: number;
  years: number;
  scenarios: Scenario[];
  expected_corpus: number;
  total_invested: number;
  created_at: string;
}

const KEY = "fs_saved_simulations";
const listeners = new Set<() => void>();

export function listSaved(): SavedSimulation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list: SavedSimulation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}
export function addSaved(sim: Omit<SavedSimulation, "id" | "created_at">): SavedSimulation {
  const item = { ...sim, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  write([item, ...listSaved()]);
  return item;
}
export function removeSaved(id: string) {
  write(listSaved().filter((s) => s.id !== id));
}
export function subscribeSaved(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
