import { DonutChart } from "./donut-chart"
import { formatAed, formatCompactAed, formatPercent } from "@/lib/utils"

export type AllocationItem = { name: string; budget: number; gmv: number; color: string }

/** How cashback budget is distributed across brands, compared against each brand's share of portfolio GMV. */
export function BudgetAllocationPanel({ items }: { items: AllocationItem[] }) {
  const totalBudget = items.reduce((s, i) => s + i.budget, 0)
  const totalGmv = items.reduce((s, i) => s + i.gmv, 0)
  const withShares = items
    .map((i) => ({ ...i, budgetShare: totalBudget > 0 ? (i.budget / totalBudget) * 100 : 0, gmvShare: totalGmv > 0 ? (i.gmv / totalGmv) * 100 : 0 }))
    .sort((a, b) => b.budget - a.budget)
  const mostOverIndexed = [...withShares].sort((a, b) => b.gmvShare - b.budgetShare - (a.gmvShare - a.budgetShare))[0]

  return (
    <div>
      <DonutChart
        segments={withShares.map((i) => ({ label: i.name, value: i.budget, color: i.color }))}
        formatValue={formatAed}
        centerLabel="Total Budget"
        centerValue={formatCompactAed(totalBudget)}
      />
      <div className="mt-5 space-y-2 border-t border-border pt-4">
        {withShares.map((i) => (
          <div key={i.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: i.color }} />
              {i.name}
            </span>
            <span className="text-muted-foreground">
              {formatPercent(i.budgetShare, 0)} budget <span className="text-foreground">·</span> {formatPercent(i.gmvShare, 0)} GMV
            </span>
          </div>
        ))}
      </div>
      {mostOverIndexed && mostOverIndexed.gmvShare - mostOverIndexed.budgetShare > 3 && (
        <p className="mt-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{mostOverIndexed.name}</span> receives {formatPercent(mostOverIndexed.budgetShare, 0)} of cashback budget but generates{" "}
          {formatPercent(mostOverIndexed.gmvShare, 0)} of portfolio GMV.
        </p>
      )}
    </div>
  )
}
