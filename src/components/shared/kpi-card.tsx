import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { DataTier } from "@/lib/mock-performance"

const TIER_BADGE_STYLE: Record<Exclude<DataTier, "live">, string> = {
  transaction: "bg-blue-50 text-blue-700",
  future: "bg-amber-50 text-amber-700",
}

const TIER_SHORT_LABEL: Record<Exclude<DataTier, "live">, string> = {
  transaction: "Requires transaction data",
  future: "Future capability",
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
  className,
}: {
  label: string
  value: ReactNode
  /** Data tier this metric belongs to — controls the small badge under the value. */
  tier?: DataTier
  /** Override the default badge text for this tier. */
  tierLabel?: string
  icon?: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">{icon}</div>}
      </div>
      <p className="mt-2.5 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {tier !== "live" && <TierBadge tier={tier} label={tierLabel} className="mt-2" />}
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
