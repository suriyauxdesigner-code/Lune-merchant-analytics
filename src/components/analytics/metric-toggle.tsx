import { cn } from "@/lib/utils"
import { CHART_METRIC_OPTIONS, type ChartMetric } from "./performance-over-time-chart"

const DEFAULT_METRICS: ChartMetric[] = ["gmv", "transactions", "cashback", "roi"]

export function MetricToggle({
  value,
  onChange,
  metrics = DEFAULT_METRICS,
}: {
  value: ChartMetric
  onChange: (metric: ChartMetric) => void
  /** Which metrics to offer — levels differ (e.g. only Campaign Analytics offers AOV). Defaults to GMV/Transactions/Cashback/ROI. */
  metrics?: ChartMetric[]
}) {
  const options = CHART_METRIC_OPTIONS.filter((o) => metrics.includes(o.value))
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            value === opt.value ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
