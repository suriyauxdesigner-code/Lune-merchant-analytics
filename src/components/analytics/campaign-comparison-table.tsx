import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { getCampaignPerformance } from "@/lib/mock-performance"
import type { Campaign } from "@/lib/types"
import { PackageSearch } from "lucide-react"

/** Which campaigns are driving this brand's business results — sorted as given (already business-ordered by the caller). */
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

  const sorted = [...campaigns].sort((a, b) => getCampaignPerformance(b).transactionValue - getCampaignPerformance(a).transactionValue)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>GMV</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>Customers</TableHead>
          <TableHead>Cashback</TableHead>
          <TableHead>ROI</TableHead>
          <TableHead>Budget used</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c) => {
          const perf = getCampaignPerformance(c)
          return (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/analytics/campaigns/${c.id}`)}>
              <TableCell>
                <span className="font-medium text-foreground">{c.name}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{c.distributionBank}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
              <TableCell className="text-foreground">{formatNumber(perf.customersTransacted)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
              <TableCell className="text-foreground">{formatRatio(perf.roi)}</TableCell>
              <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
