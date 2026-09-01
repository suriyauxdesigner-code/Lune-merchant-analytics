import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Store, TrendingUp, Receipt, Coins, Target, Users, Megaphone, Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { Card, CardContent } from "@/components/ui/card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, CHART_METRIC_OPTIONS, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { RankedBarList } from "@/components/analytics/ranked-bar-list"
import { EngagementFunnel } from "@/components/analytics/engagement-funnel"
import { CampaignComparisonTable } from "@/components/analytics/campaign-comparison-table"
import { CustomerDemographicsPanel } from "@/components/analytics/customer-demographics-panel"
import { CustomerValuePanel } from "@/components/analytics/customer-value-panel"
import { NewReturningPanel } from "@/components/analytics/new-returning-panel"
import { PurchaseFrequencyPanel } from "@/components/analytics/purchase-frequency-panel"
import { MidPerformancePanel } from "@/components/analytics/mid-performance-panel"
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table"
import { ChannelBehaviourPanel } from "@/components/analytics/channel-behaviour-panel"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { TransactionSection } from "@/components/analytics/transaction-section"
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
import { computeLocationStats, computeMidStats, computeChannelBehavior } from "@/lib/transaction-stats"
import { trendCaption } from "@/lib/insights"
import { downloadCsv } from "@/lib/csv-export"

type CampaignMetric = "gmv" | "roi"
const CAMPAIGN_METRIC_OPTIONS: { value: CampaignMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "roi", label: "ROI" },
]

/**
 * Brand Analytics — "How is this specific brand performing, who are its customers, and which
 * campaigns/locations are driving performance?" Brand + customer intelligence: everything here
 * is scoped to a single brand and goes far deeper into who the customer is (demographics, value,
 * retention) and where the money moves (Merchant IDs, locations, channels) than the portfolio
 * view one level up.
 */
export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const navigate = useNavigate()
  const brand = brandById(brandId)
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")
  const [campaignMetric, setCampaignMetric] = React.useState<CampaignMetric>("gmv")

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
  const locationStats = React.useMemo(() => computeLocationStats(transactionRows, customerRatio), [transactionRows, customerRatio])
  const midStats = React.useMemo(() => computeMidStats(transactionRows, brandId), [transactionRows, brandId])
  const channelStats = React.useMemo(() => computeChannelBehavior(transactionRows), [transactionRows])

  const demographics = React.useMemo(() => aggregateDemographics(filteredCampaigns), [filteredCampaigns])
  const valueBuckets = React.useMemo(() => getCustomerValueDistribution(filteredCampaigns), [filteredCampaigns])
  const newReturningStats = React.useMemo(() => getNewReturningStats(filteredCampaigns), [filteredCampaigns])
  const freqBuckets = React.useMemo(() => getPurchaseFrequency(filteredCampaigns), [filteredCampaigns])

  const activeCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active").length, [filteredCampaigns])
  // Ranked/tabular performance views only make sense for campaigns that have actually started.
  const performanceCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active" || c.status === "completed"), [filteredCampaigns])

  const rankedCampaigns = React.useMemo(
    () =>
      performanceCampaigns
        .map((c) => ({ campaign: c, perf: getCampaignPerformance(c) }))
        .sort((a, b) => (campaignMetric === "gmv" ? b.perf.transactionValue - a.perf.transactionValue : b.perf.roi - a.perf.roi))
        .map(({ campaign, perf }) => ({
          id: campaign.id,
          label: campaign.name,
          value: campaignMetric === "gmv" ? perf.transactionValue : perf.roi,
        })),
    [performanceCampaigns, campaignMetric]
  )

  const chartMetricValue = { gmv: current.transactionValue, transactions: current.transactions, cashback: current.cashbackIssued, roi: current.roi, aov: current.avgTransactionValue }[chartMetric]
  const chartMetricPrev = { gmv: previous.transactionValue, transactions: previous.transactions, cashback: previous.cashbackIssued, roi: previous.roi, aov: previous.avgTransactionValue }[chartMetric]
  const chartCaption = trendCaption(CHART_METRIC_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "GMV", percentChange(chartMetricValue, chartMetricPrev))

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
            <SectionCard
              title="Campaign Performance"
              description="Live and completed campaigns for this brand. Click one to open its analytics."
              actions={<PillToggle value={campaignMetric} onChange={setCampaignMetric} options={CAMPAIGN_METRIC_OPTIONS} />}
            >
              <RankedBarList
                items={rankedCampaigns}
                formatValue={campaignMetric === "gmv" ? formatAed : (v) => formatRatio(v)}
                onSelect={(id) => navigate(`/analytics/campaigns/${id}`)}
              />
            </SectionCard>
            <Card className="mt-4">
              <CardContent className="p-5">
                <CampaignComparisonTable campaigns={performanceCampaigns} />
              </CardContent>
            </Card>
          </section>

          {/* 5. Customer Demographics — who is responding? */}
          <section className="mt-12">
            <SectionCard title="Customer Demographics" description="Age and gender breakdown of customers reached">
              <CustomerDemographicsPanel demographics={demographics} />
            </SectionCard>
          </section>

          {/* 6. Customer Value */}
          <section className="mt-12">
            <SectionCard title="Customer Value" description="How much customers spend, in total, across all campaigns">
              <CustomerValuePanel buckets={valueBuckets} />
            </SectionCard>
          </section>

          {/* 7. New vs. Returning Customers */}
          <section className="mt-12">
            <SectionCard title="New vs. Returning Customers" description="Acquisition vs. retention, and how each segment's value compares">
              <NewReturningPanel stats={newReturningStats} />
            </SectionCard>
          </section>

          {/* 8. Purchase Frequency */}
          <section className="mt-12">
            <SectionCard title="Purchase Frequency" description="How many times customers purchased">
              <PurchaseFrequencyPanel buckets={freqBuckets} />
            </SectionCard>
          </section>

          {/* 9. Top Merchant IDs */}
          <section className="mt-12">
            <SectionCard title="Top Merchant IDs" description="Highest-performing Merchant IDs across this brand's campaigns">
              <MidPerformancePanel mids={midStats} />
            </SectionCard>
          </section>

          {/* 10. Location / Store Performance */}
          <section className="mt-12">
            <SectionCard title="Location Performance" description="This brand's strongest locations, by GMV">
              <LocationPerformanceTable locations={locationStats} />
            </SectionCard>
          </section>

          {/* 11. Channel Behaviour */}
          <section className="mt-12">
            <SectionCard title="Channel Behaviour" description="Online vs. in-store, compared">
              <ChannelBehaviourPanel stats={channelStats} metrics={["gmv", "customers", "aov", "repeatRate"]} />
            </SectionCard>
          </section>

          {/* 12. Why Transactions Didn't Qualify */}
          <section className="mt-12">
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* 13. Recent Transactions */}
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
