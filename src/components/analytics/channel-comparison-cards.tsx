import { ChannelBadge } from "@/components/shared/channel-badge"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { aggregateChannelPerformance } from "@/lib/mock-performance"
import type { Campaign, Channel } from "@/lib/types"

const CHANNELS: Channel[] = ["online", "in_store", "both"]

/** A compact side-by-side comparison — not another table — so channel performance reads at a glance. */
export function ChannelComparisonCards({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CHANNELS.map((channel) => {
        const perf = aggregateChannelPerformance(campaigns, channel)
        return (
          <div key={channel} className="rounded-[var(--radius-sm)] border border-border bg-card p-5">
            <ChannelBadge channel={channel} />
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">GMV</dt>
                <dd className="text-sm font-semibold text-foreground">{formatAed(perf.transactionValue)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Transactions</dt>
                <dd className="text-sm font-semibold text-foreground">{formatNumber(perf.transactions)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Cashback</dt>
                <dd className="text-sm font-semibold text-foreground">{formatAed(perf.cashbackIssued)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">ROI</dt>
                <dd className="text-sm font-semibold text-foreground">{formatRatio(perf.roi)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="text-xs text-muted-foreground">Budget utilization</dt>
                <dd className="text-sm font-semibold text-foreground">{formatPercent(perf.utilizationPct)}</dd>
              </div>
            </dl>
          </div>
        )
      })}
    </div>
  )
}
