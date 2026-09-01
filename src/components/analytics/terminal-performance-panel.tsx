import { RankedBarList } from "./ranked-bar-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { TerminalStat } from "@/lib/transaction-stats"

/** Terminal IDs under this campaign's Merchant IDs — ranked by GMV, with qualification rate to spot operational issues. */
export function TerminalPerformancePanel({ terminals }: { terminals: TerminalStat[] }) {
  if (terminals.length === 0) {
    return <p className="text-sm text-muted-foreground">No terminal activity in this range.</p>
  }

  return (
    <div>
      <RankedBarList
        items={terminals.map((t) => ({ id: t.terminalName, label: t.terminalName, value: t.gmv, sublabel: `${formatPercent(t.qualificationRate, 0)} qualified` }))}
        formatValue={formatAed}
        color="hsl(217 91% 55%)"
      />
      <div className="mt-5 border-t border-border pt-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Terminal</TableHead>
              <TableHead>Merchant ID</TableHead>
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
                <TableCell className="text-muted-foreground">{t.mid ?? "—"}</TableCell>
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
