import * as React from "react"
import { PageHeader } from "@/components/shared/page-header"
import { SectionHeading } from "@/components/shared/section-heading"
import { KpiCard, KpiStrip } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMode } from "@/components/analytics/performance-over-time-chart"
import { BudgetHealthPanel } from "@/components/analytics/budget-health-panel"
import { PerformanceBreakdown } from "@/components/analytics/performance-breakdown"
import { CustomerInsightsPreview } from "@/components/analytics/customer-insights-preview"
import { BRANDS, CAMPAIGNS } from "@/lib/data"
import { cn, formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

export default function AnalyticsOverview() {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMode, setChartMode] = React.useState<ChartMode>("value")
  const breakdownRef = React.useRef<HTMLDivElement>(null)

  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, filters), [filters])
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(CAMPAIGNS, filters), [filters])
  const range = resolveDateRange(filters.dateRange, filters.customRange)

  const perf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const chartSeries = React.useMemo(() => {
    const fullSeries = aggregatePerformance(nonDateCampaigns).dailySeries
    return bucketSeries(fullSeries, range)
  }, [nonDateCampaigns, range])

  const brandIds = new Set(filteredCampaigns.map((c) => c.brandId))
  const activeCount = filteredCampaigns.filter((c) => c.status === "active").length
  const scheduledCount = filteredCampaigns.filter((c) => c.status === "scheduled").length
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)

  const statusCounts = React.useMemo(() => {
    const base: Record<CampaignStatus, number> = { active: 0, pending_approval: 0, scheduled: 0, completed: 0, rejected: 0 }
    for (const c of filteredCampaigns) base[c.status]++
    return base
  }, [filteredCampaigns])

  const visibleBrands = BRANDS.filter((b) => filteredCampaigns.some((c) => c.brandId === b.id))

  function reviewStatus(status: CampaignStatus) {
    setFilters((f) => ({ ...f, status }))
    breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Monitor campaign activity, brands, budgets and performance across your business." showPrototypeTag />
      <p className="-mt-5 mb-7 text-sm text-muted-foreground">
        {visibleBrands.length} brand{visibleBrands.length === 1 ? "" : "s"} · {filteredCampaigns.length} campaign{filteredCampaigns.length === 1 ? "" : "s"} · {activeCount} active ·{" "}
        {scheduledCount} scheduled
      </p>

      <FilterBar filters={filters} onChange={setFilters} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* Level 1 — how are we performing? */}
          <KpiStrip>
            <KpiCard variant="plain" label="Transaction Value" value={formatAed(perf.transactionValue)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" label="Cashback Issued" value={formatAed(perf.cashbackIssued)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Transactions" value={formatNumber(perf.transactions)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Avg. Transaction Value" value={formatAed(perf.avgTransactionValue)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Budget Utilization" value={formatPercent(perf.utilizationPct)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Configured Budget" value={formatAed(totalBudget)} />
          </KpiStrip>
          <p className="mt-2 text-xs text-muted-foreground">Transaction and cashback figures are prototype estimates — they require transaction/settlement data.</p>

          <section className="mt-12">
            <SectionHeading
              title="Performance Over Time"
              description="Is performance improving or declining?"
              actions={
                <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
                  {(["value", "transactions"] as ChartMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMode(m)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        chartMode === m ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === "value" ? "Value" : "Transactions"}
                    </button>
                  ))}
                </div>
              }
            />
            <PerformanceOverTimeChart data={chartSeries} mode={chartMode} />
          </section>

          {/* Level 2 — are we healthy, and what's happening with customers? */}
          <section className="mt-14 grid gap-6 lg:grid-cols-2 lg:items-start">
            <BudgetHealthPanel budget={totalBudget} perf={perf} statusCounts={statusCounts} onReviewStatus={reviewStatus} />
            <CustomerInsightsPreview perf={perf} />
          </section>

          {/* Level 3 — where is performance coming from? */}
          <section className="mt-14" ref={breakdownRef}>
            <SectionCard title="Performance Breakdown" description="Compare performance across brands, channels and campaigns" contentClassName="px-5 pb-5">
              <PerformanceBreakdown campaigns={filteredCampaigns} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
