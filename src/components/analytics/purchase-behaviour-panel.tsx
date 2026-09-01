import { MetricTiles } from "./metric-tiles"
import { formatAed, formatNumber } from "@/lib/utils"
import type { AmountStats, AmountBucket } from "@/lib/transaction-stats"

/** How much are customers actually spending per transaction on this campaign? */
export function PurchaseBehaviourPanel({ stats, distribution }: { stats: AmountStats; distribution: AmountBucket[] }) {
  const maxCount = Math.max(1, ...distribution.map((b) => b.count))

  return (
    <div>
      <MetricTiles
        columns={4}
        showTierBadges={false}
        items={[
          { key: "avg", label: "Average Transaction Value", value: formatAed(stats.avg) },
          { key: "median", label: "Median Transaction Value", value: formatAed(stats.median) },
          { key: "max", label: "Highest Transaction", value: formatAed(stats.max) },
          { key: "min", label: "Lowest Qualifying Transaction", value: formatAed(stats.min) },
        ]}
      />
      {distribution.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Transaction value distribution</p>
          {distribution.map((bucket) => {
            const widthPct = Math.max(3, Math.round((bucket.count / maxCount) * 100))
            return (
              <div key={bucket.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{bucket.label}</span>
                  <span className="text-foreground">{formatNumber(bucket.count)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
