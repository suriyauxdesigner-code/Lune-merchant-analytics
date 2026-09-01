import * as React from "react"
import { useParams } from "react-router-dom"
import { Store } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiStrip } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { BusinessImpactFlow } from "@/components/analytics/business-impact-flow"
import { CampaignComparisonTable } from "@/components/analytics/campaign-comparison-table"
import { CustomerImpactSection } from "@/components/analytics/customer-impact-section"
import { ChannelComparisonCards } from "@/components/analytics/channel-comparison-cards"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { TransactionLogTable } from "@/components/analytics/transaction-log-table"
import { brandById, campaignsForBrand } from "@/lib/data"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries, sumSeriesInRange, previousPeriod, percentChange, generateTransactionRows } from "@/lib/mock-performance"

export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const brand = brandById(brandId)
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")

  const allCampaigns = React.useMemo(() => campaignsForBrand(brandId), [brandId])
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(allCampaigns, filters), [allCampaigns, filters])
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(allCampaigns, filters), [allCampaigns, filters])

  const range = resolveDateRange(filters.dateRange, filters.customRange)
  const prevRange = React.useMemo(() => previousPeriod(range), [range])
  const mergedDaily = React.useMemo(() => aggregatePerformance(nonDateCampaigns).dailySeries, [nonDateCampaigns])

  const current = React.useMemo(() => sumSeriesInRange(mergedDaily, range), [mergedDaily, range])
  const previous = React.useMemo(() => sumSeriesInRange(mergedDaily, prevRange), [mergedDaily, prevRange])
  const chartSeries = React.useMemo(() => bucketSeries(mergedDaily, range), [mergedDaily, range])

  const cohortPerf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const transactionRows = React.useMemo(() => generateTransactionRows(filteredCampaigns), [filteredCampaigns])

  if (!brand) {
    return <EmptyState icon={<Store className="size-6" />} title="Brand not found" description="This brand doesn't exist in the sample dataset." />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Analytics", to: "/analytics" }, { label: brand.name }]}
        title={
          <>
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} />
            {brand.name}
          </>
        }
        description={`Brand Analytics · ${brand.website}`}
        showPrototypeTag
      />

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* Executive Performance */}
          <KpiStrip>
            <KpiCard variant="plain" label="GMV" value={formatAed(current.transactionValue)} deltaPct={percentChange(current.transactionValue, previous.transactionValue)} tier="transaction" showTierBadge={false} />
            <KpiCard
              variant="plain"
              label="Transactions"
              value={formatNumber(current.transactions)}
              deltaPct={percentChange(current.transactions, previous.transactions)}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              variant="plain"
              size="md"
              label="Cashback Issued"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard variant="plain" size="md" label="ROI" value={formatRatio(current.roi)} deltaPct={percentChange(current.roi, previous.roi)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Budget Utilization" value={formatPercent(cohortPerf.utilizationPct)} tier="transaction" showTierBadge={false} />
            <KpiCard
              variant="plain"
              size="md"
              label="Avg. Transaction Value"
              value={formatAed(current.avgTransactionValue)}
              deltaPct={percentChange(current.avgTransactionValue, previous.avgTransactionValue)}
              tier="transaction"
              showTierBadge={false}
            />
          </KpiStrip>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* Business Impact */}
          <section className="mt-12">
            <SectionCard title="Business Impact" description="How cashback investment turned into business generated for this brand">
              <BusinessImpactFlow cashbackIssued={current.cashbackIssued} transactions={current.transactions} transactionValue={current.transactionValue} roi={current.roi} />
            </SectionCard>
          </section>

          {/* Performance Over Time */}
          <section className="mt-12">
            <SectionCard title="Performance Over Time" description="Is performance improving or declining?" contentClassName="pt-2" actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}>
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
            </SectionCard>
          </section>

          {/* Campaign Performance */}
          <section className="mt-12">
            <SectionCard title="Campaign Performance" description="Which campaigns are driving this brand's results. Click one to open its analytics." contentClassName="px-5 pb-5">
              <CampaignComparisonTable campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* Customer Impact */}
          <section className="mt-12">
            <SectionCard title="Customer Impact" description="From offer shown to cashback rewarded">
              <CustomerImpactSection perf={cohortPerf} />
            </SectionCard>
          </section>

          {/* Channel Performance */}
          <section className="mt-12">
            <SectionCard title="Channel Performance" description="GMV, cashback and ROI by channel">
              <ChannelComparisonCards campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* Qualification */}
          <section className="mt-12">
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* Transaction Detail */}
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
