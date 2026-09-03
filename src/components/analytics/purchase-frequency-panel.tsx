import { CategoryBarChart } from "./category-bar-chart"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { FrequencyBucket } from "@/lib/mock-performance"

/** How many times customers purchased — leads with the repeat purchase rate, the actual business metric. */
export function PurchaseFrequencyPanel({ buckets }: { buckets: FrequencyBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.customers, 0)
  const repeatCustomers = buckets.slice(1).reduce((s, b) => s + b.customers, 0)
  const repeatRate = total > 0 ? (repeatCustomers / total) * 100 : 0

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Repeat purchase rate</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{formatPercent(repeatRate, 0)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatNumber(repeatCustomers)} customers made more than one purchase</p>

      <div className="mt-5 border-t border-border pt-4">
        <CategoryBarChart
          data={buckets.map((b, i) => ({ label: b.label, value: total > 0 ? (b.customers / total) * 100 : 0, highlight: i > 0 }))}
          formatValue={(v) => formatPercent(v, 0)}
          height={160}
        />
      </div>
    </div>
  )
}
