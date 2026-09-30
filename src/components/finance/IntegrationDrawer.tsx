import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Download, Plug, Server } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiConfig, pingFlask, type ApiMode } from "@/services/api";
import { cn } from "@/lib/utils";
import appPy from "../../../backend/app.py?raw";
import schemaSql from "../../../backend/schema.sql?raw";
import requirementsTxt from "../../../backend/requirements.txt?raw";

const FILES = [
  { name: "app.py", code: appPy },
  { name: "schema.sql", code: schemaSql },
  { name: "requirements.txt", code: requirementsTxt },
];

const ROUTES = [
  ["GET", "/api/health", "Connection check"],
  ["GET", "/api/scenarios", "Return rates from scenario_assumptions"],
  ["POST", "/api/calculate", "{ monthly_investment, years, scenarios? } → results + yearly series"],
  ["POST", "/api/goal", "{ target, years, rate } → required_monthly"],
  ["POST", "/api/monte-carlo", "{ monthly_investment, years, mean_return, volatility, target }"],
  ["POST", "/api/simulations", "Save a simulation + results to SQL"],
  ["GET", "/api/simulations", "List saved simulations"],
];

function download(name: string, code: string) {
  const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function useApiMode(): ApiMode {
  return useSyncExternalStore(apiConfig.subscribe, apiConfig.getMode, () => "standalone");
}

export function IntegrationDrawer() {
  const mode = useApiMode();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail" | "testing">("idle");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => setUrl(apiConfig.getUrl()), []);

  const test = async () => {
    setStatus("testing");
    setStatus((await pingFlask(url)) ? "ok" : "fail");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className={cn("h-2 w-2 rounded-full", mode === "flask" ? "bg-chart-3" : "bg-accent")} />
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">Python &amp; SQL</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Python &amp; SQL Integration</SheetTitle>
          <SheetDescription>
            Run calculations in the browser, or connect this website to your own Flask backend.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <section className="space-y-3 rounded-xl border bg-muted/40 p-4">
            <h3 className="text-lg">Data source</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["standalone", "flask"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    apiConfig.set(m, url);
                    toast.success(m === "flask" ? "Using live Flask backend" : "Using standalone mode");
                  }}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors",
                    mode === m ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
                  )}
                >
                  <div className="font-semibold">{m === "flask" ? "Live Flask Backend" : "Standalone / Mock"}</div>
                  <div className="opacity-75">{m === "flask" ? "Calls your Python API" : "Calculates in the browser"}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} className="num" />
              <Button variant="secondary" onClick={test} className="gap-2">
                <Plug className="h-4 w-4" /> Test
              </Button>
            </div>
            {status !== "idle" && (
              <p className={cn("text-sm", status === "fail" ? "text-destructive" : "text-muted-foreground")}>
                {status === "testing" && "Checking…"}
                {status === "ok" && "Connected — Flask is responding."}
                {status === "fail" && "Couldn't reach Flask. Is `python app.py` running with CORS enabled?"}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-lg">Quick start</h3>
            <pre className="num overflow-x-auto rounded-lg bg-primary p-4 text-xs text-primary-foreground">{`pip install -r requirements.txt
python app.py        # → http://localhost:5000/api`}</pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg">API routes</h3>
            <div className="divide-y rounded-lg border text-sm">
              {ROUTES.map(([m, p, d]) => (
                <div key={p + m} className="flex flex-wrap items-baseline gap-2 p-2.5">
                  <span className={cn("num w-12 text-xs font-bold", m === "GET" ? "text-chart-3" : "text-chart-2")}>{m}</span>
                  <span className="num font-medium">{p}</span>
                  <span className="w-full pl-14 text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Source files</h3>
              <Button size="sm" onClick={() => FILES.forEach((f) => download(f.name, f.code))} className="gap-2">
                <Download className="h-4 w-4" /> Download all
              </Button>
            </div>
            <Tabs defaultValue="app.py">
              <TabsList>
                {FILES.map((f) => <TabsTrigger key={f.name} value={f.name} className="num text-xs">{f.name}</TabsTrigger>)}
              </TabsList>
              {FILES.map((f) => (
                <TabsContent key={f.name} value={f.name} className="relative">
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(f.code); setCopied(f.name); setTimeout(() => setCopied(null), 1500); }}>
                      {copied === f.name ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => download(f.name, f.code)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <pre className="num max-h-[420px] overflow-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">{f.code}</pre>
                </TabsContent>
              ))}
            </Tabs>
            <p className="text-xs text-muted-foreground">
              The frontend's API layer lives in <code className="num">src/services/api.ts</code> — every call has the same response shape in both modes.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
