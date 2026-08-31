import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { getCampaignPerformance } from "@/lib/mock-performance"
import type { Campaign } from "@/lib/types"
import { PackageSearch } from "lucide-react"

/** The Brand Analytics "campaign comparison" table. */
export function CampaignComparisonTable({ campaigns }: { campaigns: Campaign[] }) {
  const navigate = useNavigate()

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-6" />}
        title="No campaigns match these filters"
        description="Try widening the date range or clearing a filter to see more campaigns."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Cashback %</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>Cashback issued</TableHead>
          <TableHead>Budget utilization</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((c) => {
          const perf = getCampaignPerformance(c)
          return (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/analytics/campaigns/${c.id}`)}>
              <TableCell>
                <span className="font-medium text-foreground">{c.name}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-foreground">{formatAed(c.budget)}</TableCell>
              <TableCell className="text-foreground">{c.cashbackPercentage}%</TableCell>
              <TableCell>
                <ChannelBadge channel={c.channel} />
              </TableCell>
              <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
              <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
