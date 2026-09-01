import * as React from "react"
import { useParams } from "react-router-dom"
import { Store } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard, KpiStrip } from "@/components/shared/kpi-card"
import { SectionCard } from "@/components/shared/section-card"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/analytics/filter-bar"
import { PerformanceOverTimeChart, type ChartMode } from "@/components/analytics/performance-over-time-chart"
import { BudgetHealthPanel } from "@/components/analytics/budget-health-panel"
import { CustomerPerformancePanel } from "@/components/analytics/customer-performance-panel"
import { CampaignPerformanceTabs } from "@/components/analytics/campaign-performance-tabs"
import { MerchantDetails } from "@/components/analytics/merchant-details"
import { brandById, campaignsForBrand } from "@/lib/data"
import { cn, formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { applyCampaignFilters, applyCampaignFiltersExceptDate, resolveDateRange, DEFAULT_FILTERS } from "@/lib/analytics-utils"
import { aggregatePerformance, bucketSeries } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

export default function BrandAnalytics() {
  const { brandId = "" } = useParams()
  const brand = brandById(brandId)
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS)
  const [chartMode, setChartMode] = React.useState<ChartMode>("value")
  const campaignSectionRef = React.useRef<HTMLDivElement>(null)

  const allCampaigns = React.useMemo(() => campaignsForBrand(brandId), [brandId])
  const filteredCampaigns = React.useMemo(() => applyCampaignFilters(allCampaigns, filters), [allCampaigns, filters])
  const nonDateCampaigns = React.useMemo(() => applyCampaignFiltersExceptDate(allCampaigns, filters), [allCampaigns, filters])
  const range = resolveDateRange(filters.dateRange, filters.customRange)

  // Every widget on this page reads from filteredCampaigns so totals always foot to the visible Campaign Performance table.
  const perf = React.useMemo(() => aggregatePerformance(filteredCampaigns), [filteredCampaigns])
  const chartSeries = React.useMemo(() => bucketSeries(aggregatePerformance(nonDateCampaigns).dailySeries, range), [nonDateCampaigns, range])

  const statusCounts = React.useMemo(() => {
    const base: Record<CampaignStatus, number> = { active: 0, pending_approval: 0, scheduled: 0, completed: 0, rejected: 0 }
    for (const c of filteredCampaigns) base[c.status]++
    return base
  }, [filteredCampaigns])

  if (!brand) {
    return <EmptyState icon={<Store className="size-6" />} title="Brand not found" description="This brand doesn't exist in the sample dataset." />
  }

  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0)

  function reviewStatus(status: CampaignStatus) {
    setFilters((f) => ({ ...f, status }))
    campaignSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
      <p className="-mt-5 mb-7 text-sm text-muted-foreground">
        {filteredCampaigns.length} campaign{filteredCampaigns.length === 1 ? "" : "s"} · {statusCounts.active} active · {statusCounts.scheduled} scheduled ·{" "}
        {statusCounts.completed} completed
      </p>

      <FilterBar filters={filters} onChange={setFilters} showBrand={false} />

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          No campaigns match this date range and filter combination. Try widening the range or clearing a filter.
        </div>
      ) : (
        <>
          {/* Performance Overview */}
          <KpiStrip>
            <KpiCard variant="plain" label="Transaction Value" value={formatAed(perf.transactionValue)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" label="Cashback Issued" value={formatAed(perf.cashbackIssued)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Transactions" value={formatNumber(perf.transactions)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Budget Utilization" value={formatPercent(perf.utilizationPct)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Avg. Transaction Value" value={formatAed(perf.avgTransactionValue)} tier="transaction" showTierBadge={false} />
            <KpiCard variant="plain" size="md" label="Avg. Cashback / Transaction" value={formatAed(perf.avgCashbackPerTransaction)} tier="transaction" showTierBadge={false} />
          </KpiStrip>
          <p className="mt-2 text-xs text-muted-foreground">Transaction and cashback figures are prototype estimates — they require transaction/settlement data.</p>

          {/* Performance Over Time */}
          <section className="mt-12">
            <SectionCard
              title="Performance Over Time"
              description="Is performance improving or declining?"
              contentClassName="pt-2"
              actions={
                <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
                  {(["value", "transactions"] as ChartMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMode(m)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        chartMode === m ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === "value" ? "Value" : "Transactions"}
                    </button>
                  ))}
                </div>
              }
            >
              <PerformanceOverTimeChart data={chartSeries} mode={chartMode} />
            </SectionCard>
          </section>

          {/* Budget + Customer Performance */}
          <section className="mt-14 grid gap-6 lg:grid-cols-2">
            <BudgetHealthPanel budget={totalBudget} perf={perf} statusCounts={statusCounts} onReviewStatus={reviewStatus} />
            <CustomerPerformancePanel perf={perf} />
          </section>

          {/* Campaign Performance */}
          <section className="mt-14" ref={campaignSectionRef}>
            <SectionCard title="Campaign Performance" description="Click a campaign to open its analytics" contentClassName="px-5 pb-5">
              <CampaignPerformanceTabs campaigns={filteredCampaigns} />
            </SectionCard>
          </section>

          {/* Merchant Details */}
          <section className="mt-14">
            <SectionCard title="Merchant Details" description="This brand's linked merchant IDs, acquirers and terminals">
              <MerchantDetails merchantIds={brand.merchantIds} />
            </SectionCard>
          </section>
        </>
      )}
    </div>
  )
}
