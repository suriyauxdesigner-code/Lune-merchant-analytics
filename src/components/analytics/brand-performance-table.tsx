import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { cn, formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"

export type BrandPerformanceRow = {
  id: string
  name: string
  logoInitials: string
  logoColor: string
  gmv: number
  transactions: number
  customers: number
  roi: number
  utilizationPct: number
}

export type BrandMetric = "gmv" | "transactions" | "customers" | "roi"

const METRIC_META: Record<BrandMetric, { label: string; format: (v: number) => string; value: (r: BrandPerformanceRow) => number }> = {
  gmv: { label: "GMV", format: formatAed, value: (r) => r.gmv },
  transactions: { label: "Transactions", format: formatNumber, value: (r) => r.transactions },
  customers: { label: "Customers", format: formatNumber, value: (r) => r.customers },
  roi: { label: "ROI", format: (v) => formatRatio(v), value: (r) => r.roi },
}

const SECONDARY_ORDER: BrandMetric[] = ["gmv", "transactions", "customers", "roi"]

/**
 * A single comparison table for "which brand is performing best" — no bars, no duplicate widget.
 * The selected metric drives both sort order and typographic emphasis (bigger, bolder, first).
 */
export function BrandPerformanceTable({ rows, metric, onSelect }: { rows: BrandPerformanceRow[]; metric: BrandMetric; onSelect: (id: string) => void }) {
  const sorted = [...rows].sort((a, b) => METRIC_META[metric].value(b) - METRIC_META[metric].value(a))
  const columns = [metric, ...SECONDARY_ORDER.filter((m) => m !== metric)]

  return (
    <div>
      {/* Desktop / tablet — comparison table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              {columns.map((col) => (
                <TableHead key={col} className={cn("text-right", col === metric && "text-foreground")}>
                  {METRIC_META[col].label}
                </TableHead>
              ))}
              <TableHead className="hidden text-right lg:table-cell">Budget Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, i) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onSelect(row.id)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                    <BrandLogoTile initials={row.logoInitials} color={row.logoColor} size="sm" />
                    <span className="font-semibold text-foreground">{row.name}</span>
                  </div>
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col} className={cn("text-right tabular-nums", col === metric ? "text-[15px] font-bold text-foreground" : "text-muted-foreground")}>
                    {METRIC_META[col].format(METRIC_META[col].value(row))}
                  </TableCell>
                ))}
                <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">{formatPercent(row.utilizationPct, 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile — stacked rows, primary metric stays prominent, no squeezed table */}
      <div className="divide-y divide-border sm:hidden">
        {sorted.map((row, i) => (
          <button key={row.id} onClick={() => onSelect(row.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <BrandLogoTile initials={row.logoInitials} color={row.logoColor} size="sm" />
              <span className="truncate font-semibold text-foreground">{row.name}</span>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold tabular-nums text-foreground">{METRIC_META[metric].format(METRIC_META[metric].value(row))}</p>
              <p className="text-[11px] text-muted-foreground">
                {METRIC_META[metric].label} · {formatPercent(row.utilizationPct, 0)} used
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
