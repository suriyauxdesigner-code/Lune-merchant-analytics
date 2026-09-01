import * as React from "react"
import { TrendingUp, Receipt, Coins, Target, Gauge, BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { BusinessImpactFlow } from "@/components/analytics/business-impact-flow"
import { CustomerImpactSection } from "@/components/analytics/customer-impact-section"
import { ChannelComparisonCards } from "@/components/analytics/channel-comparison-cards"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { TransactionLogTable } from "@/components/analytics/transaction-log-table"
import { CampaignTable } from "@/components/analytics/campaign-table"
import { CAMPAIGNS } from "@/lib/data"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, dateRangeLabel, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries, sumSeriesInRange, previousPeriod, percentChange, generateTransactionRows } from "@/lib/mock-performance"

export default function AnalyticsOverview() {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")

  // Cohort: campaigns matching all filters, including date range (created-in-range). Powers the
  // campaign-level breakdown sections, where "which campaigns" is the question being answered.
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, filters), [filters])
  // Everything except date — used to build the full activity timeline so period comparisons and
  // the chart aren't blind to activity from campaigns created just outside the selected window.
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(CAMPAIGNS, filters), [filters])

  const range = resolveDateRange(filters.dateRange, filters.customRange)
  const prevRange = React.useMemo(() => previousPeriod(range), [range])
  const mergedDaily = React.useMemo(() => aggregatePerformance(nonDateCampaigns).dailySeries, [nonDateCampaigns])

  // Period totals: how the business performed in the selected window vs. the one before it.
  const current = React.useMemo(() => sumSeriesInRange(mergedDaily, range), [mergedDaily, range])
  const previous = React.useMemo(() => sumSeriesInRange(mergedDaily, prevRange), [mergedDaily, prevRange])
  const chartSeries = React.useMemo(() => bucketSeries(mergedDaily, range), [mergedDaily, range])

  // Cohort totals: campaign-level detail (budget, breakdowns, funnel, qualification, transaction log).
  const cohortPerf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)
  const transactionRows = React.useMemo(() => generateTransactionRows(filteredCampaigns), [filteredCampaigns])
  const periodLabel = dateRangeLabel(filters.dateRange)

  return (
    <div>
      <PageHeader title="Analytics" description="Understand how your cashback campaigns are performing and impacting your business." showPrototypeTag />

      <FilterBar filters={filters} onChange={setFilters} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* 1. Executive Summary — how is my cashback program performing? */}
          <KpiGrid>
            <KpiCard
              icon={<TrendingUp className="size-4" />}
              label="GMV"
              value={formatAed(current.transactionValue)}
              deltaPct={percentChange(current.transactionValue, previous.transactionValue)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Receipt className="size-4" />}
              label="Transactions"
              value={formatNumber(current.transactions)}
              deltaPct={percentChange(current.transactions, previous.transactions)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              size="md"
              icon={<Coins className="size-4" />}
              label="Cashback Issued"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard size="md" icon={<Target className="size-4" />} label="ROI" value={formatRatio(current.roi)} deltaPct={percentChange(current.roi, previous.roi)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard size="md" icon={<Gauge className="size-4" />} label="Budget Utilization" value={formatPercent(cohortPerf.utilizationPct)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard
              size="md"
              icon={<BarChart3 className="size-4" />}
              label="Avg. Transaction Value"
              value={formatAed(current.avgTransactionValue)}
              deltaPct={percentChange(current.avgTransactionValue, previous.avgTransactionValue)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
          </KpiGrid>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* 2. Business Impact — what business impact did cashback create? */}
          <section className="mt-12">
            <SectionCard title="Business Impact" description="How cashback investment turned into business generated">
              <BusinessImpactFlow cashbackIssued={current.cashbackIssued} transactions={current.transactions} transactionValue={current.transactionValue} roi={current.roi} />
            </SectionCard>
          </section>

          {/* 3. Performance Over Time — how is performance changing? */}
          <section className="mt-12">
            <SectionCard title="Performance Over Time" description="Is performance improving or declining?" contentClassName="pt-2" actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}>
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
            </SectionCard>
          </section>

          {/* 4. Campaign Performance — which campaigns are driving results? */}
          <section className="mt-12">
            <SectionCard title="Campaign Performance" description="Sorted by GMV. Click a campaign to open its analytics." contentClassName="px-5 pb-5">
              <CampaignTable campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* 5. Customer Impact — how are customers responding? */}
          <section className="mt-12">
            <SectionCard title="Customer Impact" description="From offer shown to cashback rewarded">
              <CustomerImpactSection perf={cohortPerf} />
            </SectionCard>
          </section>

          {/* 6. Channel Performance — where am I performing best? */}
          <section className="mt-12">
            <SectionCard title="Channel Performance" description="GMV, cashback and ROI by channel">
              <ChannelComparisonCards campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* 7. Opportunities — where am I losing potential transactions? */}
          <section className="mt-12">
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* 8. Transaction Detail — what actually happened? */}
          <section className="mt-12">
            <SectionCard title="Transaction Log" description="Individual transactions behind the numbers above" contentClassName="px-5 pb-5">
              <TransactionLogTable rows={transactionRows} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
