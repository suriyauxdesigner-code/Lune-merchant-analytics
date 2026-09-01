import { PairedMetricBars } from "./paired-metric-bars"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { ChannelBehaviorStat } from "@/lib/transaction-stats"

type MetricKey = "gmv" | "transactions" | "customers" | "aov" | "roi" | "repeatRate"

const METRIC_META: Record<MetricKey, { label: string; format: (v: number) => string }> = {
  gmv: { label: "GMV", format: formatAed },
  transactions: { label: "Transactions", format: formatNumber },
  customers: { label: "Customers", format: formatNumber },
  aov: { label: "AOV", format: formatAed },
  roi: { label: "ROI", format: (v) => formatRatio(v) },
  repeatRate: { label: "Repeat rate", format: (v) => formatPercent(v, 0) },
}

/** Online vs. in-store, compared across chosen metrics as a compact paired-bar list rather than a chart per metric. */
export function ChannelBehaviourPanel({ stats, metrics }: { stats: ChannelBehaviorStat[]; metrics: MetricKey[] }) {
  const [online, inStore] = stats
  const repeatDiff = Math.abs(inStore.repeatRate - online.repeatRate)
  const repeatLeader = inStore.repeatRate > online.repeatRate ? "In-store" : "Online"

  return (
    <div>
      <PairedMetricBars
        metrics={metrics.map((key) => ({ label: METRIC_META[key].label, a: online[key], b: inStore[key], format: METRIC_META[key].format }))}
        seriesA={{ label: "Online", color: "hsl(217 91% 55%)" }}
        seriesB={{ label: "In-Store", color: "hsl(38 92% 45%)" }}
      />
      {metrics.includes("repeatRate") && repeatDiff >= 3 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {repeatLeader} customers have a {repeatDiff.toFixed(0)}pp higher repeat rate than {repeatLeader === "In-store" ? "online" : "in-store"} customers.
        </p>
      )}
    </div>
  )
}
