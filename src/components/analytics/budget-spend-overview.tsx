import { MetricTiles } from "./metric-tiles"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"

/** Portfolio-level budget allocation — "are my brands using their budgets efficiently overall?" */
export function BudgetSpendOverview({
  budget,
  cashbackIssued,
  remainingBudget,
  utilizationPct,
  nearLimitCount,
}: {
  budget: number
  cashbackIssued: number
  remainingBudget: number
  utilizationPct: number
  nearLimitCount: number
}) {
  return (
    <MetricTiles
      columns={5}
      showTierBadges={false}
      items={[
        { key: "allocated", label: "Total Allocated Budget", value: formatAed(budget) },
        { key: "spent", label: "Cashback Spent", value: formatAed(cashbackIssued) },
        { key: "remaining", label: "Remaining Budget", value: formatAed(remainingBudget) },
        { key: "utilization", label: "Budget Utilization", value: formatPercent(utilizationPct) },
        { key: "near-limit", label: "Campaigns Near Budget Limit", value: formatNumber(nearLimitCount) },
      ]}
    />
  )
}
