import { Badge } from "@/components/ui/badge"
import { MetricTiles } from "./metric-tiles"
import { formatAed, formatPercent, formatShortDate } from "@/lib/utils"
import { getPacingStatus, PACING_LABEL, type PacingStatus } from "@/lib/analytics-utils"

const PACING_VARIANT: Record<PacingStatus, "success" | "warning" | "info"> = {
  on_track: "success",
  spending_fast: "warning",
  underutilized: "info",
}

const PACING_HINT: Record<PacingStatus, string> = {
  on_track: "Budget is pacing to be used by campaign end.",
  spending_fast: "Budget is on track to exhaust soon — consider a top-up if the campaign should keep running.",
  underutilized: "Spend is slow relative to budget — consider boosting visibility or extending the offer.",
}

/** Is my budget pacing well, and when will it run out? */
export function BudgetPacingPanel({
  remainingBudget,
  utilizationPct,
  burnRatePerDay,
  estimatedExhaustionDate,
}: {
  remainingBudget: number
  utilizationPct: number
  burnRatePerDay: number
  estimatedExhaustionDate: string | null
}) {
  const status = getPacingStatus(utilizationPct, estimatedExhaustionDate)

  return (
    <div>
      <Badge variant={PACING_VARIANT[status]} dot>
        {PACING_LABEL[status]}
      </Badge>
      <div className="mt-3">
        <MetricTiles
          columns={2}
          showTierBadges={false}
          items={[
            { key: "utilization", label: "Budget Utilization", value: formatPercent(utilizationPct) },
            { key: "burn", label: "Current Burn Rate", value: burnRatePerDay > 0 ? `${formatAed(burnRatePerDay)}/day` : "No active burn" },
            { key: "exhaustion", label: "Forecast Exhaustion", value: estimatedExhaustionDate ? formatShortDate(estimatedExhaustionDate) : "—" },
            { key: "remaining", label: "Remaining Budget", value: formatAed(remainingBudget) },
          ]}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{PACING_HINT[status]}</p>
    </div>
  )
}
