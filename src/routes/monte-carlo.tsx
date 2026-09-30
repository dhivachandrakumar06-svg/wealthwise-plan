import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AmountSlider, MONTHLY_QUICK, YEARS_QUICK } from "@/components/finance/AmountSlider";
import { formatCompact, monteCarlo, pct } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/monte-carlo")({
  head: () => ({
    meta: [
      { title: "Monte Carlo Simulator — Finance Simulator" },
      { name: "description", content: "Simulate 5,000 possible market paths and see your probability of reaching a target corpus." },
      { property: "og:title", content: "Monte Carlo Simulator — Finance Simulator" },
      { property: "og:description", content: "Percentile outcomes and goal reach probability for your SIP." },
    ],
  }),
  component: MonteCarloPage,
});

const RISK = [
  { key: "low", label: "Low risk", mean: 0.07, vol: 0.06 },
  { key: "medium", label: "Balanced", mean: 0.1, vol: 0.14 },
  { key: "high", label: "High risk", mean: 0.13, vol: 0.22 },
];

function MonteCarloPage() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(15);
  const [target, setTarget] = useState(5000000);
  const [risk, setRisk] = useState(RISK[1]);
  const input = useDeferredValue({ monthly, years, target, risk });
  const r = useMemo(
    () => monteCarlo({ monthly: input.monthly, years: input.years, target: input.target, meanReturn: input.risk.mean, volatility: input.risk.vol, sims: 5000 }),
    [input],
  );
  const prob = r.probability;
  const tone = prob >= 0.75 ? "var(--chart-3)" : prob >= 0.5 ? "var(--chart-4)" : "var(--destructive)";
  const fan = r.fan.map((f) => ({ ...f, band: [f.p10, f.p90], inner: [f.p25, f.p75] }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Monte Carlo</h1>
      <p className="mt-1 text-muted-foreground">5,000 random market paths. Not one answer — a range of them.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-8 rounded-2xl border bg-card p-6">
          <AmountSlider label="Monthly investment" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} prefix="₹" quick={MONTHLY_QUICK} display={formatCompact} />
          <AmountSlider label="Duration" value={years} onChange={setYears} min={1} max={40} step={1} suffix="yrs" quick={YEARS_QUICK} display={(v) => `${v} yrs`} />
          <AmountSlider label="Target corpus" value={target} onChange={setTarget} min={100000} max={100000000} step={100000} prefix="₹" display={formatCompact}
            quick={[1e6, 2.5e6, 5e6, 1e7, 5e7].map((v) => ({ label: formatCompact(v), value: v }))} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Risk level</p>
            <div className="grid grid-cols-3 gap-2">
              {RISK.map((x) => (
                <button key={x.key} onClick={() => setRisk(x)} className={cn("rounded-lg border p-2 text-xs", risk.key === x.key ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
                  <div className="font-medium">{x.label}</div>
                  <div className="num opacity-75">{pct(x.mean, 0)} ± {pct(x.vol, 0)}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-6">
              <svg viewBox="0 0 120 70" className="w-full max-w-[220px]">
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="var(--muted)" strokeWidth="12" strokeLinecap="round" />
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={tone} strokeWidth="12" strokeLinecap="round" pathLength={100} strokeDasharray={`${prob * 100} 100`} style={{ transition: "stroke-dasharray .6s" }} />
              </svg>
              <p className="num -mt-6 text-4xl font-semibold">{pct(prob, 0)}</p>
              <p className="mt-1 text-center text-sm text-muted-foreground">chance of reaching {formatCompact(target)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: "Bad case (10th)", v: r.p10 },
                { l: "Median (50th)", v: r.p50 },
                { l: "Good case (90th)", v: r.p90 },
                { l: "Total invested", v: r.totalInvested },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{x.l}</p>
                  <p className="num mt-2 text-xl font-semibold">{formatCompact(x.v)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-xl">Fan chart</h2>
            <p className="text-xs text-muted-foreground">Dark band: 25th–75th percentile · light band: 10th–90th</p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={fan}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickFormatter={(y) => `Y${y}`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} labelFormatter={(y) => `Year ${y}`}
                  formatter={(v: number | number[], n) => [Array.isArray(v) ? `${formatCompact(v[0])} – ${formatCompact(v[1])}` : formatCompact(v), n]} />
                <Area dataKey="band" name="10–90th" stroke="none" fill="var(--chart-3)" fillOpacity={0.15} />
                <Area dataKey="inner" name="25–75th" stroke="none" fill="var(--chart-3)" fillOpacity={0.3} />
                <Line dataKey="p50" name="Median" stroke="var(--chart-3)" strokeWidth={3} dot={false} />
                <Line dataKey="invested" name="Invested" stroke="var(--chart-1)" strokeDasharray="5 4" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-xl">Distribution of final corpus</h2>
            <p className="text-xs text-muted-foreground">Green bars reach your target</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={r.histogram}>
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(v: number) => [`${v} paths`, "Count"]} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {r.histogram.map((h, i) => <Cell key={i} fill={h.hit ? "var(--chart-3)" : "var(--chart-1)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
