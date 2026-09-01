import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { Percent, Wallet, ArrowDownToLine, ShieldCheck, Building2, Clock, CalendarDays, TrendingUp, Receipt, Coins, Target, Gauge, BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { DetailGrid } from "@/components/analytics/detail-grid"
import { PerformanceOverTimeChart, type ChartMetric } from "@/components/analytics/performance-over-time-chart"
import { MetricToggle } from "@/components/analytics/metric-toggle"
import { BusinessImpactFlow } from "@/components/analytics/business-impact-flow"
import { CustomerImpactSection } from "@/components/analytics/customer-impact-section"
import { ChannelSplitTable } from "@/components/analytics/channel-split-table"
import { QualificationBreakdown } from "@/components/analytics/qualification-breakdown"
import { TransactionLogTable } from "@/components/analytics/transaction-log-table"
import { campaignById, brandById } from "@/lib/data"
import { formatAed, formatDate, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { durationLabel } from "@/lib/analytics-utils"
import { getCampaignPerformance, bucketSeries, generateTransactionRows } from "@/lib/mock-performance"
import { Megaphone } from "lucide-react"

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

  if (!campaign || !brand || !perf) {
    return <EmptyState icon={<Megaphone className="size-6" />} title="Campaign not found" description="This campaign doesn't exist in the sample dataset." />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Analytics", to: "/analytics" }, { label: brand.name, to: `/analytics/brands/${brand.id}` }, { label: campaign.name }]}
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

      <SectionCard title="Campaign Configuration" description="Primary campaign configuration" className="mb-4">
        <DetailGrid
          items={[
            { icon: <Percent className="size-4" />, label: "Cashback percentage", value: `${campaign.cashbackPercentage}%` },
            { icon: <Wallet className="size-4" />, label: "Campaign budget", value: formatAed(campaign.budget) },
            { icon: <ArrowDownToLine className="size-4" />, label: "Minimum spend", value: campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "No minimum" },
            { icon: <ShieldCheck className="size-4" />, label: "Cashback cap", value: `${formatAed(campaign.cashbackCap)} per transaction` },
          ]}
        />
      </SectionCard>

      {/* Campaign Performance — did this campaign work? */}
      <KpiGrid>
        <KpiCard icon={<TrendingUp className="size-4" />} label="GMV" value={formatAed(perf.transactionValue)} tier="transaction" showTierBadge={false} />
        <KpiCard icon={<Coins className="size-4" />} label="Cashback Issued" value={formatAed(perf.cashbackIssued)} tier="transaction" showTierBadge={false} />
        <KpiCard size="md" icon={<Receipt className="size-4" />} label="Transactions" value={formatNumber(perf.transactions)} tier="transaction" showTierBadge={false} />
        <KpiCard size="md" icon={<Target className="size-4" />} label="ROI" value={formatRatio(perf.roi)} tier="transaction" showTierBadge={false} />
        <KpiCard size="md" icon={<Gauge className="size-4" />} label="Budget Used" value={formatPercent(perf.utilizationPct)} tier="transaction" showTierBadge={false} />
        <KpiCard size="md" icon={<Wallet className="size-4" />} label="Budget Remaining" value={formatAed(perf.remainingBudget)} tier="transaction" showTierBadge={false} />
        <KpiCard size="md" icon={<BarChart3 className="size-4" />} label="Avg. Transaction Value" value={formatAed(perf.avgTransactionValue)} tier="transaction" showTierBadge={false} />
      </KpiGrid>
      <p className="mt-2 text-xs text-muted-foreground">Transaction and cashback figures are prototype estimates — they require transaction/settlement data.</p>

      {/* Business Impact */}
      <section className="mt-12">
        <SectionCard title="Business Impact" description="How cashback investment turned into business generated">
          <BusinessImpactFlow cashbackIssued={perf.cashbackIssued} transactions={perf.transactions} transactionValue={perf.transactionValue} roi={perf.roi} />
        </SectionCard>
      </section>

      {/* Performance Over Time */}
      <section className="mt-12">
        <SectionCard
          title="Performance Over Time"
          description="Campaign performance across its active duration"
          contentClassName="pt-2"
          actions={<MetricToggle value={chartMetric} onChange={setChartMetric} />}
        >
          <PerformanceOverTimeChart data={chartSeries} metric={chartMetric} />
        </SectionCard>
      </section>

      {/* Customer Response */}
      <section className="mt-12">
        <SectionCard title="Customer Response" description="From offer shown to cashback rewarded">
          <CustomerImpactSection perf={perf} />
        </SectionCard>
      </section>

      {/* Channel Performance */}
      {campaign.channel === "both" && perf.channelSplit?.online && perf.channelSplit?.in_store && (
        <section className="mt-12">
          <SectionCard title="Channel Performance" description="Online vs. in-store performance for this campaign">
            <ChannelSplitTable online={perf.channelSplit.online} inStore={perf.channelSplit.in_store} />
          </SectionCard>
        </section>
      )}

      {/* Qualification */}
      <section className="mt-12">
        <SectionCard title="Why Transactions Didn't Qualify" description="Attempted transactions that didn't receive cashback, and why">
          <QualificationBreakdown buckets={perf.qualification} />
        </SectionCard>
      </section>

      {/* Transaction Log */}
      <section className="mt-12">
        <SectionCard title="Transaction Log" description="Individual transactions behind the numbers above" contentClassName="px-5 pb-5">
          <TransactionLogTable rows={transactionRows} showCampaign={false} />
        </SectionCard>
      </section>
    </div>
  )
}
