import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Home, Car, Heart, Palmtree } from "lucide-react";
import { AmountSlider } from "@/components/finance/AmountSlider";
import { DEFAULT_SCENARIOS, formatCompact, formatINR, pct, requiredMonthly, SCENARIO_COLOR } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goal Planner — Finance Simulator" },
      { name: "description", content: "Find the monthly investment needed for education, a house, vehicle, wedding or retirement." },
      { property: "og:title", content: "Goal Planner — Finance Simulator" },
      { property: "og:description", content: "How much should you invest monthly to reach your goal?" },
    ],
  }),
  component: GoalsPage,
});

const GOALS = [
  { key: "education", label: "Education", icon: GraduationCap, target: 2500000, years: 12 },
  { key: "house", label: "House", icon: Home, target: 3000000, years: 10 },
  { key: "vehicle", label: "Vehicle", icon: Car, target: 1000000, years: 4 },
  { key: "wedding", label: "Wedding", icon: Heart, target: 1500000, years: 6 },
  { key: "retirement", label: "Retirement", icon: Palmtree, target: 50000000, years: 30 },
];

function GoalsPage() {
  const [goal, setGoal] = useState(GOALS[0]!.key);
  const [target, setTarget] = useState(GOALS[0]!.target);
  const [years, setYears] = useState(GOALS[0]!.years);
  const [inflation, setInflation] = useState(6);
  const adjusted = target * Math.pow(1 + inflation / 100, years);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Goal planner</h1>
      <p className="mt-1 text-muted-foreground">Pick a goal. We'll work out what to invest every month.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {GOALS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setGoal(g.key); setTarget(g.target); setYears(g.years); }}
            className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors", goal === g.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50")}
          >
            <g.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{g.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-8 rounded-2xl border bg-card p-6">
          <AmountSlider label="Target amount (today's value)" value={target} onChange={setTarget} min={100000} max={100000000} step={50000} prefix="₹" display={formatCompact}
            quick={[5e5, 1e6, 2.5e6, 5e6, 1e7, 5e7].map((v) => ({ label: formatCompact(v), value: v }))} />
          <AmountSlider label="Years until goal" value={years} onChange={setYears} min={1} max={40} step={1} suffix="yrs" display={(v) => `${v} yrs`}
            quick={[3, 5, 10, 15, 20, 30].map((v) => ({ label: `${v} yrs`, value: v }))} />
          <AmountSlider label="Expected inflation" value={inflation} onChange={setInflation} min={0} max={12} step={0.5} suffix="%" display={(v) => `${v}%`}
            quick={[0, 4, 6, 8].map((v) => ({ label: `${v}%`, value: v }))} />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <p className="text-sm opacity-80">Your goal in future rupees ({inflation}% inflation)</p>
            <p className="num mt-1 text-4xl font-semibold text-accent">{formatCompact(adjusted)}</p>
            <p className="num text-sm opacity-70">{formatINR(adjusted)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {DEFAULT_SCENARIOS.map((s) => {
              const m = requiredMonthly(adjusted, years, s.rate);
              return (
                <div key={s.key} className={cn("rounded-2xl border bg-card p-5", s.key === "expected" && "ring-2 ring-primary")}>
                  <div className="flex items-center gap-2 text-sm font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SCENARIO_COLOR[s.key] }} />{s.label} · {pct(s.rate, 0)}</div>
                  <p className="mt-3 text-xs text-muted-foreground">Invest every month</p>
                  <p className="num text-3xl font-semibold">{formatCompact(m)}</p>
                  <p className="num mt-2 text-xs text-muted-foreground">Total invested {formatCompact(m * years * 12)}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">Illustrative only. Actual returns vary; review your plan every year.</p>
        </div>
      </div>
    </div>
  );
}
