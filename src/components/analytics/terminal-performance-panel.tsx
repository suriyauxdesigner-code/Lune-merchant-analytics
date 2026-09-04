import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { TerminalStat } from "@/lib/transaction-stats"

type LocationGroup = { location: string; gmv: number; transactions: number; terminals: TerminalStat[] }

function groupByLocation(terminals: TerminalStat[]): LocationGroup[] {
  const byLocation = new Map<string, TerminalStat[]>()
  for (const t of terminals) {
    const list = byLocation.get(t.terminalName)
    if (list) list.push(t)
    else byLocation.set(t.terminalName, [t])
  }
  return [...byLocation.entries()]
    .map(([location, list]) => ({
      location,
      gmv: list.reduce((s, t) => s + t.gmv, 0),
      transactions: list.reduce((s, t) => s + t.transactions, 0),
      terminals: [...list].sort((a, b) => b.gmv - a.gmv),
    }))
    .sort((a, b) => b.gmv - a.gmv)
}

/**
 * Which physical locations are driving this campaign, and — since a location can have more than
 * one registered terminal — which terminal within it. Grouped by location first (the level a
 * merchant thinks in); each location's own terminals are listed underneath, never flattened into
 * a single "one location = one terminal" row.
 */
export function TerminalPerformancePanel({ terminals }: { terminals: TerminalStat[] }) {
  if (terminals.length === 0) {
    return <p className="text-sm text-muted-foreground">No location activity in this range.</p>
  }

  const groups = groupByLocation(terminals)
  const totalGmv = groups.reduce((s, g) => s + g.gmv, 0)
  const top = groups[0]
  const topSharePct = totalGmv > 0 ? (top.gmv / totalGmv) * 100 : 0

  return (
    <div>
      {totalGmv > 0 && (
        <div className="mb-6">
          <p className="text-2xl font-bold text-foreground sm:text-3xl">{formatPercent(topSharePct, 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            of this campaign's GMV comes from <span className="font-medium text-foreground">{top.location}</span>
            {top.terminals.length > 1 ? ` across its ${top.terminals.length} terminals` : ""}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {groups.map((group) => {
          const sharePct = totalGmv > 0 ? (group.gmv / totalGmv) * 100 : 0
          return (
            <div key={group.location} className="rounded-[var(--radius-sm)] border border-border">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{group.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.terminals.length} terminal{group.terminals.length === 1 ? "" : "s"} · {formatPercent(sharePct, 0)} of GMV
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums text-foreground">{formatAed(group.gmv)}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">{formatNumber(group.transactions)} transactions</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {group.terminals.map((t) => (
                  <div key={t.terminalId ?? t.terminalName} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Terminal {t.terminalId ?? "—"}</span>
                    <span className="flex items-center gap-4 tabular-nums text-muted-foreground">
                      <span>{formatNumber(t.transactions)} txns</span>
                      <span className="font-semibold text-foreground">{formatAed(t.gmv)}</span>
                      <span>{formatPercent(t.qualificationRate, 0)} qualified</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
