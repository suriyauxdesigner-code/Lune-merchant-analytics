import { ArrowRight } from "lucide-react"
import { formatAed, formatDate, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

export function BudgetHealthPanel({
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
  const candidates: { status: CampaignStatus; label: string; count: number }[] = [
    { status: "pending_approval", label: "Pending Approval", count: statusCounts.pending_approval },
    { status: "rejected", label: "Rejected", count: statusCounts.rejected },
  ]
  const needsAttention = candidates.filter((s) => s.count > 0)

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-6">
      <p className="text-sm font-semibold text-foreground">Budget Health</p>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
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

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{formatAed(perf.burnRatePerDay)}</span>/day burn rate
        </span>
        <span className="text-muted-foreground">
          Est. exhaustion: <span className="font-medium text-foreground">{perf.estimatedExhaustionDate ? formatDate(perf.estimatedExhaustionDate) : "not applicable"}</span>
        </span>
      </div>

      {needsAttention.length > 0 ? (
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          {needsAttention.map((s) => (
            <div key={s.status} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {s.count} {s.label}
              </span>
              {onReviewStatus && (
                <button onClick={() => onReviewStatus(s.status)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  Review
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">No campaigns need attention right now.</p>
      )}
    </div>
  )
}
