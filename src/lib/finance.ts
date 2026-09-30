export type ScenarioKey = "cautious" | "expected" | "optimistic";
export interface Scenario {
  key: ScenarioKey;
  label: string;
  rate: number; // annual, e.g. 0.10
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  { key: "cautious", label: "Cautious", rate: 0.06 },
  { key: "expected", label: "Expected", rate: 0.1 },
  { key: "optimistic", label: "Optimistic", rate: 0.14 },
];

export const SCENARIO_COLOR: Record<ScenarioKey | "invested", string> = {
  invested: "var(--chart-1)",
  cautious: "var(--chart-2)",
  expected: "var(--chart-3)",
  optimistic: "var(--chart-4)",
};

export interface ScenarioResult extends Scenario {
  total_invested: number;
  final_corpus: number;
  wealth_gained: number;
  growth_ratio: number;
}
export interface SeriesPoint {
  year: number;
  invested: number;
  cautious: number;
  expected: number;
  optimistic: number;
}
export interface CalculationResult {
  monthly_investment: number;
  years: number;
  total_invested: number;
  scenarios: ScenarioResult[];
  series: SeriesPoint[];
  source: "standalone" | "flask";
}

/** Future value of a monthly SIP (contribution at start of each month, monthly compounding). */
export function futureValue(monthly: number, years: number, annualRate: number): number {
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export function requiredMonthly(target: number, years: number, annualRate: number): number {
  const unit = futureValue(1, years, annualRate);
  return unit > 0 ? target / unit : 0;
}

export function calculateLocal(
  monthly: number,
  years: number,
  scenarios: Scenario[] = DEFAULT_SCENARIOS,
): CalculationResult {
  const total = monthly * years * 12;
  const results = scenarios.map((s) => {
    const fv = futureValue(monthly, years, s.rate);
    return {
      ...s,
      total_invested: total,
      final_corpus: fv,
      wealth_gained: fv - total,
      growth_ratio: total ? fv / total : 0,
    };
  });
  const rate = (k: ScenarioKey) => scenarios.find((s) => s.key === k)?.rate ?? 0;
  const series: SeriesPoint[] = [];
  for (let y = 0; y <= years; y++) {
    series.push({
      year: y,
      invested: monthly * 12 * y,
      cautious: futureValue(monthly, y, rate("cautious")),
      expected: futureValue(monthly, y, rate("expected")),
      optimistic: futureValue(monthly, y, rate("optimistic")),
    });
  }
  return { monthly_investment: monthly, years, total_invested: total, scenarios: results, series, source: "standalone" };
}

// ---------- Formatting (Indian system) ----------
export function formatINR(n: number, digits = 0): string {
  return (n < 0 ? "-₹" : "₹") + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}
export function formatCompact(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(a >= 1e9 ? 0 : 2)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(2)} L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(a >= 1e4 ? 0 : 1)}K`;
  return `${sign}₹${Math.round(a)}`;
}
export const pct = (r: number, d = 1) => `${(r * 100).toFixed(d)}%`;

// ---------- Monte Carlo ----------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface MonteCarloResult {
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  probability: number;
  totalInvested: number;
  fan: { year: number; p10: number; p25: number; p50: number; p75: number; p90: number; invested: number }[];
  histogram: { bucket: string; from: number; count: number; hit: boolean }[];
}

export function monteCarlo(opts: {
  monthly: number;
  years: number;
  meanReturn: number;
  volatility: number;
  target: number;
  sims?: number;
  seed?: number;
}): MonteCarloResult {
  const { monthly, years, meanReturn, volatility, target, sims = 5000, seed = 42 } = opts;
  const rand = mulberry32(seed);
  const gauss = () => {
    let u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  // lognormal monthly returns
  const mu = Math.log(1 + meanReturn) / 12 - (volatility * volatility) / 24;
  const sd = volatility / Math.sqrt(12);
  const yearly: Float64Array[] = Array.from({ length: years + 1 }, () => new Float64Array(sims));
  const finals = new Float64Array(sims);
  for (let s = 0; s < sims; s++) {
    let v = 0;
    for (let m = 1; m <= years * 12; m++) {
      v = (v + monthly) * Math.exp(mu + sd * gauss());
      if (m % 12 === 0) yearly[m / 12][s] = v;
    }
    finals[s] = v;
  }
  const q = (arr: Float64Array, p: number) => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
  const fan = yearly.map((arr, y) => {
    const sorted = Float64Array.from(arr).sort();
    return { year: y, p10: q(sorted, 0.1), p25: q(sorted, 0.25), p50: q(sorted, 0.5), p75: q(sorted, 0.75), p90: q(sorted, 0.9), invested: monthly * 12 * y };
  });
  const sorted = Float64Array.from(finals).sort();
  let hits = 0, sum = 0;
  for (const f of finals) { if (f >= target) hits++; sum += f; }
  const lo = q(sorted, 0.01), hi = q(sorted, 0.99);
  const bins = 28, w = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const f of finals) { const i = Math.floor((f - lo) / w); if (i >= 0 && i < bins) counts[i]++; }
  return {
    p10: q(sorted, 0.1), p50: q(sorted, 0.5), p90: q(sorted, 0.9),
    mean: sum / sims, probability: hits / sims, totalInvested: monthly * 12 * years, fan,
    histogram: counts.map((c, i) => ({ bucket: formatCompact(lo + i * w), from: lo + i * w, count: c, hit: lo + (i + 1) * w >= target })),
  };
}
