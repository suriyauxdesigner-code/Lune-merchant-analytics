import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<
  AggregatePerformance,
  | "customersReached"
  | "customersTransacted"
  | "newCustomers"
  | "returningCustomers"
  | "repeatPurchaseRate"
  | "offerToTransactionRate"
  | "transactionValue"
>

/** A plain stat grid (no nested tiles) — reads as one cohesive card rather than a wall of mini metrics. */
export function CustomerImpactStats({ perf }: { perf: Perf }) {
  const avgCustomerValue = perf.customersTransacted > 0 ? perf.transactionValue / perf.customersTransacted : 0
  const rows = [
    { label: "Customers Reached", value: formatNumber(perf.customersReached) },
    { label: "Total Customers", value: formatNumber(perf.customersTransacted) },
    { label: "New Customers", value: formatNumber(perf.newCustomers) },
    { label: "Returning Customers", value: formatNumber(perf.returningCustomers) },
    { label: "Repeat Purchase Rate", value: formatPercent(perf.repeatPurchaseRate * 100) },
    { label: "Conversion Rate", value: formatPercent(perf.offerToTransactionRate * 100) },
    { label: "Avg. Customer Value", value: formatAed(avgCustomerValue) },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
        Requires customer-level transaction history. Shown here as prototype sample data.
      </p>
    </div>
  )
}
