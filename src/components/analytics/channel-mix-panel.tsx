import { ChannelSplitTable } from "./channel-split-table"
import { formatPercent } from "@/lib/utils"
import type { ChannelPerf } from "@/lib/mock-performance"

/** Online vs. in-store — channel mix and a direct comparison, not a repeat of generic per-channel KPI cards. */
export function ChannelMixPanel({ online, inStore }: { online: ChannelPerf; inStore: ChannelPerf }) {
  const totalGmv = online.transactionValue + inStore.transactionValue
  const onlinePct = totalGmv > 0 ? (online.transactionValue / totalGmv) * 100 : 50
  const inStorePct = 100 - onlinePct

  return (
    <div>
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">GMV mix</span>
          <span className="text-muted-foreground">
            {formatPercent(onlinePct, 0)} online · {formatPercent(inStorePct, 0)} in-store
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${onlinePct}%` }} />
          <div className="h-full bg-warning" style={{ width: `${inStorePct}%` }} />
        </div>
      </div>
      <ChannelSplitTable online={online} inStore={inStore} />
    </div>
  )
}
