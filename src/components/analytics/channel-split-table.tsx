import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { ChannelPerf } from "@/lib/mock-performance"

export function ChannelSplitTable({ online, inStore }: { online: ChannelPerf; inStore: ChannelPerf }) {
  const rows: { channel: "online" | "in_store"; perf: ChannelPerf }[] = [
    { channel: "online", perf: online },
    { channel: "in_store", perf: inStore },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>Transaction value</TableHead>
          <TableHead>Cashback issued</TableHead>
          <TableHead>Avg. transaction value</TableHead>
          <TableHead>Budget utilization</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ channel, perf }) => (
          <TableRow key={channel}>
            <TableCell>
              <ChannelBadge channel={channel} />
            </TableCell>
            <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
            <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
            <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
            <TableCell className="text-foreground">{formatAed(perf.avgTransactionValue)}</TableCell>
            <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
