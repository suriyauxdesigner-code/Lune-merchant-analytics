import { GroupedBarChart } from "./grouped-bar-chart"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { ChannelBehaviorStat } from "@/lib/transaction-stats"

const SERIES = [
  { key: "online", label: "Online", color: "hsl(217 91% 55%)" },
  { key: "in_store", label: "In-Store", color: "hsl(38 92% 45%)" },
]

type MetricKey = "gmv" | "transactions" | "customers" | "aov" | "roi" | "repeatRate"

const METRIC_META: Record<MetricKey, { label: string; format: (v: number) => string }> = {
  gmv: { label: "GMV", format: formatAed },
  transactions: { label: "Transactions", format: formatNumber },
  customers: { label: "Customers", format: formatNumber },
  aov: { label: "AOV", format: formatAed },
  roi: { label: "ROI", format: (v) => formatRatio(v) },
  repeatRate: { label: "Repeat rate", format: (v) => formatPercent(v, 0) },
}

/** Online vs. in-store, compared across chosen metrics — each rendered on its own scale rather than one shared axis. */
export function ChannelBehaviourPanel({ stats, metrics }: { stats: ChannelBehaviorStat[]; metrics: MetricKey[] }) {
  const [online, inStore] = stats
  const repeatDiff = Math.abs(inStore.repeatRate - online.repeatRate)
  const repeatLeader = inStore.repeatRate > online.repeatRate ? "In-store" : "Online"

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {metrics.map((key) => {
          const meta = METRIC_META[key]
          return (
            <div key={key}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{meta.label}</p>
              <GroupedBarChart
                data={[{ category: meta.label, online: online[key], in_store: inStore[key] }]}
                series={SERIES}
                formatValue={meta.format}
                height={140}
                showLegend={false}
              />
            </div>
          )
        })}
      </div>
      {metrics.includes("repeatRate") && repeatDiff >= 3 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {repeatLeader} customers have a {repeatDiff.toFixed(0)}pp higher repeat rate than {repeatLeader === "In-store" ? "online" : "in-store"} customers.
        </p>
      )}
    </div>
  )
}
