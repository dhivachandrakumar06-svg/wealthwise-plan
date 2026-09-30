import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarRange, Coins, Sparkles, Target, GitCompare, Dice5 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthChart } from "@/components/finance/GrowthChart";
import { calculateLocal, formatCompact } from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finance Simulator — Plan your money, see the possibilities" },
      { name: "description", content: "See how your monthly SIP could grow under cautious, expected and optimistic return assumptions. Free educational simulator in ₹." },
      { property: "og:title", content: "Finance Simulator — Plan your money" },
      { property: "og:description", content: "Cautious, expected and optimistic growth of your monthly savings, in Lakhs and Crores." },
    ],
  }),
  component: Home,
});

const preview = calculateLocal(5000, 15);

function Home() {
  const exp = preview.scenarios[1]!;
  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> SIP · Goals · Monte Carlo
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] md:text-6xl">
            Plan your money.
            <br />
            <span className="italic text-chart-3">See the possibilities.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            See how your monthly savings could grow under cautious, expected, and optimistic return assumptions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/simulator">Start Simulation <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/goals">Plan a goal</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">₹5,000/month · 15 years · 10%</p>
              <p className="num mt-1 text-4xl font-semibold">{formatCompact(exp.final_corpus)}</p>
            </div>
            <p className="num text-sm text-muted-foreground">invested {formatCompact(exp.total_invested)}</p>
          </div>
          <GrowthChart data={preview.series} height={260} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Coins, t: "Enter what you can invest", d: "From ₹500 to ₹1,00,000 every month." },
            { icon: CalendarRange, t: "Choose how long you invest", d: "Anywhere from 1 to 40 years." },
            { icon: Sparkles, t: "See three possible outcomes", d: "Cautious 6%, Expected 10%, Optimistic 14%." },
          ].map((c, i) => (
            <div key={c.t} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <c.icon className="h-6 w-6 text-chart-3" />
                <span className="num text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { to: "/goals" as const, icon: Target, t: "Goal-based planner", d: "Education, house, wedding, retirement — find the monthly amount you need." },
            { to: "/compare" as const, icon: GitCompare, t: "Plan A vs Plan B", d: "Put two plans side by side and see the difference." },
            { to: "/monte-carlo" as const, icon: Dice5, t: "Monte Carlo", d: "5,000 possible futures and your chance of reaching a target." },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group rounded-xl bg-primary p-6 text-primary-foreground transition-transform hover:-translate-y-0.5">
              <c.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 flex items-center gap-2 text-xl">{c.t} <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" /></h3>
              <p className="mt-1 text-sm opacity-80">{c.d}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Educational tool only. Returns are assumptions, not guarantees or financial advice.
        </p>
      </section>
    </div>
  );
}
