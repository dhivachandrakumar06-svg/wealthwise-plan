import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  quick: { label: string; value: number }[];
  prefix?: string;
  suffix?: string;
  display?: (v: number) => string;
}

export function AmountSlider({ label, value, onChange, min, max, step, quick, prefix, suffix, display }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center rounded-lg border bg-card px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring">
          {prefix && <span className="num mr-1 text-muted-foreground">{prefix}</span>}
          <input
            type="number"
            aria-label={label}
            className="num w-28 bg-transparent text-right text-lg font-semibold outline-none"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(0, v)));
            }}
            onBlur={() => onChange(Math.min(max, Math.max(min, value)))}
          />
          {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
      <div className="flex justify-between text-xs text-muted-foreground num">
        <span>{display ? display(min) : min}</span>
        <span>{display ? display(max) : max}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <button
            key={q.value}
            type="button"
            onClick={() => onChange(q.value)}
            className={cn(
              "num rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === q.value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
            )}
          >
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const MONTHLY_QUICK = [
  { label: "₹1K", value: 1000 },
  { label: "₹2.5K", value: 2500 },
  { label: "₹5K", value: 5000 },
  { label: "₹10K", value: 10000 },
  { label: "₹25K", value: 25000 },
  { label: "₹50K", value: 50000 },
];
export const YEARS_QUICK = [5, 10, 15, 20, 30].map((y) => ({ label: `${y} yrs`, value: y }));
