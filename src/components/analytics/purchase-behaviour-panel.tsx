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
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-xs font-medium text-muted-foreground">Transaction value distribution</p>
          <div className="mt-3 space-y-4">
            {distribution.map((bucket) => {
              const widthPct = Math.max(3, Math.round((bucket.count / maxCount) * 100))
              return (
                <div key={bucket.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{bucket.label}</span>
                    <span className="text-base font-semibold tabular-nums text-foreground">{formatNumber(bucket.count)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
