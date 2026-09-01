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

const COL_CLASS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
}

/** Splits `count` items into rows of at most `max` each, balancing rows rather than front-loading them. */
function balancedRowSizes(count: number, max: number): number[] {
  const numRows = Math.max(1, Math.ceil(count / max))
  const sizes: number[] = []
  let remaining = count
  for (let r = 0; r < numRows; r++) {
    const rowsLeft = numRows - r
    const size = Math.ceil(remaining / rowsLeft)
    sizes.push(size)
    remaining -= size
  }
  return sizes
}

/**
 * A responsive grid of metric tiles — same card treatment for live, transaction-derived and
 * future-instrumentation metrics. Rows are balanced (not front-loaded) and each row is sized to
 * exactly its own tile count, so tiles always fill their row instead of leaving a dead trailing
 * cell when the count doesn't divide evenly into `columns`.
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
  const rowSizes = balancedRowSizes(items.length, columns)
  const rows: MetricTileItem[][] = []
  let cursor = 0
  for (const size of rowSizes) {
    rows.push(items.slice(cursor, cursor + size))
    cursor += size
  }

  return (
    <div className="space-y-3">
      {rows.map((rowItems, i) => (
        <div key={i} className={`grid grid-cols-2 gap-3 ${COL_CLASS[rowItems.length] ?? COL_CLASS[4]}`}>
          {rowItems.map((item) => (
            <div key={item.key} className="rounded-[var(--radius-sm)] border border-border bg-card px-3.5 py-3">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-1.5 text-lg font-bold text-foreground">{item.value}</p>
              {showTierBadges && item.tier && item.tier !== "live" && <TierBadge tier={item.tier} label={item.tierLabel} className="mt-1.5" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
