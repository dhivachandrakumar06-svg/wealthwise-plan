import { Link } from "@tanstack/react-router";
import { IntegrationDrawer } from "./IntegrationDrawer";

const NAV = [
  { to: "/simulator", label: "Simulator" },
  { to: "/goals", label: "Goals" },
  { to: "/compare", label: "Compare" },
  { to: "/monte-carlo", label: "Monte Carlo" },
  { to: "/dashboard", label: "Saved" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-accent">₹</span>
          <span className="font-display text-lg font-semibold">Finance Simulator</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <IntegrationDrawer />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="whitespace-nowrap rounded-md px-3 py-1 text-sm text-muted-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
        Educational tool only. Returns are assumptions, not guarantees or financial advice. Past performance does not predict future results.
      </div>
    </footer>
  );
}
