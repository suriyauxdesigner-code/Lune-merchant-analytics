import type { ReactNode } from "react"
import { TierBadge } from "@/components/shared/kpi-card"
import type { DataTier } from "@/lib/mock-performance"

export type MetricTileItem = {
  key: string
  label: string
  value: ReactNode
  tier?: DataTier
  tierLabel?: string
}

/**
 * A grid of metric tiles — same card treatment for live, transaction-derived
 * and future-instrumentation metrics. Every tile shows a real value; the
 * only difference is a small tier badge for anything that isn't live data.
 */
export function MetricTiles({
  items,
  columns = 4,
  showTierBadges = true,
}: {
  items: MetricTileItem[]
  columns?: 2 | 3 | 4 | 5 | 6
  /** Set false when a single caption below the whole grid already covers the data dependency. */
  showTierBadges?: boolean
}) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-3"
        : columns === 5
          ? "sm:grid-cols-3 lg:grid-cols-5"
          : columns === 6
            ? "sm:grid-cols-3 lg:grid-cols-6"
            : "sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={`grid grid-cols-2 gap-3 ${colClass}`}>
      {items.map((item) => (
        <div key={item.key} className="rounded-[var(--radius-sm)] bg-gradient-to-br from-card to-secondary/60 px-3.5 py-3">
          <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
          <p className="mt-1.5 text-lg font-bold text-foreground">{item.value}</p>
          {showTierBadges && item.tier && item.tier !== "live" && <TierBadge tier={item.tier} label={item.tierLabel} className="mt-1.5" />}
        </div>
      ))}
    </div>
  )
}
