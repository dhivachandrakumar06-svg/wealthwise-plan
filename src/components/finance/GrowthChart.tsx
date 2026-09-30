import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, SCENARIO_COLOR, type SeriesPoint } from "@/lib/finance";

const LINES = [
  { key: "invested", name: "Invested", dash: "5 4" },
  { key: "cautious", name: "Cautious" },
  { key: "expected", name: "Expected" },
  { key: "optimistic", name: "Optimistic" },
] as const;

export function GrowthChart({ data, height = 340 }: { data: SeriesPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(y) => `Y${y}`} />
        <YAxis tickLine={false} axisLine={false} width={72} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatCompact(v)} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }}
          labelFormatter={(y) => `Year ${y}`}
          formatter={(v: number, n) => [formatCompact(v), n]}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        {LINES.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={SCENARIO_COLOR[l.key]}
            strokeWidth={l.key === "expected" ? 3 : 2}
            strokeDasharray={"dash" in l ? l.dash : undefined}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
