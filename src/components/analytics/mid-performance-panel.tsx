import { RankedBarList } from "./ranked-bar-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { MidStat } from "@/lib/transaction-stats"

/** Which Merchant IDs are driving results — ranked by GMV, with compact operational detail below. */
export function MidPerformancePanel({ mids }: { mids: MidStat[] }) {
  if (mids.length === 0) {
    return <p className="text-sm text-muted-foreground">No Merchant ID activity in this range.</p>
  }

  const totalGmv = mids.reduce((s, m) => s + m.gmv, 0)
  const top = mids.slice(0, 6)

  return (
    <div>
      <RankedBarList
        items={top.map((m) => ({ id: m.mid, label: m.mid, value: m.gmv, sublabel: `${formatRatio(m.roi)} ROI` }))}
        formatValue={formatAed}
      />
      {totalGmv > 0 && top[0] && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{top[0].mid}</span> contributes {formatPercent((top[0].gmv / totalGmv) * 100, 0)} of the GMV shown here.
        </p>
      )}
      <div className="mt-5 border-t border-border pt-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant ID</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>GMV</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>AOV</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Qualification rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mids.map((m) => (
              <TableRow key={m.mid}>
                <TableCell className="font-medium text-foreground">{m.mid}</TableCell>
                <TableCell className="text-muted-foreground">{m.channel}</TableCell>
                <TableCell className="text-foreground">{formatAed(m.gmv)}</TableCell>
                <TableCell className="text-foreground">{formatNumber(m.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(m.aov)}</TableCell>
                <TableCell className="text-foreground">{formatRatio(m.roi)}</TableCell>
                <TableCell className="text-foreground">{formatPercent(m.qualificationRate, 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
