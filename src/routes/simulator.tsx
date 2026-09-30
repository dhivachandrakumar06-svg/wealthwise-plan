import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown, Clock, Save, AlertTriangle, RotateCcw } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AmountSlider, MONTHLY_QUICK, YEARS_QUICK } from "@/components/finance/AmountSlider";
import { GrowthChart } from "@/components/finance/GrowthChart";
import { useApiMode } from "@/components/finance/IntegrationDrawer";
import { calculate, saveSimulation } from "@/services/api";
import { calculateLocal, DEFAULT_SCENARIOS, formatCompact, formatINR, futureValue, pct, SCENARIO_COLOR, type Scenario } from "@/lib/finance";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "SIP Simulator — Finance Simulator" },
      { name: "description", content: "Interactive SIP simulator: monthly investment, duration, three return scenarios, growth chart, milestones and cost of delay." },
      { property: "og:title", content: "SIP Simulator — Finance Simulator" },
      { property: "og:description", content: "See cautious, expected and optimistic growth of your monthly investment in ₹." },
    ],
  }),
  component: SimulatorPage,
});

function SimulatorPage() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const mode = useApiMode();

  const q = useQuery({
    queryKey: ["calculate", mode, monthly, years, scenarios],
    queryFn: () => calculate({ monthly_investment: monthly, years, scenarios }),
    placeholderData: keepPreviousData,
    retry: false,
  });
  const result = q.data ?? calculateLocal(monthly, years, scenarios);

  const onSave = async () => {
    try {
      await saveSimulation({
        name: `${formatCompact(monthly)}/mo · ${years} yrs`,
        monthly_investment: monthly,
        years,
        scenarios,
        expected_corpus: result.scenarios[1].final_corpus,
        total_invested: result.total_invested,
      });
      toast.success("Simulation saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Simulator</h1>
          <p className="mt-1 text-muted-foreground">Two inputs. Three possible futures.</p>
        </div>
        <Button onClick={onSave} className="gap-2"><Save className="h-4 w-4" /> Save simulation</Button>
      </div>

      {q.isError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> Couldn't reach the Flask backend — showing browser calculations instead.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-6">
          <div className="space-y-8 rounded-2xl border bg-card p-6">
            <AmountSlider label="How much can you invest every month?" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} prefix="₹" quick={MONTHLY_QUICK} display={formatCompact} />
            <AmountSlider label="How long will you invest?" value={years} onChange={setYears} min={1} max={40} step={1} suffix="yrs" quick={YEARS_QUICK} display={(v) => `${v} yrs`} />
          </div>
          <Assumptions scenarios={scenarios} setScenarios={setScenarios} />
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {result.scenarios.map((s) => (
              <div key={s.key} className={`rounded-2xl border bg-card p-5 ${s.key === "expected" ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: SCENARIO_COLOR[s.key] }} />
                    {s.label}
                  </span>
                  <span className="num rounded bg-muted px-1.5 py-0.5 text-xs">{pct(s.rate)}</span>
                </div>
                <p className="num mt-3 text-3xl font-semibold">{formatCompact(s.final_corpus)}</p>
                <p className="num text-xs text-muted-foreground">{formatINR(s.final_corpus)}</p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Total invested</dt><dd className="num">{formatCompact(s.total_invested)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Wealth gained</dt><dd className="num font-medium text-chart-3">+{formatCompact(s.wealth_gained)}</dd></div>
                </dl>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl">Growth over time</h2>
              <span className="text-xs text-muted-foreground">{result.source === "flask" ? "via Flask" : "calculated in browser"}</span>
            </div>
            <GrowthChart data={result.series} />
          </div>

          <Breakdown monthly={monthly} years={years} scenarios={scenarios} expected={result.scenarios[1]} series={result.series} />
          <WaitToggle monthly={monthly} years={years} rate={scenarios[1].rate} />
        </div>
      </div>
    </div>
  );
}

function Assumptions({ scenarios, setScenarios }: { scenarios: Scenario[]; setScenarios: (s: Scenario[]) => void }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg">Scenario assumptions</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {scenarios.map((s) => (
          <div key={s.key} className="rounded-lg bg-muted/60 p-2 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="num font-semibold">{pct(s.rate)}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Illustrative annual returns, not guaranteed. Real markets go up and down.</p>
      <Collapsible className="mt-4">
        <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-medium">
          Advanced settings <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-5 pt-4">
          {scenarios.map((s, i) => (
            <div key={s.key} className="space-y-2">
              <div className="flex justify-between text-sm"><span>{s.label}</span><span className="num">{pct(s.rate)}</span></div>
              <Slider value={[s.rate * 100]} min={1} max={25} step={0.5} onValueChange={([v]) => setScenarios(scenarios.map((x, j) => (j === i ? { ...x, rate: v / 100 } : x)))} />
            </div>
          ))}
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setScenarios(DEFAULT_SCENARIOS)}><RotateCcw className="h-3.5 w-3.5" /> Reset to 6 / 10 / 14%</Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function Breakdown({ monthly, years, scenarios, expected, series }: { monthly: number; years: number; scenarios: Scenario[]; expected: { final_corpus: number; total_invested: number; wealth_gained: number; growth_ratio: number }; series: { year: number; expected: number }[] }) {
  const pie = [
    { name: "Principal", value: expected.total_invested, color: "var(--chart-1)" },
    { name: "Growth", value: Math.max(0, expected.wealth_gained), color: "var(--chart-3)" },
  ];
  const growthShare = expected.final_corpus ? expected.wealth_gained / expected.final_corpus : 0;
  const milestones = [1e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 5e7].map((m) => ({
    m,
    year: series.find((p) => p.expected >= m)?.year,
  }));
  const rate = scenarios[1].rate;
  const extraYearCorpus = futureValue(monthly, years + 1, rate) - expected.final_corpus;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl">Principal vs growth</h2>
        <p className="text-xs text-muted-foreground">Expected scenario</p>
        <div className="flex items-center gap-4">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <dl className="flex-1 space-y-2 text-sm">
            {pie.map((p) => (
              <div key={p.name} className="flex justify-between"><dt className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name}</dt><dd className="num">{formatCompact(p.value)}</dd></div>
            ))}
            <div className="flex justify-between border-t pt-2"><dt className="text-muted-foreground">Growth ratio</dt><dd className="num font-semibold">{expected.growth_ratio.toFixed(2)}×</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Growth share</dt><dd className="num">{pct(growthShare)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">One more year adds</dt><dd className="num text-chart-3">+{formatCompact(extraYearCorpus)}</dd></div>
          </dl>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl">Milestones</h2>
        <p className="text-xs text-muted-foreground">When the expected corpus crosses each mark</p>
        <ul className="mt-3 space-y-2">
          {milestones.map(({ m, year }) => (
            <li key={m} className="flex items-center gap-3 text-sm">
              <span className="num w-20 font-medium">{formatCompact(m)}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-chart-3" style={{ width: year !== undefined ? `${Math.max(4, (year / years) * 100)}%` : "0%" }} />
              </div>
              <span className="num w-16 text-right text-muted-foreground">{year !== undefined ? `Year ${year}` : "—"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WaitToggle({ monthly, years, rate }: { monthly: number; years: number; rate: number }) {
  const [wait, setWait] = useState(false);
  const { now, later, cost, extraNeeded } = useMemo(() => {
    const now = futureValue(monthly, years, rate);
    const laterYears = Math.max(0, years - 5);
    const later = futureValue(monthly, laterYears, rate);
    const unit = futureValue(1, laterYears, rate);
    return { now, later, cost: now - later, extraNeeded: unit ? now / unit - monthly : Infinity };
  }, [monthly, years, rate]);
  const max = now || 1;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-chart-2" />
          <div>
            <h2 className="text-xl">What if I wait 5 years?</h2>
            <p className="text-xs text-muted-foreground">Same monthly amount, same end date — but starting 5 years later.</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">Show cost of delay <Switch checked={wait} onCheckedChange={setWait} /></label>
      </div>
      <div className="mt-5 space-y-3">
        <Bar label="Start today" value={now} max={max} color="var(--chart-3)" />
        <div className={`transition-all duration-500 ${wait ? "opacity-100" : "pointer-events-none h-0 overflow-hidden opacity-0"}`}>
          <Bar label="Start in 5 years" value={later} max={max} color="var(--chart-2)" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-destructive/10 p-3">
              <div className="text-xs text-muted-foreground">Cost of waiting</div>
              <div className="num text-2xl font-semibold text-destructive">−{formatCompact(cost)}</div>
              <div className="text-xs text-muted-foreground">{pct(now ? cost / now : 0, 0)} of your potential corpus</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs text-muted-foreground">To catch up you'd need</div>
              <div className="num text-2xl font-semibold">{Number.isFinite(extraNeeded) ? `+${formatCompact(extraNeeded)}/mo` : "Not possible"}</div>
              <div className="text-xs text-muted-foreground">{years <= 5 ? "Your duration is 5 years or less" : "extra every month"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="num font-medium">{formatCompact(value)}</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}
