import { CategoryBarChart } from "./category-bar-chart"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { ValueBucket } from "@/lib/mock-performance"

/** How much customers spend in total, and how each spend band contributes to GMV. */
export function CustomerValuePanel({ buckets }: { buckets: ValueBucket[] }) {
  const totalGmv = buckets.reduce((s, b) => s + b.gmv, 0)
  const totalCustomers = buckets.reduce((s, b) => s + b.customers, 0)

  return (
    <div className="flex h-full flex-col">
      <CategoryBarChart data={buckets.map((b) => ({ label: b.label, value: b.customers }))} formatValue={formatNumber} fill />
      <div className="mt-5 space-y-2 border-t border-border pt-4">
        {buckets.map((b) => {
          const customerShare = totalCustomers > 0 ? (b.customers / totalCustomers) * 100 : 0
          const gmvShare = totalGmv > 0 ? (b.gmv / totalGmv) * 100 : 0
          return (
            <div key={b.label} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{b.label}</span>
              <span className="text-muted-foreground">
                {formatPercent(customerShare, 0)} of customers <span className="text-foreground">·</span> {formatAed(b.gmv)} ({formatPercent(gmvShare, 0)} of GMV)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
