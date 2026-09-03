import { CategoryBarChart } from "./category-bar-chart"
import { formatAed, formatPercent } from "@/lib/utils"
import type { AgeBucket } from "@/lib/mock-performance"

/** Which age segment performs best, by average order value. */
export function DemographicPerformancePanel({ buckets }: { buckets: AgeBucket[] }) {
  const withAov = buckets.map((b) => ({ ...b, aov: b.transactions > 0 ? b.gmv / b.transactions : 0 }))
  const totalGmv = buckets.reduce((s, b) => s + b.gmv, 0)
  const top = [...withAov].filter((b) => b.customers > 0).sort((a, b) => b.gmv - a.gmv)[0]

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Average order value by age group</p>
      <CategoryBarChart data={withAov.map((b) => ({ label: b.ageBand, value: b.aov, highlight: top?.ageBand === b.ageBand }))} formatValue={formatAed} fill color="hsl(266 65% 58%)" />
      {top && (
        <p className="mt-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{top.ageBand}</span> is the strongest-performing audience for this campaign, contributing{" "}
          {formatPercent(totalGmv > 0 ? (top.gmv / totalGmv) * 100 : 0, 0)} of GMV at an AOV of {formatAed(top.aov)}.
        </p>
      )}
    </div>
  )
}
