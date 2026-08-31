import * as React from "react"
import { useParams } from "react-router-dom"
import { Megaphone, Radio, CalendarClock, CheckCircle2, Wallet, Percent, Fingerprint, Cpu, Coins, Receipt, TrendingUp, Gauge } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { FilterBar } from "@/components/analytics/filter-bar"
import { CampaignComparisonTable } from "@/components/analytics/campaign-comparison-table"
import { PerformanceOverTimeChart } from "@/components/analytics/performance-over-time-chart"
import { ChannelPerformanceTable } from "@/components/analytics/channel-performance-table"
import { MetricTiles } from "@/components/analytics/metric-tiles"
import { MerchantDetails } from "@/components/analytics/merchant-details"
import { brandById, campaignsForBrand } from "@/lib/data"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries } from "@/lib/mock-performance"
import type { Channel } from "@/lib/types"
import { Store } from "lucide-react"

export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const brand = brandById(brandId)
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)

  const allCampaigns = React.useMemo(() => campaignsForBrand(brandId), [brandId])
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(allCampaigns, filters), [allCampaigns, filters])
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(allCampaigns, filters), [allCampaigns, filters])
  const range = resolveDateRange(filters.dateRange, filters.customRange)

  // Every widget on this page reads from filteredCampaigns so totals always foot to the visible Campaigns table.
  const perf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const chartSeries = React.useMemo(() => bucketSeries(aggregatePerformance(nonDateCampaigns).dailySeries, range), [nonDateCampaigns, range])

  if (!brand) {
    return (
      <EmptyState
        icon={<Store className="size-6" />}
        title="Brand not found"
        description="This brand doesn't exist in the sample dataset."
      />
    )
  }

  const activeCount = filteredCampaigns.filter((c) => c.status === "active").length
  const scheduledCount = filteredCampaigns.filter((c) => c.status === "scheduled").length
  const completedCount = filteredCampaigns.filter((c) => c.status === "completed").length
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)
  const avgCashback = filteredCampaigns.length ? filteredCampaigns.reduce((sum, c) => sum + c.cashbackPercentage, 0) / filteredCampaigns.length : 0
  const merchantIdCount = brand.merchantIds.length
  const terminalIdCount = brand.merchantIds.reduce((sum, m) => sum + m.terminals.length, 0)
  const channels = [...new Set(filteredCampaigns.map((c) => c.channel))] as Channel[]

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Analytics", to: "/analytics" }, { label: brand.name }]}
        title={
          <>
            <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} />
            {brand.name}
          </>
        }
        description={`Brand Analytics · ${brand.website}`}
        showPrototypeTag
      />

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} />

      {/* Brand overview (live) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total campaigns" value={filteredCampaigns.length} icon={<Megaphone className="size-4" />} />
        <KpiCard label="Active campaigns" value={activeCount} icon={<Radio className="size-4" />} />
        <KpiCard label="Scheduled campaigns" value={scheduledCount} icon={<CalendarClock className="size-4" />} />
        <KpiCard label="Completed campaigns" value={completedCount} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Total campaign budget" value={formatAed(totalBudget)} icon={<Wallet className="size-4" />} />
        <KpiCard label="Average cashback %" value={`${avgCashback.toFixed(1)}%`} icon={<Percent className="size-4" />} />
        <KpiCard label="Merchant IDs" value={merchantIdCount} icon={<Fingerprint className="size-4" />} />
        <KpiCard label="Terminal IDs" value={terminalIdCount} icon={<Cpu className="size-4" />} />
        <KpiCard
          label="Active channels"
          value={
            <span className="flex flex-wrap gap-1.5">
              {channels.map((c) => (
                <ChannelBadge key={c} channel={c} />
              ))}
            </span>
          }
        />
      </div>

      {/* Brand performance KPIs (transaction tier) */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Cashback Issued" value={formatAed(perf.cashbackIssued)} icon={<Coins className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transactions" value={formatNumber(perf.transactions)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transaction Value" value={formatAed(perf.transactionValue)} icon={<TrendingUp className="size-3.5" />} tier="transaction" />
        <KpiCard label="Budget Utilization" value={formatPercent(perf.utilizationPct)} icon={<Gauge className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Transaction Value" value={formatAed(perf.avgTransactionValue)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Cashback / Transaction" value={formatAed(perf.avgCashbackPerTransaction)} icon={<Percent className="size-3.5" />} tier="transaction" />
      </div>

      {/* Performance over time */}
      <div className="mt-6">
        <SectionCard title="Brand Performance Over Time" description="Transaction value, transactions and cashback issued over time">
          <PerformanceOverTimeChart data={chartSeries} />
        </SectionCard>
      </div>

      {/* Campaigns */}
      <div className="mt-4">
        <SectionCard title="Campaigns" description="Click a campaign to open its analytics" contentClassName="px-4 pb-5 sm:px-5">
          <CampaignComparisonTable campaigns={filteredCampaigns} />
        </SectionCard>
      </div>

      {/* Channel performance */}
      <div className="mt-4">
        <SectionCard title="Campaigns by Channel" description="Campaign count, configured budget and prototype transaction performance by channel" contentClassName="px-4 pb-5 sm:px-5">
          <ChannelPerformanceTable campaigns={filteredCampaigns} />
        </SectionCard>
      </div>

      {/* Customer performance */}
      <div className="mt-4">
        <SectionCard title="Customer Performance" description="Reach and repeat behavior for this brand">
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

      {/* Merchant Details */}
      <div className="mt-4">
        <SectionCard title="Merchant Details" description="This brand's linked merchant IDs, acquirers and terminals">
          <MerchantDetails merchantIds={brand.merchantIds} />
        </SectionCard>
      </div>
    </div>
  )
}
