import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { Building2, Clock, CalendarDays, TrendingUp, Receipt, Coins, Target, Users, BarChart3, Megaphone as MegaphoneIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { BudgetPacingPanel } from "@/components/analytics/budget-pacing-panel"
import { EngagementFunnel } from "@/components/analytics/engagement-funnel"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { OfferEconomicsPanel } from "@/components/analytics/offer-economics-panel"
import { ChannelBehaviourPanel } from "@/components/analytics/channel-behaviour-panel"
import { PurchaseBehaviourPanel } from "@/components/analytics/purchase-behaviour-panel"
import { HeatmapGrid } from "@/components/analytics/heatmap-grid"
import { MidQualificationScatter } from "@/components/analytics/mid-qualification-scatter"
import { TerminalPerformancePanel } from "@/components/analytics/terminal-performance-panel"
import { CustomerDemographicsPanel } from "@/components/analytics/customer-demographics-panel"
import { DemographicPerformancePanel } from "@/components/analytics/demographic-performance-panel"
import { NewReturningPanel } from "@/components/analytics/new-returning-panel"
import { KeyInsights } from "@/components/analytics/key-insights"
import { TransactionSection } from "@/components/analytics/transaction-section"
import { campaignById, brandById } from "@/lib/data"
import { cn, formatAed, formatDate, formatNumber, formatRatio } from "@/lib/utils"
import { durationLabel } from "@/lib/analytics-utils"
import {
  getCampaignPerformance,
  bucketSeries,
  bucketByDayOfWeek,
  buildDayTimeHeatmap,
  generateTransactionRows,
  aggregateDemographics,
  getNewReturningStats,
} from "@/lib/mock-performance"
import { computeAmountStats, computeAmountDistribution, computeOfferEconomics, computeMidStats, computeTerminalStats, computeChannelBehavior } from "@/lib/transaction-stats"
import { generateCampaignInsights } from "@/lib/insights"

const CAMPAIGN_CHART_METRICS: ChartMetric[] = ["gmv", "transactions", "cashback", "roi", "aov"]

/**
 * Campaign Analytics — "Is this campaign working, why, and what should I change?" Campaign +
 * operational intelligence: the deepest, most granular level. Everything here is scoped to a
 * single campaign, down to its physical locations — questions that don't make sense one or two
 * levels up, where "which campaign" hasn't been answered yet.
 */
export default function CampaignAnalytics() {
  const { campaignId = "" } = useParams()
  const campaign = campaignById(campaignId)
  const brand = campaign ? brandById(campaign.brandId) : undefined
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")

  const perf = React.useMemo(() => (campaign ? getCampaignPerformance(campaign) : null), [campaign])
  // This page has no date-range filter — every KPI always covers the campaign's full run, so the
  // period hint is a fixed label rather than something derived from active filter state.
  const periodLabel = "Campaign lifetime"
  const chartSeries = React.useMemo(() => {
    if (!perf || perf.dailySeries.length === 0) return []
    const from = new Date(perf.dailySeries[0].date)
    const to = new Date(perf.dailySeries[perf.dailySeries.length - 1].date)
    return bucketSeries(perf.dailySeries, { from, to })
  }, [perf])
  const transactionRows = React.useMemo(() => (campaign ? generateTransactionRows([campaign]) : []), [campaign])
  const weekday = React.useMemo(() => (perf ? bucketByDayOfWeek(perf.dailySeries) : []), [perf])
  const heatmap = React.useMemo(() => (perf ? buildDayTimeHeatmap(perf.dailySeries) : []), [perf])
  const amountStats = React.useMemo(() => computeAmountStats(transactionRows), [transactionRows])
  const amountDistribution = React.useMemo(() => computeAmountDistribution(transactionRows), [transactionRows])
  const offerEconomics = React.useMemo(() => (campaign ? computeOfferEconomics(transactionRows, campaign) : null), [transactionRows, campaign])
  const midStats = React.useMemo(() => (campaign ? computeMidStats(transactionRows, campaign.brandId) : []), [transactionRows, campaign])
  const terminalStats = React.useMemo(() => computeTerminalStats(transactionRows), [transactionRows])
  const channelStats = React.useMemo(() => computeChannelBehavior(transactionRows), [transactionRows])
  const demographics = React.useMemo(() => (campaign ? aggregateDemographics([campaign]) : null), [campaign])
  const newReturningStats = React.useMemo(() => (campaign ? getNewReturningStats([campaign]) : []), [campaign])

  const channelMix = React.useMemo(() => {
    if (!perf?.channelSplit?.online || !perf.channelSplit.in_store) return null
    const total = perf.channelSplit.online.transactionValue + perf.channelSplit.in_store.transactionValue
    if (total === 0) return null
    return { onlinePct: (perf.channelSplit.online.transactionValue / total) * 100, inStorePct: (perf.channelSplit.in_store.transactionValue / total) * 100 }
  }, [perf])

  const hasChannelSplit = campaign?.channel === "both" && !!perf?.channelSplit?.online && !!perf?.channelSplit?.in_store

  const topMid = React.useMemo(() => {
    if (midStats.length === 0) return null
    const total = midStats.reduce((s, m) => s + m.gmv, 0)
    return total > 0 ? { mid: midStats[0].mid, gmvSharePct: (midStats[0].gmv / total) * 100 } : null
  }, [midStats])

  const topAgeSegment = React.useMemo(() => {
    if (!demographics) return null
    const total = demographics.totalGmv
    const top = [...demographics.byAge].filter((b) => b.customers > 0).sort((a, b) => b.gmv - a.gmv)[0]
    return top && total > 0 ? { ageBand: top.ageBand, gmvSharePct: (top.gmv / total) * 100 } : null
  }, [demographics])

  const insights = React.useMemo(() => {
    if (!perf) return []
    return generateCampaignInsights({
      transactionValue: perf.transactionValue,
      cashbackIssued: perf.cashbackIssued,
      channelMix,
      qualification: perf.qualification,
      utilizationPct: perf.utilizationPct,
      estimatedExhaustionDate: perf.estimatedExhaustionDate,
      weekday,
      topMid,
      topAgeSegment,
    })
  }, [perf, channelMix, weekday, topMid, topAgeSegment])

  if (!campaign || !brand || !perf) {
    return <EmptyState icon={<MegaphoneIcon className="size-6" />} title="Campaign not found" description="This campaign doesn't exist in the sample dataset." />
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        breadcrumb={[{ label: "Analytics", to: `/analytics/brands/${brand.id}` }, { label: brand.name, to: `/analytics/brands/${brand.id}` }, { label: campaign.name }]}
        title={
          <>
            {campaign.name}
            <StatusBadge status={campaign.status} />
          </>
        }
        meta={
          <>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              <Link to={`/analytics/brands/${brand.id}`} className="font-medium text-foreground hover:underline">
                {brand.name}
              </Link>
            </span>
            <ChannelBadge channel={campaign.channel} />
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(campaign.startDate)} {campaign.endDate ? `– ${formatDate(campaign.endDate)}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {durationLabel(campaign)}
            </span>
          </>
        }
      />

      {/* Campaign Overview — the same six core performance KPIs as Brand Analytics, all equal weight.
          Budget Used / Budget Remaining are intentionally not here — they're secondary to core
          performance and already surfaced (both progress and figure) in the Budget Pacing panel below. */}
      <KpiGrid>
        <KpiCard icon={<TrendingUp className="size-[18px]" />} label="GMV" value={formatAed(perf.transactionValue)} hint={periodLabel} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Receipt className="size-[18px]" />} label="Transactions" value={formatNumber(perf.transactions)} hint={periodLabel} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Target className="size-[18px]" />} label="ROI" value={formatRatio(perf.roi)} hint={periodLabel} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Coins className="size-[18px]" />} label="Cashback Issued" value={formatAed(perf.cashbackIssued)} hint={periodLabel} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Users className="size-[18px]" />} label="Customers" value={formatNumber(perf.customersTransacted)} hint={periodLabel} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<BarChart3 className="size-[18px]" />} label="Avg. Transaction Value" value={formatAed(perf.avgTransactionValue)} hint={periodLabel} tier="transaction" showTierBadge={false} />
      </KpiGrid>

      {/* Campaign Overview — trend and pacing behind the KPIs above */}
      <section className="mt-12">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Campaign Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Performance trend and budget pacing for this campaign</p>
        </div>

        <SectionCard
          title="Campaign Performance Over Time"
          description="Campaign performance across its active duration"
          contentClassName="pt-2"
          actions={<MetricToggle value={chartMetric} onChange={setChartMetric} metrics={CAMPAIGN_CHART_METRICS} />}
        >
          <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
        </SectionCard>

        <div className="mt-6">
          <SectionCard title="Budget Pacing" description="Burn rate and forecast exhaustion for this campaign">
            <BudgetPacingPanel
              budget={campaign.budget}
              remainingBudget={perf.remainingBudget}
              utilizationPct={perf.utilizationPct}
              burnRatePerDay={perf.burnRatePerDay}
              estimatedExhaustionDate={perf.estimatedExhaustionDate}
            />
          </SectionCard>
        </div>
      </section>

      {/* Campaign Conversion — the funnel and why attempted transactions didn't qualify */}
      <section className="mt-12">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Campaign Conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">From offer exposure to rewarded transaction, and where it breaks down</p>
        </div>

        <SectionCard title="Campaign Conversion Funnel" description="From offer shown to cashback rewarded">
          <EngagementFunnel perf={perf} />
        </SectionCard>

        <div className="mt-6">
          <SectionCard title="Campaign Eligibility" description="Attempted transactions that didn't receive cashback, and why">
            <QualificationBreakdown buckets={perf.qualification} qualified={perf.transactions} />
          </SectionCard>
        </div>
      </section>

      {/* Location & Channel — where and how this campaign is performing */}
      <section className="mt-12">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Location &amp; Channel</h2>
          <p className="mt-1 text-sm text-muted-foreground">Which locations, channels, and times are driving this campaign</p>
        </div>

        <SectionCard title="Location Performance" description="Which physical locations are driving this campaign">
          <TerminalPerformancePanel terminals={terminalStats} />
        </SectionCard>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {hasChannelSplit && (
            <SectionCard title="Channel Performance" description="Online vs. in-store performance for this campaign">
              <ChannelBehaviourPanel stats={channelStats} metrics={["gmv", "transactions", "aov", "roi", "customers"]} />
            </SectionCard>
          )}
          {midStats.length > 1 && (
            <SectionCard title="Location Qualification" description="Which locations qualify less than average, despite high volume" className={hasChannelSplit ? undefined : "lg:col-span-2"}>
              <MidQualificationScatter mids={midStats} />
            </SectionCard>
          )}
        </div>

        <div className="mt-6">
          <SectionCard title="Day / Time Performance" description="GMV by day of week and time of day">
            <HeatmapGrid cells={heatmap} />
          </SectionCard>
        </div>
      </section>

      {/* Customer Insights — who responded to this specific campaign */}
      <section className="mt-12">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Customer Insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">Who responded to this campaign — scoped to this campaign alone, not the whole brand</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {demographics && (
            <SectionCard
              title="Campaign Customer Demographics"
              description="Age and gender breakdown of customers who responded"
              className="flex h-full flex-col"
              contentClassName="flex-1 min-h-0"
            >
              <CustomerDemographicsPanel demographics={demographics} />
            </SectionCard>
          )}
          <SectionCard
            title="New vs. Returning"
            description="Acquisition vs. retention for this campaign"
            className={cn("flex h-full flex-col", !demographics && "lg:col-span-2")}
            contentClassName="flex-1 min-h-0"
          >
            <NewReturningPanel stats={newReturningStats} />
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {demographics && (
            <SectionCard title="Demographic Performance" description="Which age segment performs best" className="flex h-full flex-col" contentClassName="flex-1 min-h-0">
              <DemographicPerformancePanel buckets={demographics.byAge} />
            </SectionCard>
          )}
          <SectionCard
            title="Purchase Behaviour"
            description="How much customers are spending per transaction"
            className={cn("flex h-full flex-col", !demographics && "lg:col-span-2")}
            contentClassName="flex-1 min-h-0"
          >
            <PurchaseBehaviourPanel stats={amountStats} distribution={amountDistribution} />
          </SectionCard>
        </div>
      </section>

      {/* Offer Economics — is the offer configuration itself working? */}
      {offerEconomics && (
        <section className="mt-12">
          <SectionCard title="Offer Economics" description="How the offer configuration is playing out in real behavior">
            <OfferEconomicsPanel campaign={campaign} economics={offerEconomics} />
          </SectionCard>
        </section>
      )}

      {/* Campaign Insights */}
      {insights.length > 0 && (
        <section className="mt-12">
          <SectionCard title="Campaign Insights" description="Data-driven takeaways for this campaign">
            <KeyInsights insights={insights} />
          </SectionCard>
        </section>
      )}

      {/* Transactions */}
      <section className="mt-12">
        <SectionCard title="Transactions" description="Individual transactions behind the numbers above" contentClassName="px-5 pb-5">
          <TransactionSection rows={transactionRows} showCampaign={false} />
        </SectionCard>
      </section>
    </div>
  )
}
