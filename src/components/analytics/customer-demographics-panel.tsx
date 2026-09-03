import * as React from "react"
import { CategoryBarChart } from "./category-bar-chart"
import { DonutChart } from "./donut-chart"
import { PillToggle } from "./pill-toggle"
import { formatAed, formatCompactAed, formatNumber, formatPercent } from "@/lib/utils"
import type { CustomerDemographics } from "@/lib/mock-performance"

const GENDER_COLORS: Record<string, string> = { Female: "hsl(340 70% 50%)", Male: "hsl(217 91% 55%)" }
type Metric = "customers" | "gmv" | "transactions"
const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "customers", label: "Customers" },
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
]

/** Who responded — age distribution and gender split. */
export function CustomerDemographicsPanel({ demographics }: { demographics: CustomerDemographics }) {
  const [metric, setMetric] = React.useState<Metric>("customers")
  const format = metric === "gmv" ? formatCompactAed : formatNumber

  const topAge = [...demographics.byAge].sort((a, b) => b.customers - a.customers)[0]
  const topAgeGmvShare = demographics.totalGmv > 0 && topAge ? (topAge.gmv / demographics.totalGmv) * 100 : 0

  return (
    <div className="flex h-full flex-col">
      {/* Age and Gender are always stacked, never side-by-side — this card lives inside an outer
          2-column grid (Customer Insights) that can halve its width at any breakpoint a side-by-side
          split might otherwise use, which previously squeezed the Gender donut into a column too
          narrow for it and let it overflow, uncontained, into the neighbouring card. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-muted-foreground">Age distribution</p>
          <PillToggle value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
        </div>
        <CategoryBarChart data={demographics.byAge.map((b) => ({ label: b.ageBand, value: b[metric] }))} formatValue={format} fill />
      </div>
      <div className="mt-6 min-w-0 border-t border-border pt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Gender</p>
        <DonutChart
          segments={demographics.byGender.map((g) => ({ label: g.gender, value: g.customers, color: GENDER_COLORS[g.gender] }))}
          formatValue={formatNumber}
          centerLabel="Customers"
          centerValue={formatCompactAed(demographics.totalCustomers).replace("AED ", "")}
          size={140}
        />
      </div>
      {topAge && (
        <p className="mt-5 border-t border-border pt-4 text-sm font-medium text-foreground">
          <span className="font-bold">{topAge.ageBand}</span> is the largest customer segment, contributing{" "}
          <span className="font-bold">{formatPercent(topAgeGmvShare, 0)}</span> of GMV ({formatAed(topAge.gmv)}).
        </p>
      )}
    </div>
  )
}
