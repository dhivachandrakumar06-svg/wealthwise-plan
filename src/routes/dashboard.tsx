import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiMode } from "@/components/finance/IntegrationDrawer";
import { getSimulations } from "@/services/api";
import { removeSaved, subscribeSaved } from "@/lib/storage";
import { formatCompact } from "@/lib/finance";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Saved Simulations — Finance Simulator" },
      { name: "description", content: "Your saved SIP simulations and summary statistics." },
      { property: "og:title", content: "Saved Simulations — Finance Simulator" },
      { property: "og:description", content: "Review and manage your saved simulations." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const mode = useApiMode();
  const q = useQuery({ queryKey: ["simulations", mode], queryFn: getSimulations });
  const [, force] = useState(0);
  useEffect(() => subscribeSaved(() => { force((x) => x + 1); q.refetch(); }), [q]);
  const list = q.data ?? [];
  const totalMonthly = list.reduce((s, x) => s + Number(x.monthly_investment), 0);
  const best = list.reduce((m, x) => Math.max(m, Number(x.expected_corpus) || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Saved simulations</h1>
      <p className="mt-1 text-muted-foreground">
        {mode === "flask" ? "Loaded from your Flask backend." : "Stored in this browser."}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Simulations", v: String(list.length) },
          { l: "Avg. monthly amount", v: list.length ? formatCompact(totalMonthly / list.length) : "—" },
          { l: "Largest expected corpus", v: best ? formatCompact(best) : "—" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-5">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="num mt-2 text-3xl font-semibold">{s.v}</p>
          </div>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed p-12 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No saved simulations yet</p>
          <p className="text-sm text-muted-foreground">Run a simulation and press "Save simulation".</p>
          <Button asChild className="mt-4"><Link to="/simulator">Open simulator</Link></Button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Monthly</th><th className="p-3">Years</th><th className="p-3">Invested</th><th className="p-3">Expected corpus</th><th className="p-3">Saved</th><th /></tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="num p-3">{formatCompact(Number(s.monthly_investment))}</td>
                  <td className="num p-3">{s.years}</td>
                  <td className="num p-3">{formatCompact(Number(s.total_invested))}</td>
                  <td className="num p-3 font-semibold text-chart-3">{formatCompact(Number(s.expected_corpus))}</td>
                  <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 text-right">
                    {mode === "standalone" && (
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => removeSaved(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
