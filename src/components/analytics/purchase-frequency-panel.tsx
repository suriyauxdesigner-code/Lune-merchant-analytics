import { CategoryBarChart } from "./category-bar-chart"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { FrequencyBucket } from "@/lib/mock-performance"

/** How many times customers purchased — highlights the repeat purchase rate. */
export function PurchaseFrequencyPanel({ buckets }: { buckets: FrequencyBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.customers, 0)
  const repeatCustomers = buckets.slice(1).reduce((s, b) => s + b.customers, 0)
  const repeatRate = total > 0 ? (repeatCustomers / total) * 100 : 0

  return (
    <div>
      <CategoryBarChart
        data={buckets.map((b, i) => ({ label: b.label, value: total > 0 ? (b.customers / total) * 100 : 0, highlight: i > 0 }))}
        formatValue={(v) => formatPercent(v, 0)}
        height={200}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{formatPercent(repeatRate, 0)}</span> of customers ({formatNumber(repeatCustomers)}) made more than one purchase.
      </p>
    </div>
  )
}
