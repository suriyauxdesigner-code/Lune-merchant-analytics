import * as React from "react"
import { Building2, Megaphone, Radio, CalendarClock, CheckCircle2, Wallet, Coins, Receipt, TrendingUp, Gauge, Percent } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart } from "@/components/analytics/performance-over-time-chart"
import { StatusDistribution } from "@/components/analytics/status-distribution"
import { ChannelPerformanceTable } from "@/components/analytics/channel-performance-table"
import { BudgetOverview } from "@/components/analytics/budget-overview"
import { MetricTiles } from "@/components/analytics/metric-tiles"
import { CampaignFunnel } from "@/components/analytics/campaign-funnel"
import { BrandTable } from "@/components/analytics/brand-table"
import { CampaignTable } from "@/components/analytics/campaign-table"
import { BRANDS, CAMPAIGNS } from "@/lib/data"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import {
  applyCampaignFilters,
  applyCampaignFiltersExceptDate,
  resolveDateRange,
  DEFAULT_FILTERS,
} from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

export default function AnalyticsOverview() {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)

  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(CAMPAIGNS, filters), [filters])
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(CAMPAIGNS, filters), [filters])
  const range = resolveDateRange(filters.dateRange, filters.customRange)

  const perf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const chartSeries = React.useMemo(() => {
    const fullSeries = aggregatePerformance(nonDateCampaigns).dailySeries
    return bucketSeries(fullSeries, range)
  }, [nonDateCampaigns, range])

  const brandIds = new Set(filteredCampaigns.map((c) => c.brandId))
  const activeCount = filteredCampaigns.filter((c) => c.status === "active").length
  const scheduledCount = filteredCampaigns.filter((c) => c.status === "scheduled").length
  const completedCount = filteredCampaigns.filter((c) => c.status === "completed").length
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)

  const statusCounts = React.useMemo(() => {
    const base: Record<CampaignStatus, number> = { active: 0, pending_approval: 0, scheduled: 0, completed: 0, rejected: 0 }
    for (const c of filteredCampaigns) base[c.status]++
    return base
  }, [filteredCampaigns])

  const visibleBrands = BRANDS.filter((b) => filteredCampaigns.some((c) => c.brandId === b.id))

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Monitor campaign activity, brands, budgets and performance across your business."
        showPrototypeTag
      />

      <FilterBar filters={filters} onChange={setFilters} showCampaignSearch />

      {filteredCampaigns.length === 0 && (
        <div className="mb-6 rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      )}

      {/* Live KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Brands" value={brandIds.size} icon={<Building2 className="size-4" />} />
        <KpiCard label="Total Campaigns" value={filteredCampaigns.length} icon={<Megaphone className="size-4" />} />
        <KpiCard label="Active Campaigns" value={activeCount} icon={<Radio className="size-4" />} />
        <KpiCard label="Scheduled Campaigns" value={scheduledCount} icon={<CalendarClock className="size-4" />} />
        <KpiCard label="Completed Campaigns" value={completedCount} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Configured Campaign Budget" value={formatAed(totalBudget)} icon={<Wallet className="size-4" />} />
      </div>

      {/* Performance KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Cashback Issued" value={formatAed(perf.cashbackIssued)} icon={<Coins className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transactions" value={formatNumber(perf.transactions)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Transaction Value" value={formatAed(perf.transactionValue)} icon={<TrendingUp className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Transaction Value" value={formatAed(perf.avgTransactionValue)} icon={<Receipt className="size-3.5" />} tier="transaction" />
        <KpiCard label="Budget Utilization" value={formatPercent(perf.utilizationPct)} icon={<Gauge className="size-3.5" />} tier="transaction" />
        <KpiCard label="Average Cashback / Transaction" value={formatAed(perf.avgCashbackPerTransaction)} icon={<Percent className="size-3.5" />} tier="transaction" />
      </div>

      {/* Performance over time */}
      <div className="mt-6">
        <SectionCard title="Performance Over Time" description="Transaction value, transactions and cashback issued for the selected range">
          <PerformanceOverTimeChart data={chartSeries} />
        </SectionCard>
      </div>

      {/* Status + budget */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Campaign Status" description="Distribution across the selected filters">
          <StatusDistribution counts={statusCounts} />
        </SectionCard>
        <SectionCard title="Budget Overview" description="Configured budget vs. cashback spend" className="lg:col-span-2">
          <BudgetOverview budget={totalBudget} perf={perf} />
        </SectionCard>
      </div>

      {/* Channel performance */}
      <div className="mt-4">
        <SectionCard title="Performance by Channel" description="Campaigns, budget and prototype transaction performance by channel" contentClassName="px-4 pb-5 sm:px-5">
          <ChannelPerformanceTable campaigns={filteredCampaigns} />
        </SectionCard>
      </div>

      {/* Brand performance */}
      <div className="mt-4">
        <SectionCard title="Brand Performance" description="Campaign activity, budget and performance across your onboarded brands" contentClassName="px-4 pb-5 sm:px-5">
          <BrandTable brands={visibleBrands} campaignsOverride={filteredCampaigns} />
        </SectionCard>
      </div>

      {/* Campaign performance */}
      <div className="mt-4">
        <SectionCard title="Campaign Performance" description="Click a campaign to open its analytics" contentClassName="px-4 pb-5 sm:px-5">
          <CampaignTable campaigns={filteredCampaigns} />
        </SectionCard>
      </div>

      {/* Customer performance */}
      <div className="mt-4">
        <SectionCard title="Customer Performance" description="Reach and repeat behavior across your business">
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
        <SectionCard title="Campaign Funnel" description="From offer shown to cashback issued, across your business">
          <CampaignFunnel data={perf} />
        </SectionCard>
      </div>
    </div>
  )
}
