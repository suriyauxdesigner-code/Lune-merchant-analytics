import { StatusBadge } from "@/components/shared/status-badge"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import type { CampaignPerformance } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

export type TopCampaignMetric = "roi" | "gmv" | "transactions"

const METRIC_META: Record<TopCampaignMetric, { label: string; format: (v: number) => string; value: (perf: CampaignPerformance) => number }> = {
  roi: { label: "ROI", format: (v) => formatRatio(v), value: (p) => p.roi },
  gmv: { label: "GMV", format: formatAed, value: (p) => p.transactionValue },
  transactions: { label: "Transactions", format: formatNumber, value: (p) => p.transactions },
}

const SECONDARY_ORDER: TopCampaignMetric[] = ["gmv", "transactions", "roi"]

/**
 * A single, visually prominent highlight — not another ranked list. The selected metric drives
 * both which campaign is featured and which number is blown up; the other two headline metrics
 * plus cashback sit underneath as quiet supporting context.
 */
export function TopCampaignCard({
  name,
  status,
  perf,
  metric,
  onSelect,
}: {
  name: string
  status: CampaignStatus
  perf: CampaignPerformance
  metric: TopCampaignMetric
  onSelect: () => void
}) {
  const primary = METRIC_META[metric]
  const secondaryMetrics = SECONDARY_ORDER.filter((m) => m !== metric)

  return (
    <button
      onClick={onSelect}
      className="block w-full cursor-pointer rounded-[var(--radius)] border border-border bg-gradient-to-br from-secondary/50 to-card p-6 text-left shadow-card transition-shadow hover:shadow-md sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top campaign</span>
        <StatusBadge status={status} />
      </div>

      <p className="mt-2 truncate text-xl font-bold text-foreground sm:text-2xl">{name}</p>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-4xl font-extrabold tabular-nums text-foreground sm:text-5xl">{primary.format(primary.value(perf))}</span>
        <span className="text-sm font-semibold text-muted-foreground">{primary.label}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-5 text-sm">
        {secondaryMetrics.map((m) => (
          <span key={m} className="text-muted-foreground">
            {METRIC_META[m].format(METRIC_META[m].value(perf))} <span className="text-xs">{METRIC_META[m].label}</span>
          </span>
        ))}
        <span className="text-muted-foreground">
          {formatAed(perf.cashbackIssued)} <span className="text-xs">Cashback</span>
        </span>
      </div>
    </button>
  )
}
