import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { Percent, Wallet, ArrowDownToLine, ShieldCheck, Building2, Coins, Receipt, TrendingUp, Gauge, Clock, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { DetailGrid } from "@/components/analytics/detail-grid"
import { BudgetOverview } from "@/components/analytics/budget-overview"
import { PerformanceOverTimeChart } from "@/components/analytics/performance-over-time-chart"
import { DateRangeSelect } from "@/components/analytics/date-range-select"
import { MetricTiles } from "@/components/analytics/metric-tiles"
import { CampaignFunnel } from "@/components/analytics/campaign-funnel"
import { CampaignRoi } from "@/components/analytics/campaign-roi"
import { ChannelSplitTable } from "@/components/analytics/channel-split-table"
import { campaignById, brandById } from "@/lib/data"
import { formatAed, formatDate, formatNumber, formatPercent } from "@/lib/utils"
import { durationLabel, resolveDateRange, type DateRangeKey, type DateRange } from "@/lib/analytics-utils"
import { getCampaignPerformance, bucketSeries } from "@/lib/mock-performance"
import { FUTURE_OPPORTUNITIES } from "@/lib/future-data"
import { Megaphone } from "lucide-react"

export default function CampaignAnalytics() {
  const { campaignId = "" } = useParams()
  const campaign = campaignById(campaignId)
  const brand = campaign ? brandById(campaign.brandId) : undefined
  const [chartRangeKey, setChartRangeKey] = React.useState<DateRangeKey>("90d")
  const [chartCustomRange, setChartCustomRange] = React.useState<DateRange | undefined>(undefined)

  const perf = React.useMemo(() => (campaign ? getCampaignPerformance(campaign) : null), [campaign])
  const chartRange = resolveDateRange(chartRangeKey, chartCustomRange)
  const chartSeries = React.useMemo(() => (perf ? bucketSeries(perf.dailySeries, chartRange) : []), [perf, chartRange])

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

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Cashback Issued" value={formatAed(perf.cashbackIssued)} icon={<Coins className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transactions" value={formatNumber(perf.transactions)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transaction Value" value={formatAed(perf.transactionValue)} icon={<TrendingUp className="size-3.5" />} tier="transaction" />
        <KpiCard label="Budget Utilization" value={formatPercent(perf.utilizationPct)} icon={<Gauge className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Transaction Value" value={formatAed(perf.avgTransactionValue)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Cashback / Transaction" value={formatAed(perf.avgCashbackPerTransaction)} icon={<Percent className="size-3.5" />} tier="transaction" />
      </div>

      {/* Budget */}
      <div className="mt-4">
        <SectionCard title="Campaign Budget" description="Configured budget vs. actual cashback spend">
          <BudgetOverview budget={campaign.budget} perf={perf} />
        </SectionCard>
      </div>

      {/* Performance chart */}
      <div className="mt-4">
        <SectionCard
          title="Campaign Performance"
          description="Transaction value, cashback issued and transactions over time"
          actions={<DateRangeSelect value={chartRangeKey} customRange={chartCustomRange} onChange={(key, custom) => { setChartRangeKey(key); setChartCustomRange(custom) }} />}
        >
          <PerformanceOverTimeChart data={chartSeries} />
        </SectionCard>
      </div>

      {/* Customer performance */}
      <div className="mt-4">
        <SectionCard title="Customer Performance" description="Reach and repeat behavior for this campaign">
          <MetricTiles
            columns={5}
            items={[
              { key: "reached", label: "Customers Reached", value: formatNumber(perf.customersReached), tier: "future" },
              { key: "transacted", label: "Customers Who Transacted", value: formatNumber(perf.customersTransacted), tier: "future" },
              { key: "new", label: "New Customers", value: formatNumber(perf.newCustomers), tier: "future" },
              { key: "returning", label: "Returning Customers", value: formatNumber(perf.returningCustomers), tier: "future" },
              { key: "repeat", label: "Repeat Purchase Rate", value: formatPercent(perf.repeatPurchaseRate * 100), tier: "future" },
            ]}
          />
        </SectionCard>
      </div>

      {/* Funnel */}
      <div className="mt-4">
        <SectionCard title="Campaign Funnel" description="From offer shown to cashback issued">
          <CampaignFunnel data={perf} />
        </SectionCard>
      </div>

      {/* Conversion */}
      <div className="mt-4">
        <SectionCard title="Campaign Conversion" description="Conversion rates between funnel stages">
          <MetricTiles
            columns={4}
            items={[
              { key: "view-click", label: "View → Click Rate", value: formatPercent(perf.viewToClickRate * 100), tier: "future" },
              { key: "click-txn", label: "Click → Transaction Rate", value: formatPercent(perf.clickToTransactionRate * 100), tier: "future" },
              { key: "offer-txn", label: "Offer → Transaction Conversion", value: formatPercent(perf.offerToTransactionRate * 100), tier: "future" },
              { key: "txn-cashback", label: "Transaction → Rewarded Rate", value: formatPercent(perf.transactionToCashbackRate * 100), tier: "transaction" },
            ]}
          />
        </SectionCard>
      </div>

      {/* ROI */}
      <div className="mt-4">
        <SectionCard title="Campaign ROI" description="Return on investment for this campaign">
          <CampaignRoi data={perf} />
        </SectionCard>
      </div>

      {/* Channel performance */}
      {campaign.channel === "both" && perf.channelSplit?.online && perf.channelSplit?.in_store && (
        <div className="mt-4">
          <SectionCard title="Channel Performance" description="Online vs. in-store performance for this campaign" contentClassName="px-4 pb-5 sm:px-5">
            <ChannelSplitTable online={perf.channelSplit.online} inStore={perf.channelSplit.in_store} />
          </SectionCard>
        </div>
      )}

      {/* Future opportunities */}
      <div className="mt-4">
        <SectionCard title="Future Opportunities" description="What becomes more precise once transaction attribution and event data is instrumented">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUTURE_OPPORTUNITIES.map((o) => (
              <div key={o.title} className="rounded-[var(--radius-sm)] border border-border bg-muted/30 p-4">
                <h5 className="text-sm font-semibold text-foreground">{o.title}</h5>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{o.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
