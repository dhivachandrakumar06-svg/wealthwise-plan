/**
 * API client layer.
 *
 * Two modes:
 *  - "standalone": all calculations run in the browser (no server needed).
 *  - "flask":      calls your Python Flask backend (see /backend/app.py).
 *
 * Change DEFAULT_FLASK_URL or set it in the app header's "Python & SQL" drawer.
 * All responses share the same shape, so the UI works identically in both modes.
 */
import { calculateLocal, DEFAULT_SCENARIOS, type CalculationResult, type Scenario } from "@/lib/finance";
import { addSaved, listSaved, type SavedSimulation } from "@/lib/storage";

export type ApiMode = "standalone" | "flask";
export const DEFAULT_FLASK_URL = "http://localhost:5000/api";

const MODE_KEY = "fs_api_mode";
const URL_KEY = "fs_api_url";
const listeners = new Set<() => void>();

export const apiConfig = {
  getMode(): ApiMode {
    if (typeof window === "undefined") return "standalone";
    return (localStorage.getItem(MODE_KEY) as ApiMode) || "standalone";
  },
  getUrl(): string {
    if (typeof window === "undefined") return DEFAULT_FLASK_URL;
    return localStorage.getItem(URL_KEY) || DEFAULT_FLASK_URL;
  },
  set(mode: ApiMode, url?: string) {
    localStorage.setItem(MODE_KEY, mode);
    if (url) localStorage.setItem(URL_KEY, url.replace(/\/$/, ""));
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiConfig.getUrl()}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Flask API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export interface CalculateInput {
  monthly_investment: number;
  years: number;
  scenarios?: Scenario[];
}

/** POST /api/calculate */
export async function calculate(input: CalculateInput): Promise<CalculationResult> {
  const scenarios = input.scenarios ?? DEFAULT_SCENARIOS;
  if (apiConfig.getMode() === "flask") {
    const data = await request<Omit<CalculationResult, "source">>("/calculate", {
      method: "POST",
      body: JSON.stringify({ ...input, scenarios }),
    });
    return { ...data, source: "flask" };
  }
  return calculateLocal(input.monthly_investment, input.years, scenarios);
}

/** GET /api/scenarios */
export async function getScenarios(): Promise<Scenario[]> {
  if (apiConfig.getMode() === "flask") return request<Scenario[]>("/scenarios");
  return DEFAULT_SCENARIOS;
}

/** POST /api/simulations — also always cached locally so the dashboard works offline. */
export async function saveSimulation(sim: Omit<SavedSimulation, "id" | "created_at">): Promise<SavedSimulation> {
  const local = addSaved(sim);
  if (apiConfig.getMode() === "flask") {
    await request("/simulations", { method: "POST", body: JSON.stringify(sim) });
  }
  return local;
}

/** GET /api/simulations */
export async function getSimulations(): Promise<SavedSimulation[]> {
  if (apiConfig.getMode() === "flask") {
    try {
      return await request<SavedSimulation[]>("/simulations");
    } catch {
      return listSaved();
    }
  }
  return listSaved();
}

/** GET /api/health — used by the connection test button. */
export async function pingFlask(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
