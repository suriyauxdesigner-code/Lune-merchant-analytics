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

/** Who responded — age distribution and gender split. `compact` drops the metric toggle for lighter, campaign-level use. */
export function CustomerDemographicsPanel({ demographics, compact = false }: { demographics: CustomerDemographics; compact?: boolean }) {
  const [metric, setMetric] = React.useState<Metric>("customers")
  const activeMetric = compact ? "customers" : metric
  const format = activeMetric === "gmv" ? formatCompactAed : formatNumber

  const topAge = [...demographics.byAge].sort((a, b) => b.customers - a.customers)[0]
  const topAgeGmvShare = demographics.totalGmv > 0 && topAge ? (topAge.gmv / demographics.totalGmv) * 100 : 0

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Age distribution</p>
            {!compact && <PillToggle value={metric} onChange={setMetric} options={METRIC_OPTIONS} />}
          </div>
          <CategoryBarChart data={demographics.byAge.map((b) => ({ label: b.ageBand, value: b[activeMetric] }))} formatValue={format} height={200} />
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Gender</p>
          <DonutChart
            segments={demographics.byGender.map((g) => ({ label: g.gender, value: g.customers, color: GENDER_COLORS[g.gender] }))}
            formatValue={formatNumber}
            centerLabel="Customers"
            centerValue={formatCompactAed(demographics.totalCustomers).replace("AED ", "")}
            size={150}
          />
        </div>
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
