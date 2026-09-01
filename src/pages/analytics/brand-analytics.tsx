import * as React from "react"
import { useParams } from "react-router-dom"
import { Store, TrendingUp, Receipt, Coins, Target, Users, Megaphone, Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, CHART_METRIC_OPTIONS, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { EngagementFunnel } from "@/components/analytics/engagement-funnel"
import { CampaignComparisonTable } from "@/components/analytics/campaign-comparison-table"
import { CustomerBehaviourPanel } from "@/components/analytics/customer-behaviour-panel"
import { ChannelMixPanel } from "@/components/analytics/channel-mix-panel"
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { TransactionSection } from "@/components/analytics/transaction-section"
import { MERCHANT, brandById, campaignsForBrand } from "@/lib/data"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, dateRangeLabel, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import {
  aggregatePerformance,
  aggregateChannelPerformance,
  bucketSeries,
  sumSeriesInRange,
  previousPeriod,
  percentChange,
  generateTransactionRows,
  getCampaignPerformance,
} from "@/lib/mock-performance"
import { computeLocationStats } from "@/lib/transaction-stats"
import { trendCaption } from "@/lib/insights"
import { downloadCsv } from "@/lib/csv-export"

/**
 * Brand Analytics — "How is this specific brand performing across its campaigns, customers,
 * channels and locations?" One level below the portfolio: everything here is scoped to a
 * single brand. Deliberately does not repeat the Merchant-level portfolio widgets (brand
 * comparison, portfolio budget rollup) — this page is about understanding one brand deeply.
 */
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
  const periodLabel = dateRangeLabel(filters.dateRange)

  const online = React.useMemo(() => aggregateChannelPerformance(filteredCampaigns, "online"), [filteredCampaigns])
  const inStore = React.useMemo(() => aggregateChannelPerformance(filteredCampaigns, "in_store"), [filteredCampaigns])

  const customerRatio = cohortPerf.transactions > 0 ? cohortPerf.customersTransacted / cohortPerf.transactions : 0
  const locationStats = React.useMemo(() => computeLocationStats(transactionRows, customerRatio), [transactionRows, customerRatio])

  const activeCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active").length, [filteredCampaigns])

  const chartMetricValue = { gmv: current.transactionValue, transactions: current.transactions, cashback: current.cashbackIssued, roi: current.roi, aov: current.avgTransactionValue }[chartMetric]
  const chartMetricPrev = { gmv: previous.transactionValue, transactions: previous.transactions, cashback: previous.cashbackIssued, roi: previous.roi, aov: previous.avgTransactionValue }[chartMetric]
  const chartCaption = trendCaption(CHART_METRIC_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "GMV", percentChange(chartMetricValue, chartMetricPrev))

  function handleDownloadReport() {
    downloadCsv(
      `${brand?.slug ?? "brand"}-campaign-performance.csv`,
      filteredCampaigns.map((c) => {
        const perf = getCampaignPerformance(c)
        return {
          Campaign: c.name,
          Status: c.status,
          Bank: c.distributionBank,
          GMV: perf.transactionValue,
          Transactions: perf.transactions,
          Customers: perf.customersTransacted,
          Cashback: perf.cashbackIssued,
          ROI: perf.roi.toFixed(2),
          "Budget Used %": perf.utilizationPct.toFixed(1),
        }
      })
    )
  }

  if (!brand) {
    return <EmptyState icon={<Store className="size-6" />} title="Brand not found" description="This brand doesn't exist in the sample dataset." />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Merchant Analytics", to: "/analytics" }, { label: brand.name }]}
        title={
          <>
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} />
            {brand.name}
          </>
        }
        description={`${MERCHANT.name} · ${brand.website}`}
        meta={<span>{allCampaigns.length} campaigns total</span>}
        showPrototypeTag
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadReport}>
            <Download className="size-3.5" />
            Download report
          </Button>
        }
      />

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* 1. Brand Overview */}
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
              icon={<Coins className="size-4" />}
              label="Cashback"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard icon={<Target className="size-4" />} label="ROI" value={formatRatio(current.roi)} deltaPct={percentChange(current.roi, previous.roi)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Users className="size-4" />} label="Customers" value={formatNumber(cohortPerf.customersTransacted)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Megaphone className="size-4" />} label="Active Campaigns" value={formatNumber(activeCampaigns)} hint="In this range" tier="live" />
          </KpiGrid>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* 2. Cashback & Spend Over Time */}
          <section className="mt-12">
            <SectionCard
              title="Cashback & Spend Over Time"
              description="Is this brand's performance improving or declining?"
              contentClassName="pt-2"
              actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}
            >
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
              {chartCaption && <p className="mt-3 border-t border-border/70 px-1 pt-4 text-xs text-muted-foreground">{chartCaption}</p>}
            </SectionCard>
          </section>

          {/* 3. Engagement Funnel */}
          <section className="mt-12">
            <SectionCard title="Engagement Funnel" description="From offer shown to cashback rewarded">
              <EngagementFunnel perf={cohortPerf} />
            </SectionCard>
          </section>

          {/* 4. Campaign Performance — which campaign generates this brand's GMV? */}
          <section className="mt-12">
            <SectionCard title="Campaign Performance" description="Every campaign for this brand. Click one to open its analytics." contentClassName="px-5 pb-5">
              <CampaignComparisonTable campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* 5. Customer Behaviour */}
          <section className="mt-12">
            <SectionCard title="Customer Behaviour" description="Who this brand's cashback program is reaching">
              <CustomerBehaviourPanel
                totalCustomers={cohortPerf.customersTransacted}
                newCustomers={cohortPerf.newCustomers}
                returningCustomers={cohortPerf.returningCustomers}
                repeatPurchaseRate={cohortPerf.repeatPurchaseRate}
                transactions={cohortPerf.transactions}
                transactionValue={cohortPerf.transactionValue}
              />
            </SectionCard>
          </section>

          {/* 6. Channel Performance */}
          <section className="mt-12">
            <SectionCard title="Channel Performance" description="Online vs. in-store mix for this brand">
              <ChannelMixPanel online={online} inStore={inStore} />
            </SectionCard>
          </section>

          {/* 7. Location / Store Performance */}
          <section className="mt-12">
            <SectionCard title="Location Performance" description="This brand's strongest locations, by GMV" contentClassName="px-5 pb-5">
              <LocationPerformanceTable locations={locationStats} />
            </SectionCard>
          </section>

          {/* 8. Why Transactions Didn't Qualify */}
          <section className="mt-12">
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* 9. Recent Transactions */}
          <section className="mt-12">
            <SectionCard title="Recent Transactions" description="Individual transactions behind the numbers above" contentClassName="px-5 pb-5">
              <TransactionSection rows={transactionRows} showCampaign />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
