import * as React from "react"
import { ChevronDown, ChevronUp, PackageSearch } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { cn, formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { CampaignStatus } from "@/lib/types"

export type CampaignPerformanceRow = {
  id: string
  name: string
  status: CampaignStatus
  gmv: number
  transactions: number
  roi: number
  cashback: number
  utilizationPct: number
}

type SortKey = "gmv" | "transactions" | "roi" | "cashback" | "utilizationPct"

const COLUMN_META: Record<SortKey, { label: string; format: (v: number) => string }> = {
  gmv: { label: "GMV", format: formatAed },
  transactions: { label: "Transactions", format: formatNumber },
  roi: { label: "ROI", format: (v) => formatRatio(v) },
  cashback: { label: "Cashback", format: formatAed },
  utilizationPct: { label: "Budget Used", format: (v) => formatPercent(v, 0) },
}

const COLUMN_ORDER: SortKey[] = ["gmv", "transactions", "roi", "cashback", "utilizationPct"]

/**
 * The detailed comparison view sitting below the featured Top Campaign — a plain, sortable
 * table rather than another ranked-bar visualization, so the two components don't repeat the
 * same information two different ways.
 */
export function CampaignPerformanceTable({
  rows,
  onSelect,
  emptyTitle = "No other campaigns",
  emptyDescription = "This brand doesn't have other campaigns to compare in this range.",
}: {
  rows: CampaignPerformanceRow[]
  onSelect: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("gmv")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...rows].sort((a, b) => (sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]))

  if (rows.length === 0) {
    return <EmptyState icon={<PackageSearch className="size-6" />} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div>
      {/* Desktop / tablet — sortable comparison table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              {COLUMN_ORDER.map((key) => (
                <TableHead key={key} className="text-right">
                  <button
                    onClick={() => handleSort(key)}
                    className={cn("inline-flex items-center gap-1 hover:text-foreground", key === sortKey && "font-semibold text-foreground")}
                  >
                    {COLUMN_META[key].label}
                    {key === sortKey && (sortDir === "desc" ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />)}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onSelect(row.id)}>
                <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                {COLUMN_ORDER.map((key) => (
                  <TableCell key={key} className={cn("text-right tabular-nums", key === sortKey ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {COLUMN_META[key].format(row[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile — stacked cards, not a squeezed table */}
      <div className="divide-y divide-border sm:hidden">
        {sorted.map((row) => (
          <button key={row.id} onClick={() => onSelect(row.id)} className="block w-full py-3 text-left">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-foreground">{row.name}</span>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {COLUMN_ORDER.map((key) => (
                <span key={key}>
                  {COLUMN_META[key].label} <span className="font-medium text-foreground">{COLUMN_META[key].format(row[key])}</span>
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
