import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Store, TrendingUp, Receipt, Coins, Target, Users, Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { TopCampaignCard, type TopCampaignMetric } from "@/components/analytics/top-campaign-card"
import { CampaignPerformanceTable, type CampaignPerformanceRow } from "@/components/analytics/campaign-performance-table"
import { CustomerImpactStats } from "@/components/analytics/customer-impact-stats"
import { CustomerDemographicsPanel } from "@/components/analytics/customer-demographics-panel"
import { CustomerValuePanel } from "@/components/analytics/customer-value-panel"
import { NewReturningPanel } from "@/components/analytics/new-returning-panel"
import { PurchaseFrequencyPanel } from "@/components/analytics/purchase-frequency-panel"
import { MidPerformancePanel } from "@/components/analytics/mid-performance-panel"
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table"
import { ChannelBehaviourPanel } from "@/components/analytics/channel-behaviour-panel"
import { EngagementFunnel } from "@/components/analytics/engagement-funnel"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { MERCHANT, BRANDS, brandById, campaignsForBrand } from "@/lib/data"
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

const BRAND_CHART_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
]

const TOP_CAMPAIGN_OPTIONS: { value: TopCampaignMetric; label: string }[] = [
  { value: "roi", label: "ROI" },
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
]

/**
 * Brand Analytics — the main Analytics landing experience. "How is this brand performing, which
 * campaign is leading, who are its customers, and where does it move?" Everything here is scoped
 * to a single brand the merchant is already working within — there is no cross-brand comparison
 * or ranking; switching brands changes context entirely rather than adding another row to a table.
 */
export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const navigate = useNavigate()
  const brand = brandById(brandId)
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")
  const [topMetric, setTopMetric] = React.useState<TopCampaignMetric>("roi")

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
  const previousCohortCampaigns = React.useMemo(
    () => applyCampaignFilters(allCampaigns, { ...filters, dateRange: "custom", customRange: prevRange }),
    [allCampaigns, filters, prevRange]
  )
  const previousCohortPerf = React.useMemo(() => aggregatePerformance(previousCohortCampaigns), [previousCohortCampaigns])
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

  // Ranked/tabular performance views only make sense for campaigns that have actually started.
  const performanceCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active" || c.status === "completed"), [filteredCampaigns])
  const rankedCampaigns = React.useMemo(() => performanceCampaigns.map((c) => ({ campaign: c, perf: getCampaignPerformance(c) })), [performanceCampaigns])

  // The single featured campaign — highest by whichever metric is selected. The list below
  // excludes it, so the highlight and the comparison table never repeat the same campaign.
  const topEntry = React.useMemo(() => {
    if (rankedCampaigns.length === 0) return null
    return [...rankedCampaigns].sort((a, b) => {
      const value = (p: (typeof rankedCampaigns)[number]["perf"]) => (topMetric === "roi" ? p.roi : topMetric === "gmv" ? p.transactionValue : p.transactions)
      return value(b.perf) - value(a.perf)
    })[0]
  }, [rankedCampaigns, topMetric])

  const campaignRows: CampaignPerformanceRow[] = React.useMemo(
    () =>
      rankedCampaigns
        .filter(({ campaign }) => campaign.id !== topEntry?.campaign.id)
        .map(({ campaign, perf }) => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          gmv: perf.transactionValue,
          transactions: perf.transactions,
          roi: perf.roi,
          cashback: perf.cashbackIssued,
          utilizationPct: perf.utilizationPct,
        })),
    [rankedCampaigns, topEntry]
  )

  const chartMetricValue = { gmv: current.transactionValue, transactions: current.transactions, cashback: current.cashbackIssued, roi: current.roi, aov: current.avgTransactionValue }[chartMetric]
  const chartMetricPrev = { gmv: previous.transactionValue, transactions: previous.transactions, cashback: previous.cashbackIssued, roi: previous.roi, aov: previous.avgTransactionValue }[chartMetric]
  const chartCaption = trendCaption(BRAND_CHART_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "GMV", percentChange(chartMetricValue, chartMetricPrev))

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
        breadcrumb={[{ label: "Analytics" }]}
        title={
          <>
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} />
            {brand.name}
          </>
        }
        description={`Performance and customer insights for ${brand.name}.`}
        meta={<span>{allCampaigns.length} campaigns total · {MERCHANT.name}</span>}
        showPrototypeTag
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadReport}>
            <Download className="size-3.5" />
            Download report
          </Button>
        }
      />

      {/* Brand switcher — the primary context for this entire page. Every brand's analytics live
          at this same page shape; picking one here swaps the content below rather than opening a
          separate detail page. */}
      <Tabs value={brand.id} onValueChange={(id) => navigate(`/analytics/brands/${id}`)} className="mb-6">
        <TabsList>
          {BRANDS.map((b) => (
            <TabsTrigger key={b.id} value={b.id}>
              {b.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* 1. Brand Overview — three headline metrics, three lighter supporting ones */}
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
              icon={<Receipt className="size-4" />}
              label="Transactions"
              value={formatNumber(current.transactions)}
              deltaPct={percentChange(current.transactions, previous.transactions)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Target className="size-4" />}
              label="ROI"
              value={formatRatio(current.roi)}
              deltaPct={percentChange(current.roi, previous.roi)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Coins className="size-4" />}
              label="Cashback Issued"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
              size="md"
            />
            <KpiCard
              icon={<Users className="size-4" />}
              label="Customers"
              value={formatNumber(cohortPerf.customersTransacted)}
              deltaPct={percentChange(cohortPerf.customersTransacted, previousCohortPerf.customersTransacted)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
              size="md"
            />
            <KpiCard
              label="Avg. Transaction Value"
              value={formatAed(current.avgTransactionValue)}
              deltaPct={percentChange(current.avgTransactionValue, previous.avgTransactionValue)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
              size="md"
            />
          </KpiGrid>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* 2. Brand Performance */}
          <section className="mt-12">
            <SectionCard
              title="Brand Performance"
              description="Is this brand's performance improving or declining?"
              contentClassName="pt-2"
              actions={<PillToggle value={chartMetric} onChange={setChartMetric} options={BRAND_CHART_OPTIONS} />}
            >
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
              {chartCaption && <p className="mt-3 border-t border-border/70 px-1 pt-4 text-xs text-muted-foreground">{chartCaption}</p>}
            </SectionCard>
          </section>

          {/* 3. Top Campaign — a single visual highlight, not another ranked list */}
          <section className="mt-12">
            <SectionCard
              title="Top Campaign"
              description="This brand's strongest campaign by the selected metric"
              actions={<PillToggle value={topMetric} onChange={setTopMetric} options={TOP_CAMPAIGN_OPTIONS} />}
            >
              {topEntry ? (
                <TopCampaignCard
                  name={topEntry.campaign.name}
                  status={topEntry.campaign.status}
                  perf={topEntry.perf}
                  metric={topMetric}
                  onSelect={() => navigate(`/analytics/campaigns/${topEntry.campaign.id}`)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No active or completed campaigns in this range yet.</p>
              )}
            </SectionCard>
          </section>

          {/* 4. Campaign Performance — the detailed comparison, excluding the campaign already featured above */}
          <section className="mt-12">
            <SectionCard title="Campaign Performance" description="Every other live and completed campaign for this brand. Sort a column, or click a row to open it.">
              <CampaignPerformanceTable rows={campaignRows} onSelect={(id) => navigate(`/analytics/campaigns/${id}`)} />
            </SectionCard>
          </section>

          {/* 5. Customer Insights */}
          <section className="mt-12">
            <SectionCard title="Customer Insights" description="Who this brand's campaigns are reaching and converting">
              <CustomerImpactStats perf={cohortPerf} />
            </SectionCard>
          </section>

          <section className="mt-12">
            <SectionCard title="Customer Demographics" description="Age and gender breakdown of customers reached">
              <CustomerDemographicsPanel demographics={demographics} />
            </SectionCard>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Customer Value" description="How much customers spend, in total, across all campaigns">
              <CustomerValuePanel buckets={valueBuckets} />
            </SectionCard>
            <SectionCard title="Purchase Frequency" description="How many times customers purchased">
              <PurchaseFrequencyPanel buckets={freqBuckets} />
            </SectionCard>
          </section>

          <section className="mt-12">
            <SectionCard title="New vs. Returning Customers" description="Acquisition vs. retention, and how each segment's value compares">
              <NewReturningPanel stats={newReturningStats} />
            </SectionCard>
          </section>

          {/* 6. Channel / Engagement Insights */}
          <section className="mt-12">
            <SectionCard title="Engagement" description="Aggregate customer engagement across this brand's campaigns, from offer shown to cashback rewarded">
              <EngagementFunnel perf={cohortPerf} />
            </SectionCard>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Channel Behaviour" description="Online vs. in-store, compared">
              <ChannelBehaviourPanel stats={channelStats} metrics={["gmv", "customers", "aov", "repeatRate"]} />
            </SectionCard>
            <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
              <QualificationBreakdown buckets={cohortPerf.qualification} />
            </SectionCard>
          </section>

          {/* Secondary operational detail — useful, but not primary at brand level; the deeper cut lives on Campaign Analytics */}
          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <SectionCard title="Top Merchant IDs" description="Highest-performing Merchant IDs across this brand's campaigns">
              <MidPerformancePanel mids={midStats} />
            </SectionCard>
            <SectionCard title="Location Performance" description="This brand's strongest locations, by GMV">
              <LocationPerformanceTable locations={locationStats} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
