import type { ReactNode } from "react"
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
 * A single, compact KPI tile used everywhere across Analytics — Brand Analytics and Campaign
 * Analytics both render every KPI through this one component, at the identical typography and
 * spacing. Every value reads at the same size regardless of metric type (currency, count, ratio,
 * percentage) or how long it is: hierarchy between metrics comes from section grouping and order,
 * never from shrinking or enlarging individual tiles. The only difference between tiles is a small
 * tier badge for anything that isn't live product data yet. We never hide, disable, grey out, or
 * lock a widget.
 */
export function KpiCard({
  label,
  value,
  tier = "live",
  tierLabel,
  icon,
  hint,
  className,
  showTierBadge = true,
}: {
  label: string
  value: ReactNode
  /** Data tier this metric belongs to — controls the small badge under the value. */
  tier?: DataTier
  /** Override the default badge text for this tier. */
  tierLabel?: string
  icon?: ReactNode
  /** Supporting context below the value — typically the active period ("Last 90 days", "Campaign lifetime"). Always reflect the page's real active filter here; never hardcode a period that isn't actually in effect. */
  hint?: string
  className?: string
  /** Set false to suppress the per-tile tier badge — use when a single caption below a group covers it instead. */
  showTierBadge?: boolean
}) {
  return (
    <div className={cn("w-full min-w-0 rounded-[var(--radius)] border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium leading-5 text-foreground">{label}</p>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-secondary text-primary [&>svg]:size-[18px]">{icon}</div>
        )}
      </div>
      <p className="mt-3 min-w-0 truncate text-[28px] font-semibold leading-8 tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{hint}</p>}
      {tier !== "live" && showTierBadge && <TierBadge tier={tier} label={tierLabel} className="mt-2" />}
    </div>
  )
}

/**
 * A clean, equal-width KPI grid — 3 columns on desktop, 2 on tablet, 1 on mobile, with a
 * consistent gap at every breakpoint. The column steps land later than the typical `sm`/`lg` pair
 * (2 columns from `lg` at 1024px, 3 from `xl` at 1280px): the app's sidebar is a fixed ~264px and
 * becomes permanently visible from `md` (768px) up, so a naive `sm:grid-cols-2` leaves each tablet
 * card only ~170px of content width in the 768–1023px range — not enough for a long
 * "AED 1,407,735"-style value at 28px without silently truncating it. Waiting for `lg`/`xl` keeps
 * every column step at a width that's actually been verified to fit the longest realistic value on
 * one line. Below `lg`, a single column always has the full content width, so it's never at risk.
 * Deliberately a single flat grid (not a row-balancing layout): with a fixed 6-metric KPI
 * architecture across Analytics, plain responsive reflow reads as a calm, standard SaaS dashboard
 * rather than a bespoke layout.
 */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>
}

export function TierBadge({ tier, label, className }: { tier: Exclude<DataTier, "live">; label?: string; className?: string }) {
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none", TIER_BADGE_STYLE[tier], className)}>
      {label ?? TIER_SHORT_LABEL[tier]}
    </span>
  )
}
