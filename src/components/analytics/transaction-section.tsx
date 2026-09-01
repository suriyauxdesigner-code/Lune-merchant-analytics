import * as React from "react"
import { ChevronUp, Receipt } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TransactionLogTable } from "./transaction-log-table"
import { formatAed, formatShortDate } from "@/lib/utils"
import { campaignById } from "@/lib/data"
import type { TransactionRow } from "@/lib/mock-performance"

const PREVIEW_COUNT = 6

/** A compact, non-dominating transaction preview with a "View all" toggle into the full sortable/paginated log. */
export function TransactionSection({ rows, showCampaign = true }: { rows: TransactionRow[]; showCampaign?: boolean }) {
  const [expanded, setExpanded] = React.useState(false)

  if (rows.length === 0) {
    return <EmptyState icon={<Receipt className="size-6" />} title="No transactions in range" description="Try widening the date range or clearing a filter." />
  }

  if (expanded) {
    return (
      <div>
        <TransactionLogTable rows={rows} showCampaign={showCampaign} />
        <button onClick={() => setExpanded(false)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ChevronUp className="size-3.5" />
          Show less
        </button>
      </div>
    )
  }

  const preview = rows.slice(0, PREVIEW_COUNT)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {showCampaign && <TableHead>Campaign</TableHead>}
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.map((row) => {
            const campaign = campaignById(row.campaignId)
            return (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">{formatShortDate(row.date)}</TableCell>
                {showCampaign && <TableCell className="text-foreground">{campaign?.name ?? row.campaignId}</TableCell>}
                <TableCell className="text-muted-foreground">{row.customerRef}</TableCell>
                <TableCell className="text-foreground">{formatAed(row.amount)}</TableCell>
                <TableCell>
                  <ChannelBadge channel={row.channel} />
                </TableCell>
                <TableCell className="text-muted-foreground">{row.terminalName}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Rewarded" ? "success" : "warning"} dot>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <button onClick={() => setExpanded(true)} className="mt-3 text-sm font-medium text-primary hover:underline">
        View all {rows.length.toLocaleString()} transactions →
      </button>
    </div>
  )
}
