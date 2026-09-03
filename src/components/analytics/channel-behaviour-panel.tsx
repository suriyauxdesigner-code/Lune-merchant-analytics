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

  const gmvDiffPct = online.gmv > 0 && inStore.gmv > 0 ? (Math.abs(online.gmv - inStore.gmv) / Math.min(online.gmv, inStore.gmv)) * 100 : 0
  const gmvLeader = online.gmv >= inStore.gmv ? "Online" : "In-store"
  const repeatDiff = Math.abs(inStore.repeatRate - online.repeatRate)
  const repeatLeader = inStore.repeatRate > online.repeatRate ? "In-store" : "Online"

  // Only state a comparison when the underlying data actually shows one — never both "leads on
  // everything" and "here's a tradeoff" phrasing for the same numbers.
  let interpretation: string | null = null
  if (metrics.includes("gmv") && metrics.includes("repeatRate") && gmvDiffPct >= 5 && repeatDiff >= 3) {
    interpretation =
      gmvLeader === repeatLeader
        ? `${gmvLeader} leads on both GMV and repeat rate.`
        : `${gmvLeader} generates more GMV, while ${repeatLeader.toLowerCase()} has a higher repeat rate.`
  } else if (metrics.includes("repeatRate") && repeatDiff >= 3) {
    interpretation = `${repeatLeader} customers have a ${repeatDiff.toFixed(0)}pp higher repeat rate than ${repeatLeader === "In-store" ? "online" : "in-store"} customers.`
  }

  return (
    <div>
      <PairedMetricBars
        metrics={metrics.map((key) => ({ label: METRIC_META[key].label, a: online[key], b: inStore[key], format: METRIC_META[key].format }))}
        seriesA={{ label: "Online", color: "hsl(217 91% 55%)" }}
        seriesB={{ label: "In-Store", color: "hsl(38 92% 45%)" }}
      />
      {interpretation && <p className="mt-4 text-sm font-medium text-foreground">{interpretation}</p>}
    </div>
  )
}
