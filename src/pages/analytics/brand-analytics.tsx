import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Store, TrendingUp, Receipt, Coins, Target, Users, UserPlus, Repeat, Wallet, Download, BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { CampaignPerformanceTable, type CampaignPerformanceRow } from "@/components/analytics/campaign-performance-table"
import { CustomerDemographicsPanel } from "@/components/analytics/customer-demographics-panel"
import { CustomerValuePanel } from "@/components/analytics/customer-value-panel"
import { NewReturningPanel } from "@/components/analytics/new-returning-panel"
import { PurchaseFrequencyPanel } from "@/components/analytics/purchase-frequency-panel"
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table"
import { ChannelBehaviourPanel } from "@/components/analytics/channel-behaviour-panel"
import { EngagementFunnel } from "@/components/analytics/engagement-funnel"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { MERCHANT, brandById, campaignsForBrand } from "@/lib/data"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, dateRangeLabel, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import {
  aggregatePerformance,
  bucketSeries,
  sumSeriesInRange,
  previousPeriod,
  percentChange,
  generateTransactionRows,
  getCampaignPerformance,
  aggregateDemographics,
  getCustomerValueDistribution,
  getNewReturningStats,
  getPurchaseFrequency,
} from "@/lib/mock-performance"
import { computeLocationStats, computeChannelBehavior } from "@/lib/transaction-stats"
import { trendCaption } from "@/lib/insights"
import { downloadCsv } from "@/lib/csv-export"

const BRAND_CHART_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
]

/**
 * Brand Analytics — the main Analytics landing experience for the merchant's brand. "How is this
 * brand performing, which campaign is leading, who are its customers, and where does it move?"
 * The merchant only has access to their own brand, so there is no cross-brand switcher here.
 *
 * KPIs and every customer/qualification/engagement widget below all read from `cohortPerf` (the
 * same aggregate over the same filtered campaign set) so a number never disagrees with itself
 * between sections — the one exception is the time-series chart, which necessarily reads from
 * the daily series to plot a real calendar trend.
 */
export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const navigate = useNavigate()
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

  const customerRatio = cohortPerf.transactions > 0 ? cohortPerf.customersTransacted / cohortPerf.transactions : 0
  const locationStats = React.useMemo(() => computeLocationStats(transactionRows, customerRatio, brandId), [transactionRows, customerRatio, brandId])
  const channelStats = React.useMemo(() => computeChannelBehavior(transactionRows), [transactionRows])

  const demographics = React.useMemo(() => aggregateDemographics(filteredCampaigns), [filteredCampaigns])
  const valueBuckets = React.useMemo(() => getCustomerValueDistribution(filteredCampaigns), [filteredCampaigns])
  const newReturningStats = React.useMemo(() => getNewReturningStats(filteredCampaigns), [filteredCampaigns])
  const freqBuckets = React.useMemo(() => getPurchaseFrequency(filteredCampaigns), [filteredCampaigns])

  const avgCustomerValue = cohortPerf.customersTransacted > 0 ? cohortPerf.transactionValue / cohortPerf.customersTransacted : 0

  // Ranked/tabular performance views only make sense for campaigns that have actually started.
  const performanceCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active" || c.status === "completed"), [filteredCampaigns])
  const rankedCampaigns = React.useMemo(() => performanceCampaigns.map((c) => ({ campaign: c, perf: getCampaignPerformance(c) })), [performanceCampaigns])

  const campaignRows: CampaignPerformanceRow[] = React.useMemo(
    () =>
      rankedCampaigns.map(({ campaign, perf }) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        gmv: perf.transactionValue,
        transactions: perf.transactions,
        roi: perf.roi,
        cashback: perf.cashbackIssued,
        utilizationPct: perf.utilizationPct,
      })),
    [rankedCampaigns]
  )

  const chartMetricValue = { gmv: current.transactionValue, transactions: current.transactions, cashback: current.cashbackIssued, roi: current.roi, aov: current.avgTransactionValue }[chartMetric]
  const chartMetricPrev = { gmv: previous.transactionValue, transactions: previous.transactions, cashback: previous.cashbackIssued, roi: previous.roi, aov: previous.avgTransactionValue }[chartMetric]
  const chartLabel = BRAND_CHART_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "GMV"
  const chartCaption = trendCaption(`Campaign ${chartLabel}`, percentChange(chartMetricValue, chartMetricPrev))

  function handleDownloadReport() {
    downloadCsv(
      `${brand?.slug ?? "brand"}-campaign-performance.csv`,
      performanceCampaigns.map((c) => {
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
      <PageHeader title="Analytics" showPrototypeTag />

      {/* The brand's context — a secondary heading, not the page title. No brand switcher: a
          merchant user only has access to their own brand. */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />
            <h2 className="text-xl font-bold text-foreground">{brand.name}</h2>
            <Badge variant="outline">{MERCHANT.name}</Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">Performance and customer insights for {brand.name}.</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={handleDownloadReport}>
          <Download className="size-3.5" />
          Download report
        </Button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* Overview — the brand's six core performance KPIs, all equal weight */}
          <KpiGrid>
            <KpiCard icon={<TrendingUp className="size-[18px]" />} label="Total GMV" value={formatAed(cohortPerf.transactionValue)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Receipt className="size-[18px]" />} label="Transactions" value={formatNumber(cohortPerf.transactions)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Target className="size-[18px]" />} label="ROI" value={formatRatio(cohortPerf.roi)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Coins className="size-[18px]" />} label="Cashback Issued" value={formatAed(cohortPerf.cashbackIssued)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard icon={<Users className="size-[18px]" />} label="Customers" value={formatNumber(cohortPerf.customersTransacted)} hint={periodLabel} tier="transaction" showTierBadge={false} />
            <KpiCard
              icon={<BarChart3 className="size-[18px]" />}
              label="Avg. Transaction Value"
              value={formatAed(cohortPerf.avgTransactionValue)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
          </KpiGrid>

          {/* Campaign Performance — aggregate trend across all of this brand's campaigns, then the full comparison table */}
          <section className="mt-12">
            <SectionCard
              title="Campaign Performance"
              description="GMV and transaction trends across the selected period"
              contentClassName="pt-2"
              actions={<PillToggle value={chartMetric} onChange={setChartMetric} options={BRAND_CHART_OPTIONS} />}
            >
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
              {chartCaption && <p className="mt-3 border-t border-border/70 px-1 pt-4 text-sm font-medium text-foreground">{chartCaption}</p>}
            </SectionCard>
          </section>

          <section className="mt-6">
            <SectionCard title="All Campaigns" description="Every live and completed campaign for this brand. Sort a column, or click a row to open its analytics.">
              <CampaignPerformanceTable
                rows={campaignRows}
                onSelect={(id) => navigate(`/analytics/campaigns/${id}`)}
                emptyTitle="No campaigns in this range"
                emptyDescription={`${brand.name} has no active or completed campaigns in this range. Widen the date range to see more.`}
              />
            </SectionCard>
          </section>

          {/* Customer Insights — reach, demographics, value, frequency and retention */}
          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground">Customer Insights</h2>
              <p className="mt-1 text-sm text-muted-foreground">Who this brand's campaigns are reaching and converting</p>
            </div>

            <KpiGrid>
              <KpiCard
                icon={<Users className="size-[18px]" />}
                label="Customers Reached"
                value={formatNumber(cohortPerf.customersReached)}
                hint={`Shown an offer · ${periodLabel}`}
                tier="transaction"
                showTierBadge={false}
              />
              <KpiCard
                icon={<Users className="size-[18px]" />}
                label="Customers Who Transacted"
                value={formatNumber(cohortPerf.customersTransacted)}
                hint={periodLabel}
                tier="transaction"
                showTierBadge={false}
              />
              <KpiCard
                icon={<UserPlus className="size-[18px]" />}
                label="New Customers"
                value={formatNumber(cohortPerf.newCustomers)}
                hint={periodLabel}
                tier="transaction"
                showTierBadge={false}
              />
              <KpiCard
                icon={<Repeat className="size-[18px]" />}
                label="Returning Customers"
                value={formatNumber(cohortPerf.returningCustomers)}
                hint={periodLabel}
                tier="transaction"
                showTierBadge={false}
              />
              <KpiCard
                icon={<Wallet className="size-[18px]" />}
                label="Avg. Customer Value"
                value={formatAed(avgCustomerValue)}
                hint={periodLabel}
                tier="transaction"
                showTierBadge={false}
              />
            </KpiGrid>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionCard title="Customer Demographics" description="Age and gender breakdown of customers reached">
                <CustomerDemographicsPanel demographics={demographics} />
              </SectionCard>
              <SectionCard title="New vs. Returning Customers" description="Acquisition vs. retention, and how each segment's value compares">
                <NewReturningPanel stats={newReturningStats} />
              </SectionCard>
              <SectionCard title="Customer Value" description="How much customers spend, in total, across all campaigns">
                <CustomerValuePanel buckets={valueBuckets} />
              </SectionCard>
              <SectionCard title="Purchase Frequency" description="How many times customers purchased">
                <PurchaseFrequencyPanel buckets={freqBuckets} />
              </SectionCard>
            </div>
          </section>

          {/* Engagement — a distinct section from Customer Insights: how exposure converts to transactions */}
          <section className="mt-12">
            <SectionCard title="Engagement" description="How customers move from offer exposure to completed transactions, aggregated across this brand's campaigns">
              <EngagementFunnel perf={cohortPerf} />
            </SectionCard>
          </section>

          {/* Qualification Insights */}
          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Channel Behaviour" description="Online vs. in-store, compared">
              <ChannelBehaviourPanel stats={channelStats} metrics={["gmv", "customers", "aov", "repeatRate"]} />
            </SectionCard>
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* Location Performance */}
          <section className="mt-12">
            <SectionCard title="Top Locations" description="This brand's strongest store locations, by GMV">
              <LocationPerformanceTable locations={locationStats} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
