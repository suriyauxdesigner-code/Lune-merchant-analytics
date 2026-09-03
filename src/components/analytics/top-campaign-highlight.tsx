import { TrendingUp } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { CampaignPerformance } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

const METRICS: { label: string; format: (v: number) => string; value: (perf: CampaignPerformance) => number }[] = [
  { label: "GMV", format: formatAed, value: (p) => p.transactionValue },
  { label: "Transactions", format: formatNumber, value: (p) => p.transactions },
  { label: "ROI", format: (v) => formatRatio(v), value: (p) => p.roi },
  { label: "Cashback", format: formatAed, value: (p) => p.cashbackIssued },
]

/**
 * The one campaign worth calling out — not a duplicate of the table's top row. The uplift line
 * is the reason it's here: a comparison a merchant can't get by just sorting the table by GMV.
 */
export function TopCampaignHighlight({
  name,
  status,
  perf,
  avgGmv,
  onSelect,
}: {
  name: string
  status: CampaignStatus
  perf: CampaignPerformance
  /** Average GMV across this brand's other eligible campaigns — the baseline the uplift is measured against. */
  avgGmv: number
  onSelect: () => void
}) {
  const upliftPct = avgGmv > 0 ? ((perf.transactionValue - avgGmv) / avgGmv) * 100 : null

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

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/70 pt-6 sm:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label}>
            <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">{m.format(m.value(perf))}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {upliftPct != null && upliftPct >= 1 && (
        <p className="mt-5 flex items-center gap-1.5 border-t border-border/70 pt-4 text-sm font-semibold text-success">
          <TrendingUp className="size-4" />
          {formatPercent(upliftPct, 0)} above this brand's average campaign GMV ({formatAed(avgGmv)})
        </p>
      )}
    </button>
  )
}
