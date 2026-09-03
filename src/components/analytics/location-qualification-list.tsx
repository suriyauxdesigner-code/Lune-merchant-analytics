import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { cn, formatNumber, formatPercent } from "@/lib/utils"
import type { MidStat } from "@/lib/transaction-stats"

const LOW_THRESHOLD_PTS = 5

/**
 * Which locations qualify less than average, despite high volume — a ranked list instead of a
 * scatter plot, so the same "high volume + low qualification rate" insight is scannable without
 * reading two axes. Sorted by transaction volume (where the most is at stake), with below-average
 * locations flagged so a high-volume underperformer stands out immediately.
 */
export function LocationQualificationList({ mids }: { mids: MidStat[] }) {
  if (mids.length === 0) {
    return <EmptyState icon={<AlertTriangle className="size-6" />} title="No location data" description="Not enough activity yet to compare locations." />
  }

  const avgQualification = mids.reduce((s, m) => s + m.qualificationRate, 0) / mids.length
  const rows = mids
    .map((m) => ({ ...m, label: m.locations[0] ?? m.mid, isLow: m.qualificationRate < avgQualification - LOW_THRESHOLD_PTS }))
    .sort((a, b) => b.transactions - a.transactions)
  const flagged = rows.filter((r) => r.isLow)

  return (
    <div>
      {flagged.length > 0 ? (
        <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] bg-warning-bg px-3.5 py-2.5 text-sm font-medium text-warning-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            {flagged.length} location{flagged.length === 1 ? "" : "s"} need{flagged.length === 1 ? "s" : ""} attention — qualifying well below average despite meaningful transaction volume.
          </span>
        </div>
      ) : (
        <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] bg-success-bg px-3.5 py-2.5 text-sm font-medium text-success-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>All locations are qualifying at or above average.</span>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Transaction Volume</TableHead>
            <TableHead>Qualification Rate</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.mid} className={cn(r.isLow && "bg-destructive-bg/40")}>
              <TableCell className="font-medium text-foreground">{r.label}</TableCell>
              <TableCell className="text-foreground">{formatNumber(r.transactions)}</TableCell>
              <TableCell className="text-foreground">{formatPercent(r.qualificationRate, 0)}</TableCell>
              <TableCell>
                <Badge variant={r.isLow ? "destructive" : "success"} dot>
                  {r.isLow ? "Below average" : "At/above average"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="mt-3 text-xs text-muted-foreground">Average qualification rate across these locations: {formatPercent(avgQualification, 0)}.</p>
    </div>
  )
}
