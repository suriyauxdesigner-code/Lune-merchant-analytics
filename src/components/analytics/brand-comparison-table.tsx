import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import { aggregatePerformance } from "@/lib/mock-performance"
import type { Brand, Campaign } from "@/lib/types"

type SortKey = "gmv" | "transactions" | "customers" | "roi" | "budgetUsed"

/** Which brands are driving portfolio results — the primary "compare" surface at Merchant Analytics. `campaigns` should already reflect the page's active filters. */
export function BrandComparisonTable({ brands, campaigns }: { brands: Brand[]; campaigns: Campaign[] }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = React.useState<SortKey>("gmv")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  const rows = React.useMemo(
    () => brands.map((b) => ({ brand: b, perf: aggregatePerformance(campaigns.filter((c) => c.brandId === b.id)) })),
    [brands, campaigns]
  )

  const sorted = React.useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av =
        sortKey === "gmv"
          ? a.perf.transactionValue
          : sortKey === "transactions"
            ? a.perf.transactions
            : sortKey === "customers"
              ? a.perf.customersTransacted
              : sortKey === "roi"
                ? a.perf.roi
                : a.perf.utilizationPct
      const bv =
        sortKey === "gmv"
          ? b.perf.transactionValue
          : sortKey === "transactions"
            ? b.perf.transactions
            : sortKey === "customers"
              ? b.perf.customersTransacted
              : sortKey === "roi"
                ? b.perf.roi
                : b.perf.utilizationPct
      return sortDir === "asc" ? av - bv : bv - av
    })
    return copy
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <SortableHead label="GMV" active={sortKey === "gmv"} dir={sortDir} onClick={() => toggleSort("gmv")} />
          <SortableHead label="Transactions" active={sortKey === "transactions"} dir={sortDir} onClick={() => toggleSort("transactions")} />
          <SortableHead label="Customers" active={sortKey === "customers"} dir={sortDir} onClick={() => toggleSort("customers")} />
          <SortableHead label="ROI" active={sortKey === "roi"} dir={sortDir} onClick={() => toggleSort("roi")} />
          <SortableHead label="Budget used" active={sortKey === "budgetUsed"} dir={sortDir} onClick={() => toggleSort("budgetUsed")} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(({ brand, perf }) => (
          <TableRow key={brand.id} className="cursor-pointer" onClick={() => navigate(`/analytics/brands/${brand.id}`)}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />
                <span className="font-medium text-foreground">{brand.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
            <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
            <TableCell className="text-foreground">{formatNumber(perf.customersTransacted)}</TableCell>
            <TableCell className="text-foreground">{formatRatio(perf.roi)}</TableCell>
            <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
