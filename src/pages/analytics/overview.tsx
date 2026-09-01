import * as React from "react"
import { TrendingUp, Receipt, Coins, Target, Store, Megaphone } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { BrandComparisonTable } from "@/components/analytics/brand-comparison-table"
import { CampaignTable } from "@/components/analytics/campaign-table"
import { BudgetSpendOverview } from "@/components/analytics/budget-spend-overview"
import { KeyInsights } from "@/components/analytics/key-insights"
import { BRANDS, CAMPAIGNS } from "@/lib/data"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, dateRangeLabel, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import {
  aggregatePerformance,
  bucketSeries,
  bucketByDayOfWeek,
  sumSeriesInRange,
  previousPeriod,
  percentChange,
  getCampaignPerformance,
} from "@/lib/mock-performance"
import { generatePortfolioInsights } from "@/lib/insights"

/**
 * Merchant Analytics — "How is my entire Pulse program performing across all my brands and
 * campaigns?" A portfolio management page: compare brands and campaigns, track budget
 * allocation, surface what needs attention. Deliberately does not repeat brand- or
 * campaign-scoped analysis (funnels, channel mix, transaction logs) — that lives one and two
 * levels down.
 */
export default function AnalyticsOverview() {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")

  // Cohort: campaigns matching all filters, including date range (created-in-range). Powers
  // brand/campaign comparison, where "which brand/campaign" is the question being answered.
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, filters), [filters])
  // Everything except date — used to build the full activity timeline so period comparisons and
  // the chart aren't blind to activity from campaigns created just outside the selected window.
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(CAMPAIGNS, filters), [filters])

  const range = resolveDateRange(filters.dateRange, filters.customRange)
  const prevRange = React.useMemo(() => previousPeriod(range), [range])
  const mergedDaily = React.useMemo(() => aggregatePerformance(nonDateCampaigns).dailySeries, [nonDateCampaigns])

  // Period totals: how the portfolio performed in the selected window vs. the one before it.
  const current = React.useMemo(() => sumSeriesInRange(mergedDaily, range), [mergedDaily, range])
  const previous = React.useMemo(() => sumSeriesInRange(mergedDaily, prevRange), [mergedDaily, prevRange])
  const chartSeries = React.useMemo(() => bucketSeries(mergedDaily, range), [mergedDaily, range])

  // Cohort totals: portfolio-level budget/insights detail.
  const cohortPerf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const periodLabel = dateRangeLabel(filters.dateRange)

  const activeCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active"), [filteredCampaigns])
  const activeBrandCount = React.useMemo(() => new Set(activeCampaigns.map((c) => c.brandId)).size, [activeCampaigns])
  const nearLimitCount = React.useMemo(
    () => filteredCampaigns.filter((c) => getCampaignPerformance(c).hasStarted && getCampaignPerformance(c).utilizationPct >= 80).length,
    [filteredCampaigns]
  )

  const portfolioInsights = React.useMemo(() => {
    const brandStats = BRANDS.map((b) => {
      const perf = aggregatePerformance(filteredCampaigns.filter((c) => c.brandId === b.id))
      return { name: b.name, gmv: perf.transactionValue, utilizationPct: perf.utilizationPct }
    })
    const campaignRois = filteredCampaigns.map((c) => getCampaignPerformance(c)).filter((p) => p.hasStarted).map((p) => p.roi)
    return generatePortfolioInsights({
      brands: brandStats,
      campaignRois,
      portfolioAvgRoi: cohortPerf.roi,
      weekday: bucketByDayOfWeek(cohortPerf.dailySeries),
    })
  }, [filteredCampaigns, cohortPerf])

  return (
    <div>
      <PageHeader
        title="Merchant Analytics"
        description="How is your Pulse cashback program performing across every brand and campaign you own?"
        showPrototypeTag
      />

      <FilterBar filters={filters} onChange={setFilters} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* 1. Portfolio Overview */}
          <KpiGrid>
            <KpiCard
              icon={<TrendingUp className="size-4" />}
              label="Total GMV"
              value={formatAed(current.transactionValue)}
              deltaPct={percentChange(current.transactionValue, previous.transactionValue)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Coins className="size-4" />}
              label="Total Cashback"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Receipt className="size-4" />}
              label="Total Transactions"
              value={formatNumber(current.transactions)}
              deltaPct={percentChange(current.transactions, previous.transactions)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard icon={<Store className="size-4" />} label="Active Brands" value={formatNumber(activeBrandCount)} hint="Currently running a campaign" tier="live" />
            <KpiCard icon={<Megaphone className="size-4" />} label="Active Campaigns" value={formatNumber(activeCampaigns.length)} hint="Across all brands" tier="live" />
            <KpiCard
              icon={<Target className="size-4" />}
              label="Portfolio ROI"
              value={formatRatio(current.roi)}
              deltaPct={percentChange(current.roi, previous.roi)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
          </KpiGrid>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* 2. Portfolio Performance Over Time */}
          <section className="mt-12">
            <SectionCard
              title="Portfolio Performance Over Time"
              description="Cashback and spend trend across every brand"
              contentClassName="pt-2"
              actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}
            >
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
            </SectionCard>
          </section>

          {/* 3. Brand Performance — which brand generates the most GMV? */}
          <section className="mt-12">
            <SectionCard title="Brand Performance" description="Compare brands. Click one to open its analytics." contentClassName="px-5 pb-5">
              <BrandComparisonTable brands={BRANDS} campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* 4. Campaign Performance — across the whole portfolio */}
          <section className="mt-12">
            <SectionCard title="Campaign Performance" description="Every campaign across every brand, sorted by GMV. Click one to open its analytics." contentClassName="px-5 pb-5">
              <CampaignTable campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* 5. Budget & Spend Overview — are brands using their budgets efficiently? */}
          <section className="mt-12">
            <SectionCard title="Budget & Spend Overview" description="Portfolio-wide budget allocation" contentClassName="px-5 pb-5">
              <BudgetSpendOverview
                budget={cohortPerf.budget}
                cashbackIssued={cohortPerf.cashbackIssued}
                remainingBudget={cohortPerf.remainingBudget}
                utilizationPct={cohortPerf.utilizationPct}
                nearLimitCount={nearLimitCount}
              />
            </SectionCard>
          </section>

          {/* 6. Portfolio Insights — where should I take action? */}
          <section className="mt-12">
            <SectionCard title="Portfolio Insights" description="Data-driven takeaways across your portfolio">
              <KeyInsights insights={portfolioInsights} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
