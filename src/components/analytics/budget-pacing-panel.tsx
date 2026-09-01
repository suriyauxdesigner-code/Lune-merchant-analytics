import { Badge } from "@/components/ui/badge"
import { MetricTiles } from "./metric-tiles"
import { formatAed, formatPercent, formatShortDate } from "@/lib/utils"
import { getPacingStatus, PACING_LABEL, type PacingStatus } from "@/lib/analytics-utils"

const PACING_VARIANT: Record<PacingStatus, "success" | "warning" | "info"> = {
  on_track: "success",
  spending_fast: "warning",
  underutilized: "info",
}

const PACING_FILL: Record<PacingStatus, string> = {
  on_track: "hsl(152 55% 34%)",
  spending_fast: "hsl(38 92% 45%)",
  underutilized: "hsl(217 91% 55%)",
}

const PACING_HINT: Record<PacingStatus, string> = {
  on_track: "Budget is pacing to be used by campaign end.",
  spending_fast: "Budget is on track to exhaust soon — consider a top-up if the campaign should keep running.",
  underutilized: "Spend is slow relative to budget — consider boosting visibility or extending the offer.",
}

/** Is my budget pacing well, and when will it run out? A large progress visualization, not a row of small tiles. */
export function BudgetPacingPanel({
  budget,
  remainingBudget,
  utilizationPct,
  burnRatePerDay,
  estimatedExhaustionDate,
}: {
  budget: number
  remainingBudget: number
  utilizationPct: number
  burnRatePerDay: number
  estimatedExhaustionDate: string | null
}) {
  const status = getPacingStatus(utilizationPct, estimatedExhaustionDate)
  const fillPct = Math.min(100, Math.max(0, utilizationPct))
  const daysToExhaustion = estimatedExhaustionDate ? Math.max(0, Math.round((new Date(estimatedExhaustionDate).getTime() - Date.now()) / 86_400_000)) : null

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold text-foreground">{formatPercent(utilizationPct, 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatAed(budget - remainingBudget)} used of {formatAed(budget)} allocated
          </p>
        </div>
        <Badge variant={PACING_VARIANT[status]} dot>
          {PACING_LABEL[status]}
        </Badge>
      </div>

      <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: PACING_FILL[status] }} />
      </div>

      <div className="mt-5">
        <MetricTiles
          columns={3}
          showTierBadges={false}
          items={[
            { key: "burn", label: "Daily Average Spend", value: burnRatePerDay > 0 ? `${formatAed(burnRatePerDay)}/day` : "No active burn" },
            { key: "exhaustion", label: "Projected Exhaustion", value: estimatedExhaustionDate ? formatShortDate(estimatedExhaustionDate) : "—" },
            { key: "remaining", label: "Remaining Budget", value: formatAed(remainingBudget) },
          ]}
        />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {daysToExhaustion != null && status === "spending_fast" ? `Budget is projected to exhaust in ~${daysToExhaustion} day${daysToExhaustion === 1 ? "" : "s"}. ` : ""}
        {PACING_HINT[status]}
      </p>
    </div>
  )
}
