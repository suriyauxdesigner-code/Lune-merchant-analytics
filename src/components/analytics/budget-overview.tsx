import { MetricTiles } from "./metric-tiles"
import { formatAed, formatDate, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

export function BudgetOverview({ budget, perf }: { budget: number; perf: Pick<AggregatePerformance, "cashbackIssued" | "remainingBudget" | "utilizationPct" | "burnRatePerDay" | "estimatedExhaustionDate"> }) {
  const usedPct = Math.min(100, perf.utilizationPct)

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-sm)] border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Configured Budget</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatAed(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Used</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatAed(perf.cashbackIssued)} <span className="text-sm font-normal text-muted-foreground">({formatPercent(perf.utilizationPct)})</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatAed(perf.remainingBudget)}</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usedPct}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Actual spend is a prototype estimate — requires transaction/settlement data.</p>
      </div>

      <MetricTiles
        columns={3}
        items={[
          { key: "burn", label: "Burn Rate", value: `${formatAed(perf.burnRatePerDay)} / day`, tier: "transaction" },
          {
            key: "exhaustion",
            label: "Estimated Budget Exhaustion",
            value: perf.estimatedExhaustionDate ? formatDate(perf.estimatedExhaustionDate) : "Not applicable",
            tier: "transaction",
          },
          { key: "utilization", label: "Budget Utilization", value: formatPercent(perf.utilizationPct), tier: "transaction" },
        ]}
      />
    </div>
  )
}
