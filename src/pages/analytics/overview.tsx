import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { TrendingUp, Receipt, Coins, Target, Users, Megaphone, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PillToggle } from "@/components/analytics/pill-toggle"
import { BrandPerformanceTable, type BrandMetric, type BrandPerformanceRow } from "@/components/analytics/brand-performance-table"
import { CampaignPerformanceTable, type CampaignMetric, type CampaignPerformanceRow } from "@/components/analytics/campaign-performance-table"
import { KeyInsights } from "@/components/analytics/key-insights"
import { BRANDS, CAMPAIGNS } from "@/lib/data"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, dateRangeLabel, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, sumSeriesInRange, previousPeriod, percentChange, getCampaignPerformance } from "@/lib/mock-performance"
import { generatePortfolioInsights } from "@/lib/insights"

const BRAND_METRIC_OPTIONS: { value: BrandMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "transactions", label: "Transactions" },
  { value: "roi", label: "ROI" },
  { value: "customers", label: "Customers" },
]

const CAMPAIGN_METRIC_OPTIONS: { value: CampaignMetric; label: string }[] = [
  { value: "gmv", label: "GMV" },
  { value: "roi", label: "ROI" },
  { value: "transactions", label: "Transactions" },
]

const TOP_CAMPAIGN_COUNT = 6

/**
 * Merchant Analytics — "How is my entire Pulse program performing, which brands and campaigns
 * are driving it, and where should I look next?" A compact comparison surface, not a
 * dashboard of every widget: portfolio snapshot → brand comparison → campaign comparison →
 * insights. Deliberately has no charts — comparison, not visualization, is the point — and no
 * Merchant ID / demographic / transaction-level detail, which lives one and two levels down.
 */
export default function AnalyticsOverview() {
  const navigate = useNavigate()
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [brandMetric, setBrandMetric] = React.useState<BrandMetric>("gmv")
  const [campaignMetric, setCampaignMetric] = React.useState<CampaignMetric>("gmv")

  // Cohort: campaigns matching all filters, including date range (created-in-range). Powers
  // brand/campaign comparison, where "which brand/campaign" is the question being answered.
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, filters), [filters])
  // Everything except date — used to build the full activity timeline so period comparisons
  // aren't blind to activity from campaigns created just outside the selected window.
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(CAMPAIGNS, filters), [filters])

  const range = resolveDateRange(filters.dateRange, filters.customRange)
  const prevRange = React.useMemo(() => previousPeriod(range), [range])
  const mergedDaily = React.useMemo(() => aggregatePerformance(nonDateCampaigns).dailySeries, [nonDateCampaigns])

  // Period totals: how the portfolio performed in the selected window vs. the one before it.
  const current = React.useMemo(() => sumSeriesInRange(mergedDaily, range), [mergedDaily, range])
  const previous = React.useMemo(() => sumSeriesInRange(mergedDaily, prevRange), [mergedDaily, prevRange])

  // Cohort totals: portfolio-level detail that only exists per-campaign (customers, budget),
  // not on the daily series — plus the same cohort computed for the prior period, so every
  // snapshot KPI can show a real comparison, not just the ones backed by a daily series.
  const cohortPerf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const previousCohortCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, { ...filters, dateRange: "custom", customRange: prevRange }), [filters, prevRange])
  const previousCohortPerf = React.useMemo(() => aggregatePerformance(previousCohortCampaigns), [previousCohortCampaigns])
  const periodLabel = dateRangeLabel(filters.dateRange)

  const activeCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active"), [filteredCampaigns])
  const previousActiveCampaigns = React.useMemo(() => previousCohortCampaigns.filter((c) => c.status === "active").length, [previousCohortCampaigns])
  // Ranked/tabular performance views only make sense for campaigns that have actually started.
  const performanceCampaigns = React.useMemo(() => filteredCampaigns.filter((c) => c.status === "active" || c.status === "completed"), [filteredCampaigns])

  const brandStats = React.useMemo(
    () => BRANDS.map((b) => ({ brand: b, perf: aggregatePerformance(filteredCampaigns.filter((c) => c.brandId === b.id)) })),
    [filteredCampaigns]
  )

  const brandRows: BrandPerformanceRow[] = React.useMemo(
    () =>
      brandStats.map(({ brand, perf }) => ({
        id: brand.id,
        name: brand.name,
        logoInitials: brand.logoInitials,
        logoColor: brand.logoColor,
        gmv: perf.transactionValue,
        transactions: perf.transactions,
        customers: perf.customersTransacted,
        roi: perf.roi,
        utilizationPct: perf.utilizationPct,
      })),
    [brandStats]
  )

  const campaignRows: CampaignPerformanceRow[] = React.useMemo(
    () =>
      performanceCampaigns.map((c) => {
        const perf = getCampaignPerformance(c)
        const brand = BRANDS.find((b) => b.id === c.brandId)
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          brandName: brand?.name ?? c.brandId,
          brandInitials: brand?.logoInitials ?? "—",
          brandColor: brand?.logoColor ?? "#999",
          gmv: perf.transactionValue,
          transactions: perf.transactions,
          roi: perf.roi,
          utilizationPct: perf.utilizationPct,
        }
      }),
    [performanceCampaigns]
  )

  const topCampaignRows = React.useMemo(
    () => [...campaignRows].sort((a, b) => (campaignMetric === "roi" ? b.roi - a.roi : campaignMetric === "gmv" ? b.gmv - a.gmv : b.transactions - a.transactions)).slice(0, TOP_CAMPAIGN_COUNT),
    [campaignRows, campaignMetric]
  )

  const portfolioInsights = React.useMemo(
    () => generatePortfolioInsights({ brands: brandRows.map((r) => ({ name: r.name, gmv: r.gmv, roi: r.roi, utilizationPct: r.utilizationPct })) }),
    [brandRows]
  )

  return (
    <div>
      <PageHeader title="Analytics" description="Overall merchant performance across brands and campaigns." showPrototypeTag />

      <FilterBar filters={filters} onChange={setFilters} showCampaignSearch />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* 1. Overall Merchant Snapshot */}
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
              label="Total Transactions"
              value={formatNumber(current.transactions)}
              deltaPct={percentChange(current.transactions, previous.transactions)}
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
              icon={<Users className="size-4" />}
              label="Total Customers"
              value={formatNumber(cohortPerf.customersTransacted)}
              deltaPct={percentChange(cohortPerf.customersTransacted, previousCohortPerf.customersTransacted)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Target className="size-4" />}
              label="Overall ROI"
              value={formatRatio(current.roi)}
              deltaPct={percentChange(current.roi, previous.roi)}
              hint={periodLabel}
              tier="transaction"
              showTierBadge={false}
            />
            <KpiCard
              icon={<Megaphone className="size-4" />}
              label="Active Campaigns"
              value={formatNumber(activeCampaigns.length)}
              deltaPct={percentChange(activeCampaigns.length, previousActiveCampaigns)}
              hint={periodLabel}
              tier="live"
            />
          </KpiGrid>
          <p className="mt-2 text-xs text-muted-foreground">
            Transaction and cashback figures are prototype estimates — they require transaction/settlement data. Change is versus the equivalent prior period.
          </p>

          {/* 2. Brand Performance — which of our brands are performing best? */}
          <section className="mt-12">
            <SectionCard
              title="Brand Performance"
              description="Compare brands across key performance metrics"
              actions={<PillToggle value={brandMetric} onChange={setBrandMetric} options={BRAND_METRIC_OPTIONS} />}
              contentClassName="px-5 pb-3"
            >
              <BrandPerformanceTable rows={brandRows} metric={brandMetric} onSelect={(id) => navigate(`/analytics/brands/${id}`)} />
              <Link to="/brands" className="mt-1 inline-flex items-center gap-1 py-2 text-sm font-medium text-primary hover:underline">
                View all brands
                <ArrowRight className="size-3.5" />
              </Link>
            </SectionCard>
          </section>

          {/* 3. Campaign Performance — which campaigns are driving that performance? */}
          <section className="mt-12">
            <SectionCard
              title="Campaign Performance"
              description="Top campaigns across all brands"
              actions={<PillToggle value={campaignMetric} onChange={setCampaignMetric} options={CAMPAIGN_METRIC_OPTIONS} />}
              contentClassName="px-5 pb-3"
            >
              <CampaignPerformanceTable rows={topCampaignRows} metric={campaignMetric} onSelect={(id) => navigate(`/analytics/campaigns/${id}`)} />
              <Link to="/campaigns" className="mt-1 inline-flex items-center gap-1 py-2 text-sm font-medium text-primary hover:underline">
                View all campaigns
                <ArrowRight className="size-3.5" />
              </Link>
            </SectionCard>
          </section>

          {/* 4. Performance Insights — where should I investigate? */}
          <section className="mt-12">
            <SectionCard title="Performance Insights" description="Data-driven observations across your brand portfolio">
              <KeyInsights insights={portfolioInsights} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
