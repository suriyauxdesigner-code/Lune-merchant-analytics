import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { brandById } from "@/lib/data"
import { getCampaignPerformance } from "@/lib/mock-performance"
import type { Campaign } from "@/lib/types"
import { PackageSearch } from "lucide-react"

type SortKey = "gmv" | "transactions" | "cashback" | "roi" | "budgetUsed"

/** The Main Analytics "Campaign Performance" table — which campaigns are driving the business results, sorted business-first (GMV by default). */
export function CampaignTable({ campaigns, showBrand = true }: { campaigns: Campaign[]; showBrand?: boolean }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = React.useState<SortKey>("gmv")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(8)

  React.useEffect(() => setPage(0), [campaigns.length, pageSize])

  const rows = React.useMemo(() => campaigns.map((c) => ({ campaign: c, perf: getCampaignPerformance(c) })), [campaigns])

  const sorted = React.useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av =
        sortKey === "gmv" ? a.perf.transactionValue : sortKey === "transactions" ? a.perf.transactions : sortKey === "cashback" ? a.perf.cashbackIssued : sortKey === "roi" ? a.perf.roi : a.perf.utilizationPct
      const bv =
        sortKey === "gmv" ? b.perf.transactionValue : sortKey === "transactions" ? b.perf.transactions : sortKey === "cashback" ? b.perf.cashbackIssued : sortKey === "roi" ? b.perf.roi : b.perf.utilizationPct
      return sortDir === "asc" ? av - bv : bv - av
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            {showBrand && <TableHead>Brand</TableHead>}
            <TableHead>Status</TableHead>
            <SortableHead label="GMV" active={sortKey === "gmv"} dir={sortDir} onClick={() => toggleSort("gmv")} />
            <SortableHead label="Transactions" active={sortKey === "transactions"} dir={sortDir} onClick={() => toggleSort("transactions")} />
            <SortableHead label="Cashback" active={sortKey === "cashback"} dir={sortDir} onClick={() => toggleSort("cashback")} />
            <SortableHead label="ROI" active={sortKey === "roi"} dir={sortDir} onClick={() => toggleSort("roi")} />
            <SortableHead label="Budget used" active={sortKey === "budgetUsed"} dir={sortDir} onClick={() => toggleSort("budgetUsed")} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map(({ campaign: c, perf }) => {
            const brand = brandById(c.brandId)
            return (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/analytics/campaigns/${c.id}`)}>
                <TableCell>
                  <span className="font-medium text-foreground">{c.name}</span>
                </TableCell>
                {showBrand && (
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {brand && <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />}
                      <span className="text-foreground">{brand?.name}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
                <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
                <TableCell className="text-foreground">{formatRatio(perf.roi)}</TableCell>
                <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
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
              {[5, 8, 10, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
