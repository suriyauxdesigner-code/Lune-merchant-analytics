import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<AggregatePerformance, "customersReached" | "customersTransacted" | "newCustomers" | "returningCustomers" | "repeatPurchaseRate">

export function CustomerPerformancePanel({ perf }: { perf: Perf }) {
  const repeatPct = Math.min(100, perf.repeatPurchaseRate * 100)

  return (
    <div className="h-full rounded-[var(--radius)] border border-border bg-card p-6">
      <p className="text-sm font-semibold text-foreground">Customer Performance</p>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Customers reached</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">{formatNumber(perf.customersReached)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Customers who transacted</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">{formatNumber(perf.customersTransacted)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">New customers</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">{formatNumber(perf.newCustomers)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Returning customers</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">{formatNumber(perf.returningCustomers)}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-muted-foreground">Repeat purchase rate</p>
          <p className="text-sm font-semibold text-foreground">{formatPercent(perf.repeatPurchaseRate * 100)}</p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${repeatPct}%` }} />
        </div>
      </div>
    </div>
  )
}
