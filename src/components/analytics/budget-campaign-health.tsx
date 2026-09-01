import { ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { formatAed, formatDate, formatPercent } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/analytics-utils"
import type { AggregatePerformance } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

const STATUS_ORDER: CampaignStatus[] = ["active", "pending_approval", "scheduled", "completed", "rejected"]
const STATUS_DOT: Record<CampaignStatus, string> = {
  active: "bg-success",
  pending_approval: "bg-warning",
  scheduled: "bg-info",
  completed: "bg-neutral-foreground",
  rejected: "bg-destructive",
}
/** Statuses that need a merchant decision get a lightweight call to action. */
const ACTIONABLE: Partial<Record<CampaignStatus, boolean>> = { pending_approval: true, rejected: true }

export function BudgetCampaignHealth({
  budget,
  perf,
  statusCounts,
  onReviewStatus,
}: {
  budget: number
  perf: Pick<AggregatePerformance, "cashbackIssued" | "remainingBudget" | "utilizationPct" | "burnRatePerDay" | "estimatedExhaustionDate">
  statusCounts: Record<CampaignStatus, number>
  onReviewStatus?: (status: CampaignStatus) => void
}) {
  const usedPct = Math.min(100, perf.utilizationPct)

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr]">
      {/* Budget health */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Budget</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            <p className="text-xs text-muted-foreground">Configured</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">{formatAed(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Used</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">{formatAed(perf.cashbackIssued)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="mt-0.5 text-lg font-semibold text-foreground">{formatAed(perf.remainingBudget)}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usedPct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{formatPercent(perf.utilizationPct)} utilized</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Burn rate</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{formatAed(perf.burnRatePerDay)} / day</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. exhaustion</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{perf.estimatedExhaustionDate ? formatDate(perf.estimatedExhaustionDate) : "Not applicable"}</p>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="hidden lg:block lg:h-full" />
      <Separator className="lg:hidden" />

      {/* Campaign health */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Campaigns</p>
        <div className="space-y-3">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status]
            const actionable = ACTIONABLE[status] && count > 0
            return (
              <div key={status} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
                  {STATUS_LABEL[status]}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{count}</span>
                  {actionable && onReviewStatus && (
                    <button
                      onClick={() => onReviewStatus(status)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Review
                      <ArrowRight className="size-3" />
                    </button>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
