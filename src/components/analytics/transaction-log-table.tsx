import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatAed, formatShortDate } from "@/lib/utils"
import { campaignById } from "@/lib/data"
import type { TransactionRow } from "@/lib/mock-performance"
import { Receipt } from "lucide-react"

type SortKey = "date" | "amount"

export function TransactionLogTable({ rows, showCampaign = true }: { rows: TransactionRow[]; showCampaign?: boolean }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = React.useState<SortKey>("date")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => setPage(0), [rows.length, pageSize])

  const sorted = React.useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = sortKey === "date" ? a.date : a.amount
      const bv = sortKey === "date" ? b.date : b.amount
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  if (rows.length === 0) {
    return <EmptyState icon={<Receipt className="size-6" />} title="No transactions in range" description="Try widening the date range or clearing a filter." />
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead label="Date" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
            {showCampaign && <TableHead>Campaign</TableHead>}
            <SortableHead label="Amount" active={sortKey === "amount"} dir={sortDir} onClick={() => toggleSort("amount")} />
            <TableHead>Channel</TableHead>
            <TableHead>Terminal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cashback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((row) => {
            const campaign = campaignById(row.campaignId)
            return (
              <TableRow key={row.id} className={showCampaign ? "cursor-pointer" : undefined} onClick={showCampaign ? () => navigate(`/analytics/campaigns/${row.campaignId}`) : undefined}>
                <TableCell className="text-muted-foreground">{formatShortDate(row.date)}</TableCell>
                {showCampaign && <TableCell className="font-medium text-foreground">{campaign?.name ?? row.campaignId}</TableCell>}
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
                <TableCell className="text-foreground">{formatAed(row.cashback)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Rows per page
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>· {rows.length.toLocaleString()} transactions</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableHead({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <TableHead>
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <ArrowUpDown className={`size-3 ${active ? "text-foreground" : "text-muted-foreground/60"}`} style={active && dir === "asc" ? { transform: "scaleY(-1)" } : undefined} />
      </button>
    </TableHead>
  )
}
