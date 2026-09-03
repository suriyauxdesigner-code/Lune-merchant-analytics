import { Children, type ReactNode } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DataTier } from "@/lib/mock-performance"

const TIER_BADGE_STYLE: Record<Exclude<DataTier, "live">, string> = {
  transaction: "bg-blue-50 text-blue-700",
  future: "bg-amber-50 text-amber-700",
}

const TIER_SHORT_LABEL: Record<Exclude<DataTier, "live">, string> = {
  transaction: "Requires transaction data",
  future: "Coming soon",
}

/**
 * A single KPI tile used everywhere across Analytics. Every metric — live,
 * transaction-derived, or future-instrumentation — renders with a real
 * (mock, for now) value in the identical card style. The only difference is
 * a small tier badge for anything that isn't live product data yet. We never
 * hide, disable, grey out, or lock a widget.
 */
export function KpiCard({
  label,
  value,
  tier = "live",
  tierLabel,
  icon,
  hint,
  deltaPct,
  className,
  size = "lg",
  showTierBadge = true,
}: {
  label: string
  value: ReactNode
  /** Data tier this metric belongs to — controls the small badge under the value. */
  tier?: DataTier
  /** Override the default badge text for this tier. */
  tierLabel?: string
  icon?: ReactNode
  hint?: string
  /** % change vs. the previous period of equal length. Omit (or null) when there's no prior-period activity to compare against. */
  deltaPct?: number | null
  className?: string
  /** "lg" (default) for headline metrics, "md" for secondary metrics that should carry less visual weight. */
  size?: "lg" | "md"
  /** Set false to suppress the per-tile tier badge — use when a single caption below a group covers it instead. */
  showTierBadge?: boolean
}) {
  return (
    <div className={cn("w-full rounded-[var(--radius)] border border-border bg-card p-4 shadow-card", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {icon && <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-secondary text-primary">{icon}</div>}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className={cn("font-extrabold tracking-tight text-foreground", size === "lg" ? "text-3xl" : "text-xl")}>{value}</p>
        {deltaPct != null && <DeltaBadge pct={deltaPct} />}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {tier !== "live" && showTierBadge && <TierBadge tier={tier} label={tierLabel} className="mt-1.5" />}
    </div>
  )
}

/** Small up/down indicator comparing the current period to the one before it. */
export function DeltaBadge({ pct }: { pct: number }) {
  const isUp = pct >= 0
  const Icon = isUp ? ArrowUp : ArrowDown
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-semibold", isUp ? "text-success" : "text-destructive")}>
      <Icon className="size-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

const SM_COLS_CLASS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }
const LG_COLS_CLASS: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }

/** Splits `count` items across as few rows as possible (max 4 per row), balancing rows rather than front-loading them — 6 becomes 3+3, 7 becomes 4+3, not 4+2+1. */
function balancedRowSizes(count: number): number[] {
  const numRows = Math.max(1, Math.ceil(count / 4))
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
 * A responsive grid of individual KpiCards — never more than 4 per row. When wrapping is
 * needed, each row is its own grid sized to exactly its own card count, so cards always fill
 * their row edge-to-edge instead of leaving a dead trailing cell (e.g. a 4+3 split renders as
 * two full-width rows, not a 4-column grid with one empty slot in the second row).
 */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  const items = Children.toArray(children)
  const rowSizes = balancedRowSizes(items.length)

  const rows: ReactNode[][] = []
  let cursor = 0
  for (const size of rowSizes) {
    rows.push(items.slice(cursor, cursor + size))
    cursor += size
  }

  return (
    <div className={cn("space-y-3", className)}>
      {rows.map((rowItems, i) => {
        const cols = rowItems.length
        const smCols = Math.min(3, cols)
        return (
          <div key={i} className={cn("grid grid-cols-2 gap-3", SM_COLS_CLASS[smCols], LG_COLS_CLASS[cols])}>
            {rowItems}
          </div>
        )
      })}
    </div>
  )
}

export function TierBadge({ tier, label, className }: { tier: Exclude<DataTier, "live">; label?: string; className?: string }) {
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none", TIER_BADGE_STYLE[tier], className)}>
      {label ?? TIER_SHORT_LABEL[tier]}
    </span>
  )
}

/** Small neutral eyebrow tag used above/beside a group of prototype widgets. */
export function PrototypeTag({ label = "Prototype · Sample data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      {label}
    </span>
  )
}
