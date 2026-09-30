import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { formatCompact, futureValue, pct } from "@/lib/finance";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Plans — Finance Simulator" },
      { name: "description", content: "Compare two investment plans side by side: monthly amount, duration and return rate." },
      { property: "og:title", content: "Plan A vs Plan B — Finance Simulator" },
      { property: "og:description", content: "Side-by-side comparison of two SIP plans in ₹." },
    ],
  }),
  component: ComparePage,
});

interface Plan { monthly: number; years: number; rate: number }

function PlanEditor({ name, plan, set, color }: { name: string; plan: Plan; set: (p: Plan) => void; color: string }) {
  const corpus = futureValue(plan.monthly, plan.years, plan.rate);
  const invested = plan.monthly * plan.years * 12;
  const rows = [
    { k: "monthly", label: "Monthly", min: 500, max: 100000, step: 500, fmt: formatCompact(plan.monthly), v: plan.monthly },
    { k: "years", label: "Years", min: 1, max: 40, step: 1, fmt: `${plan.years} yrs`, v: plan.years },
    { k: "rate", label: "Return", min: 1, max: 20, step: 0.5, fmt: pct(plan.rate), v: plan.rate * 100 },
  ] as const;
  return (
    <div className="rounded-2xl border bg-card p-6" style={{ borderTop: `4px solid ${color}` }}>
      <h2 className="text-2xl">{name}</h2>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.k} className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{r.label}</span><span className="num font-medium">{r.fmt}</span></div>
            <Slider value={[r.v]} min={r.min} max={r.max} step={r.step} onValueChange={([v]) => set({ ...plan, [r.k]: r.k === "rate" ? (v ?? 0) / 100 : (v ?? 0) })} />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 border-t pt-4 text-center">
        <div><div className="text-xs text-muted-foreground">Invested</div><div className="num font-semibold">{formatCompact(invested)}</div></div>
        <div><div className="text-xs text-muted-foreground">Corpus</div><div className="num text-lg font-semibold">{formatCompact(corpus)}</div></div>
        <div><div className="text-xs text-muted-foreground">Gained</div><div className="num font-semibold text-chart-3">{formatCompact(corpus - invested)}</div></div>
      </div>
    </div>
  );
}

function ComparePage() {
  const [a, setA] = useState<Plan>({ monthly: 5000, years: 20, rate: 0.1 });
  const [b, setB] = useState<Plan>({ monthly: 10000, years: 10, rate: 0.1 });
  const data = useMemo(() => {
    const n = Math.max(a.years, b.years);
    return Array.from({ length: n + 1 }, (_, y) => ({
      year: y,
      A: y <= a.years ? futureValue(a.monthly, y, a.rate) : null,
      B: y <= b.years ? futureValue(b.monthly, y, b.rate) : null,
    }));
  }, [a, b]);
  const ca = futureValue(a.monthly, a.years, a.rate);
  const cb = futureValue(b.monthly, b.years, b.rate);
  const winner = ca === cb ? null : ca > cb ? "A" : "B";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Plan A vs Plan B</h1>
      <p className="mt-1 text-muted-foreground">Is it better to invest less for longer, or more for shorter?</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <PlanEditor name="Plan A" plan={a} set={setA} color="var(--chart-3)" />
        <PlanEditor name="Plan B" plan={b} set={setB} color="var(--chart-2)" />
      </div>
      <div className="mt-6 rounded-2xl bg-primary p-6 text-primary-foreground">
        <p className="text-sm opacity-80">Verdict</p>
        <p className="mt-1 font-display text-2xl">
          {winner ? <>Plan {winner} ends with <span className="num text-accent">{formatCompact(Math.abs(ca - cb))}</span> more.</> : "Both plans end with the same corpus."}
        </p>
        <p className="mt-1 text-sm opacity-80">
          Plan A invests {formatCompact(a.monthly * a.years * 12)} · Plan B invests {formatCompact(b.monthly * b.years * 12)}
        </p>
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickFormatter={(y) => `Y${y}`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(v: number) => formatCompact(v)} labelFormatter={(y) => `Year ${y}`} />
            <Legend />
            <Line dataKey="A" name="Plan A" stroke="var(--chart-3)" strokeWidth={3} dot={false} connectNulls={false} />
            <Line dataKey="B" name="Plan B" stroke="var(--chart-2)" strokeWidth={3} dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
