import { MetricTiles } from "./metric-tiles"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"

/** Who is this brand's cashback program reaching, and are they coming back? */
export function CustomerBehaviourPanel({
  totalCustomers,
  newCustomers,
  returningCustomers,
  repeatPurchaseRate,
  transactions,
  transactionValue,
}: {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  repeatPurchaseRate: number
  transactions: number
  transactionValue: number
}) {
  const newPct = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0
  const returningPct = 100 - newPct
  const avgPurchasesPerCustomer = totalCustomers > 0 ? transactions / totalCustomers : 0
  const avgCustomerSpend = totalCustomers > 0 ? transactionValue / totalCustomers : 0

  return (
    <div>
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">New vs. Returning</span>
          <span className="text-muted-foreground">
            {formatPercent(newPct, 0)} new · {formatPercent(returningPct, 0)} returning
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${newPct}%` }} />
          <div className="h-full bg-info" style={{ width: `${returningPct}%` }} />
        </div>
      </div>
      <MetricTiles
        columns={3}
        showTierBadges={false}
        items={[
          { key: "total", label: "Total Customers", value: formatNumber(totalCustomers) },
          { key: "new", label: "New Customers", value: formatNumber(newCustomers) },
          { key: "returning", label: "Returning Customers", value: formatNumber(returningCustomers) },
          { key: "repeat", label: "Repeat Purchase Rate", value: formatPercent(repeatPurchaseRate * 100) },
          { key: "avg-purchases", label: "Avg. Purchases / Customer", value: avgPurchasesPerCustomer.toFixed(1) },
          { key: "avg-spend", label: "Avg. Customer Spend", value: formatAed(avgCustomerSpend) },
        ]}
      />
      <p className="mt-4 text-xs text-muted-foreground">Requires customer-level transaction history. Shown here as prototype sample data.</p>
    </div>
  )
}
