import * as React from "react"
import { TrendingUp, Receipt, Coins, Target, Store, Megaphone } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { Card, CardContent } from "@/components/ui/card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, CHART_METRIC_OPTIONS, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { RankedBarList } from "@/components/analytics/ranked-bar-list"
import { DonutChart } from "@/components/analytics/donut-chart"
import { BrandComparisonTable } from "@/components/analytics/brand-comparison-table"
import { CampaignTable } from "@/components/analytics/campaign-table"
import { BudgetAllocationPanel } from "@/components/analytics/budget-allocation-panel"
import { KeyInsights } from "@/components/analytics/key-insights"
import { useNavigate } from "react-router-dom"
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
  generateTransactionRows,
} from "@/lib/mock-performance"
import { computeChannelBehavior } from "@/lib/transaction-stats"
import { generatePortfolioInsights, trendCaption } from "@/lib/insights"

type BrandMetric = "gmv" | "transactions" | "roi" | "customers"
const BRAND_METRIC_OPTIONS: { value: BrandMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
  { value: "roi", label: "ROI" },
  { value: "customers", label: "Customers" },
]

type CampaignMetric = "gmv" | "roi" | "transactions"
const CAMPAIGN_METRIC_OPTIONS: { value: CampaignMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "roi", label: "ROI" },
  { value: "transactions", label: "Transactions" },
]

type ChannelMetric = "gmv" | "transactions" | "customers"
const CHANNEL_METRIC_OPTIONS: { value: ChannelMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
  { value: "customers", label: "Customers" },
]

const BRAND_METRIC_FORMAT: Record<BrandMetric, (v: number) => string> = { gmv: formatAed, transactions: formatNumber, roi: (v) => formatRatio(v), customers: formatNumber }

/**
 * Merchant Analytics — "How is my entire Pulse program performing across all my brands and
 * campaigns?" Portfolio-level intelligence: compare brands and campaigns, track budget
 * allocation and channel mix, surface what needs attention. Deliberately does not show
 * Merchant ID / Terminal ID detail or customer demographics — that lives one and two levels
 * down, where "which brand" has already narrowed the question.
 */
export default function AnalyticsOverview() {
  const navigate = useNavigate()
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")
  const [brandMetric, setBrandMetric] = React.useState<BrandMetric>("gmv")
  const [campaignMetric, setCampaignMetric] = React.useState<CampaignMetric>("gmv")
  const [channelMetric, setChannelMetric] = React.useState<ChannelMetric>("gmv")

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
  const chartMetricValue = { gmv: current.transactionValue, transactions: current.transactions, cashback: current.cashbackIssued, roi: current.roi, aov: current.avgTransactionValue }[chartMetric]
  const chartMetricPrev = { gmv: previous.transactionValue, transactions: previous.transactions, cashback: previous.cashbackIssued, roi: previous.roi, aov: previous.avgTransactionValue }[chartMetric]
  const chartCaption = trendCaption(CHART_METRIC_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "GMV", percentChange(chartMetricValue, chartMetricPrev))

  // Cohort totals: portfolio-level budget/insights detail.
  const cohortPerf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const periodLabel = dateRangeLabel(filters.dateRange)

  const activeCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active"), [filteredCampaigns])
  const activeBrandCount = React.useMemo(() => new Set(activeCampaigns.map((c) => c.brandId)).size, [activeCampaigns])
  // Ranked/tabular performance views only make sense for campaigns that have actually started.
  const performanceCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active" || c.status === "completed"), [filteredCampaigns])

  const brandStats = React.useMemo(
    () => BRANDS.map((b) => ({ brand: b, perf: aggregatePerformance(filteredCampaigns.filter((c) => c.brandId === b.id)) })),
    [filteredCampaigns]
  )

  const brandMetricValue = React.useCallback(
    (perf: (typeof brandStats)[number]["perf"]) =>
      brandMetric === "gmv" ? perf.transactionValue : brandMetric === "transactions" ? perf.transactions : brandMetric === "roi" ? perf.roi : perf.customersTransacted,
    [brandMetric]
  )

  const rankedBrands = React.useMemo(
    () =>
      [...brandStats]
        .sort((a, b) => brandMetricValue(b.perf) - brandMetricValue(a.perf))
        .map(({ brand, perf }) => ({ id: brand.id, label: brand.name, value: brandMetricValue(perf), color: brand.logoColor })),
    [brandStats, brandMetricValue]
  )

  const campaignMetricValue = React.useCallback(
    (perf: ReturnType<typeof getCampaignPerformance>) => (campaignMetric === "gmv" ? perf.transactionValue : campaignMetric === "roi" ? perf.roi : perf.transactions),
    [campaignMetric]
  )

  const rankedCampaigns = React.useMemo(
    () =>
      performanceCampaigns
        .map((c) => ({ campaign: c, perf: getCampaignPerformance(c) }))
        .sort((a, b) => campaignMetricValue(b.perf) - campaignMetricValue(a.perf))
        .slice(0, 6)
        .map(({ campaign, perf }) => ({
          id: campaign.id,
          label: campaign.name,
          value: campaignMetricValue(perf),
          sublabel: BRANDS.find((b) => b.id === campaign.brandId)?.name,
          color: BRANDS.find((b) => b.id === campaign.brandId)?.logoColor,
        })),
    [performanceCampaigns, campaignMetricValue]
  )

  const channelStats = React.useMemo(() => computeChannelBehavior(generateTransactionRows(filteredCampaigns)), [filteredCampaigns])

  const portfolioInsights = React.useMemo(() => {
    const stats = brandStats.map(({ brand, perf }) => ({ name: brand.name, gmv: perf.transactionValue, utilizationPct: perf.utilizationPct }))
    const campaignRois = filteredCampaigns.map((c) => getCampaignPerformance(c)).filter((p) => p.hasStarted).map((p) => p.roi)
    return generatePortfolioInsights({ brands: stats, campaignRois, portfolioAvgRoi: cohortPerf.roi, weekday: bucketByDayOfWeek(cohortPerf.dailySeries) })
  }, [brandStats, filteredCampaigns, cohortPerf])

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
              label="Cashback Invested"
              value={formatAed(current.cashbackIssued)}
              deltaPct={percentChange(current.cashbackIssued, previous.cashbackIssued)}
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

          {/* 2. Portfolio Performance */}
          <section className="mt-12">
            <SectionCard
              title="GMV & Cashback Over Time"
              description="Trend across every brand"
              contentClassName="pt-2"
              actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}
            >
              <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
              {chartCaption && <p className="mt-3 border-t border-border/70 px-1 pt-4 text-xs text-muted-foreground">{chartCaption}</p>}
            </SectionCard>
          </section>

          {/* 3. Brand Performance — which brand generates the most GMV? */}
          <section className="mt-12">
            <SectionCard
              title="Brand Performance"
              description="Compare brands. Click one to open its analytics."
              actions={<PillToggle value={brandMetric} onChange={setBrandMetric} options={BRAND_METRIC_OPTIONS} />}
            >
              <RankedBarList items={rankedBrands} formatValue={BRAND_METRIC_FORMAT[brandMetric]} onSelect={(id) => navigate(`/analytics/brands/${id}`)} />
            </SectionCard>
            <Card className="mt-4">
              <CardContent className="p-5">
                <BrandComparisonTable brands={BRANDS} campaigns={filteredCampaigns} />
              </CardContent>
            </Card>
          </section>

          {/* 4. Campaign Portfolio — which campaigns are driving results across every brand? */}
          <section className="mt-12">
            <SectionCard
              title="Campaign Portfolio"
              description="Top campaigns across every brand. Click one to open its analytics."
              actions={<PillToggle value={campaignMetric} onChange={setCampaignMetric} options={CAMPAIGN_METRIC_OPTIONS} />}
            >
              <RankedBarList
                items={rankedCampaigns}
                formatValue={campaignMetric === "roi" ? (v) => formatRatio(v) : campaignMetric === "gmv" ? formatAed : formatNumber}
                onSelect={(id) => navigate(`/analytics/campaigns/${id}`)}
              />
            </SectionCard>
            <Card className="mt-4">
              <CardContent className="p-5">
                <CampaignTable campaigns={performanceCampaigns} />
              </CardContent>
            </Card>
          </section>

          {/* 5. Budget Allocation — are brands' budgets sized in line with what they generate? */}
          <section className="mt-12">
            <SectionCard title="Budget Allocation" description="Cashback budget share vs. GMV share by brand">
              <BudgetAllocationPanel
                items={brandStats.map(({ brand, perf }) => ({ name: brand.name, budget: perf.budget, gmv: perf.transactionValue, color: brand.logoColor }))}
              />
            </SectionCard>
          </section>

          {/* 6. Channel Mix — portfolio-wide online vs. in-store split */}
          <section className="mt-12">
            <SectionCard
              title="Channel Mix"
              description="Online vs. in-store across the portfolio"
              actions={<PillToggle value={channelMetric} onChange={setChannelMetric} options={CHANNEL_METRIC_OPTIONS} />}
            >
              <DonutChart
                segments={[
                  { label: "Online", value: channelStats[0][channelMetric], color: "hsl(217 91% 55%)" },
                  { label: "In-Store", value: channelStats[1][channelMetric], color: "hsl(38 92% 45%)" },
                ]}
                formatValue={channelMetric === "gmv" ? formatAed : formatNumber}
              />
            </SectionCard>
          </section>

          {/* 7. Portfolio Insights — where should I take action? */}
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
