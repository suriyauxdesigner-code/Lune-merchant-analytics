import { RankedBarList } from "./ranked-bar-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { TerminalStat } from "@/lib/transaction-stats"

/**
 * Which physical locations are driving this campaign — ranked by GMV. Each row is one
 * registered terminal; the terminal ID is shown as secondary reference detail, not the
 * headline, since a merchant thinks in store locations, not terminal IDs.
 */
export function TerminalPerformancePanel({ terminals }: { terminals: TerminalStat[] }) {
  if (terminals.length === 0) {
    return <p className="text-sm text-muted-foreground">No location activity in this range.</p>
  }

  const totalGmv = terminals.reduce((s, t) => s + t.gmv, 0)
  const top = terminals[0]
  const topSharePct = totalGmv > 0 ? (top.gmv / totalGmv) * 100 : 0

  return (
    <div>
      {totalGmv > 0 && (
        <div className="mb-5">
          <p className="text-2xl font-bold text-foreground sm:text-3xl">{formatPercent(topSharePct, 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            of this campaign's GMV comes from <span className="font-medium text-foreground">{top.terminalName}</span>
          </p>
        </div>
      )}
      <RankedBarList
        items={terminals.map((t) => ({
          id: t.terminalName,
          label: t.terminalName,
          value: t.gmv,
          sublabel: `${formatPercent(totalGmv > 0 ? (t.gmv / totalGmv) * 100 : 0, 0)} of GMV`,
        }))}
        formatValue={formatAed}
        color="hsl(217 91% 55%)"
      />
      <div className="mt-5 border-t border-border pt-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Terminal ID</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>GMV</TableHead>
              <TableHead>Cashback</TableHead>
              <TableHead>Qualification rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terminals.map((t) => (
              <TableRow key={t.terminalName}>
                <TableCell className="font-medium text-foreground">{t.terminalName}</TableCell>
                <TableCell className="text-muted-foreground">{t.terminalId ?? "—"}</TableCell>
                <TableCell className="text-foreground">{formatNumber(t.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(t.gmv)}</TableCell>
                <TableCell className="text-foreground">{formatAed(t.cashback)}</TableCell>
                <TableCell className="text-foreground">{formatPercent(t.qualificationRate, 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
