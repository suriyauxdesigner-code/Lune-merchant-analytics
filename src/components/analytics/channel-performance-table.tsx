import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { aggregateChannelPerformance } from "@/lib/mock-performance"
import type { Campaign, Channel } from "@/lib/types"

const CHANNELS: Channel[] = ["online", "in_store", "both"]

export function ChannelPerformanceTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Campaigns</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>Transaction value</TableHead>
          <TableHead>Cashback issued</TableHead>
          <TableHead>Budget utilization</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {CHANNELS.map((channel) => {
          const exactMatch = campaigns.filter((c) => c.channel === channel)
          // "Online & In-Store" campaigns contribute to both the online and in-store buckets (split), so count them there too.
          const contributing = channel === "both" ? exactMatch : [...exactMatch, ...campaigns.filter((c) => c.channel === "both")]
          const perf = aggregateChannelPerformance(campaigns, channel)
          return (
            <TableRow key={channel}>
              <TableCell>
                <ChannelBadge channel={channel} />
              </TableCell>
              <TableCell className="text-foreground">{contributing.length}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.budget)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
              <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
