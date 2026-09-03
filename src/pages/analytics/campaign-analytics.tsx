import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { Percent, Wallet, ArrowDownToLine, ShieldCheck, Building2, Clock, CalendarDays, TrendingUp, Receipt, Coins, Target, Gauge, BarChart3, Megaphone as MegaphoneIcon } from "lucide-react"
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
import { MidPerformancePanel } from "@/components/analytics/mid-performance-panel"
import { MidQualificationScatter } from "@/components/analytics/mid-qualification-scatter"
import { TerminalPerformancePanel } from "@/components/analytics/terminal-performance-panel"
import { CustomerDemographicsPanel } from "@/components/analytics/customer-demographics-panel"
import { DemographicPerformancePanel } from "@/components/analytics/demographic-performance-panel"
import { NewReturningPanel } from "@/components/analytics/new-returning-panel"
import { KeyInsights } from "@/components/analytics/key-insights"
import { TransactionSection } from "@/components/analytics/transaction-section"
import { campaignById, brandById } from "@/lib/data"
import { formatAed, formatDate, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
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
 * single campaign, down to its Merchant IDs and terminals — questions that don't make sense one
 * or two levels up, where "which campaign" hasn't been answered yet.
 */
export default function CampaignAnalytics() {
  const { campaignId = "" } = useParams()
  const campaign = campaignById(campaignId)
  const brand = campaign ? brandById(campaign.brandId) : undefined
  const [chartMetric, setChartMetric] = React.useState<ChartMetric>("gmv")

  const perf = React.useMemo(() => (campaign ? getCampaignPerformance(campaign) : null), [campaign])
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
      {/* 1. Campaign Header */}
      <PageHeader
        breadcrumb={[{ label: "Analytics", to: `/analytics/brands/${brand.id}` }, { label: brand.name, to: `/analytics/brands/${brand.id}` }, { label: campaign.name }]}
        title={
          <>
            {campaign.name}
            <StatusBadge status={campaign.status} />
          </>
        }
        showPrototypeTag
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

      {/* Secondary metadata — the campaign's own configuration, kept visually quiet so it doesn't compete with the KPIs below */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Percent className="size-3.5" />
          {campaign.cashbackPercentage}% cashback
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="size-3.5" />
          {formatAed(campaign.budget)} budget
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowDownToLine className="size-3.5" />
          {campaign.minimumSpend ? `${formatAed(campaign.minimumSpend)} minimum spend` : "No minimum spend"}
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          {formatAed(campaign.cashbackCap)} cashback cap
        </span>
      </div>

      {/* 2. Campaign Health */}
      <KpiGrid>
        <KpiCard icon={<TrendingUp className="size-4" />} label="GMV" value={formatAed(perf.transactionValue)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Coins className="size-4" />} label="Cashback Issued" value={formatAed(perf.cashbackIssued)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Receipt className="size-4" />} label="Transactions" value={formatNumber(perf.transactions)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Target className="size-4" />} label="ROI" value={formatRatio(perf.roi)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Gauge className="size-4" />} label="Budget Used" value={formatPercent(perf.utilizationPct)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Wallet className="size-4" />} label="Budget Remaining" value={formatAed(perf.remainingBudget)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
        <KpiCard icon={<BarChart3 className="size-4" />} label="Avg. Transaction Value" value={formatAed(perf.avgTransactionValue)} hint="Campaign lifetime" tier="transaction" showTierBadge={false} />
      </KpiGrid>

      {/* 3. Budget Pacing — how quickly is this campaign consuming its budget? */}
      <section className="mt-12">
        <SectionCard title="Budget Pacing" description="Burn rate and forecast exhaustion for this campaign">
          <BudgetPacingPanel
            budget={campaign.budget}
            remainingBudget={perf.remainingBudget}
            utilizationPct={perf.utilizationPct}
            burnRatePerDay={perf.burnRatePerDay}
            estimatedExhaustionDate={perf.estimatedExhaustionDate}
          />
        </SectionCard>
      </section>

      {/* 4. Campaign Performance Over Time */}
      <section className="mt-12">
        <SectionCard
          title="Campaign Performance Over Time"
          description="Campaign performance across its active duration"
          contentClassName="pt-2"
          actions={<MetricToggle value={chartMetric} onChange={setChartMetric} metrics={CAMPAIGN_CHART_METRICS} />}
        >
          <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
        </SectionCard>
      </section>

      {/* 5. Campaign Conversion Funnel */}
      <section className="mt-12">
        <SectionCard title="Campaign Conversion Funnel" description="From offer shown to cashback rewarded">
          <EngagementFunnel perf={perf} />
        </SectionCard>
      </section>

      {/* 6. Top Merchant IDs */}
      <section className="mt-12">
        <SectionCard title="Top Merchant IDs" description="Merchant IDs contributing to this campaign">
          <MidPerformancePanel mids={midStats} />
        </SectionCard>
      </section>

      {/* 7 + 14. Merchant ID Qualification + Day/Time Performance — paired, both compact standalone visuals */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {midStats.length > 1 && (
          <SectionCard title="Merchant ID Qualification" description="Which MIDs qualify less than average, despite high volume">
            <MidQualificationScatter mids={midStats} />
          </SectionCard>
        )}
        <SectionCard title="Day / Time Performance" description="GMV by day of week and time of day" className={midStats.length > 1 ? undefined : "lg:col-span-2"}>
          <HeatmapGrid cells={heatmap} />
        </SectionCard>
      </section>

      {/* 8. Terminal Performance */}
      {terminalStats.length > 1 && (
        <section className="mt-12">
          <SectionCard title="Terminal Performance" description="Terminal IDs under this campaign's Merchant IDs">
            <TerminalPerformancePanel terminals={terminalStats} />
          </SectionCard>
        </section>
      )}

      {/* 9. Campaign Customer Demographics — who responded? */}
      {demographics && (
        <section className="mt-12">
          <SectionCard title="Campaign Customer Demographics" description="Who responded to this campaign">
            <CustomerDemographicsPanel demographics={demographics} compact />
          </SectionCard>
        </section>
      )}

      {/* 10 + 11. Demographic Performance + New vs. Returning — paired, both customer-segment views */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {demographics && (
          <SectionCard title="Demographic Performance" description="Which age segment performs best">
            <DemographicPerformancePanel buckets={demographics.byAge} />
          </SectionCard>
        )}
        <SectionCard title="New vs. Returning" description="Acquisition vs. retention for this campaign" className={demographics ? undefined : "lg:col-span-2"}>
          <NewReturningPanel stats={newReturningStats} />
        </SectionCard>
      </section>

      {/* 12. Purchase Behaviour */}
      <section className="mt-12">
        <SectionCard title="Purchase Behaviour" description="How much customers are spending per transaction">
          <PurchaseBehaviourPanel stats={amountStats} distribution={amountDistribution} />
        </SectionCard>
      </section>

      {/* 13. Offer Economics — is the offer configuration itself working? */}
      {offerEconomics && (
        <section className="mt-12">
          <SectionCard title="Offer Economics" description="How the offer configuration is playing out in real behavior">
            <OfferEconomicsPanel campaign={campaign} economics={offerEconomics} />
          </SectionCard>
        </section>
      )}

      {/* 15 + 16. Channel Performance + Campaign Eligibility — paired */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {hasChannelSplit && (
          <SectionCard title="Channel Performance" description="Online vs. in-store performance for this campaign">
            <ChannelBehaviourPanel stats={channelStats} metrics={["gmv", "transactions", "aov", "roi", "customers"]} />
          </SectionCard>
        )}
        <SectionCard title="Campaign Eligibility" description="Attempted transactions that didn't receive cashback, and why" className={hasChannelSplit ? undefined : "lg:col-span-2"}>
          <QualificationBreakdown buckets={perf.qualification} qualified={perf.transactions} />
        </SectionCard>
      </section>

      {/* 17. Campaign Insights */}
      {insights.length > 0 && (
        <section className="mt-12">
          <SectionCard title="Campaign Insights" description="Data-driven takeaways for this campaign">
            <KeyInsights insights={insights} />
          </SectionCard>
        </section>
      )}

      {/* 18. Transactions */}
      <section className="mt-12">
        <SectionCard title="Transactions" description="Individual transactions behind the numbers above" contentClassName="px-5 pb-5">
          <TransactionSection rows={transactionRows} showCampaign={false} />
        </SectionCard>
      </section>
    </div>
  )
}
