import { StatusBadge } from "@/components/shared/status-badge"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import type { CampaignPerformance } from "@/lib/mock-performance"
import type { CampaignStatus } from "@/lib/types"

const METRICS: { label: string; format: (v: number) => string; value: (perf: CampaignPerformance) => number }[] = [
  { label: "GMV", format: formatAed, value: (p) => p.transactionValue },
  { label: "Transactions", format: formatNumber, value: (p) => p.transactions },
  { label: "ROI", format: (v) => formatRatio(v), value: (p) => p.roi },
  { label: "Cashback", format: formatAed, value: (p) => p.cashbackIssued },
]

/**
 * A single, visually prominent highlight — not another ranked list. GMV, Transactions, ROI, and
 * Cashback carry equal visual weight in a balanced row; there's no single "hero" metric.
 */
export function TopCampaignCard({
  name,
  status,
  perf,
  onSelect,
}: {
  name: string
  status: CampaignStatus
  perf: CampaignPerformance
  onSelect: () => void
}) {
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
    </button>
  )
}
