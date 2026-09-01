import { ChannelBadge } from "@/components/shared/channel-badge"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import type { ChannelPerf } from "@/lib/mock-performance"

export function ChannelSplitTable({ online, inStore }: { online: ChannelPerf; inStore: ChannelPerf }) {
  const rows: { channel: "online" | "in_store"; perf: ChannelPerf }[] = [
    { channel: "online", perf: online },
    { channel: "in_store", perf: inStore },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map(({ channel, perf }) => (
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
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-xs text-muted-foreground">ROI</dt>
              <dd className="text-sm font-semibold text-foreground">{formatRatio(perf.roi)}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  )
}
