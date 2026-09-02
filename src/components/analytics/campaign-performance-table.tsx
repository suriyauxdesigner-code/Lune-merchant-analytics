import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn, formatAed, formatNumber, formatPercent, formatRatio } from "@/lib/utils"
import type { CampaignStatus } from "@/lib/types"

export type CampaignPerformanceRow = {
  id: string
  name: string
  status: CampaignStatus
  brandName: string
  brandInitials: string
  brandColor: string
  gmv: number
  transactions: number
  roi: number
  utilizationPct: number
}

export type CampaignMetric = "gmv" | "roi" | "transactions"

const METRIC_META: Record<CampaignMetric, { label: string; format: (v: number) => string; value: (r: CampaignPerformanceRow) => number }> = {
  gmv: { label: "GMV", format: formatAed, value: (r) => r.gmv },
  roi: { label: "ROI", format: (v) => formatRatio(v), value: (r) => r.roi },
  transactions: { label: "Transactions", format: formatNumber, value: (r) => r.transactions },
}

const SECONDARY_ORDER: CampaignMetric[] = ["gmv", "roi", "transactions"]

/**
 * "Which campaigns are driving performance?" — deliberately distinct from Brand Performance:
 * a Brand column + status badge instead of a rank number, campaign name carries the primary
 * identity rather than a leaderboard position.
 */
export function CampaignPerformanceTable({ rows, metric, onSelect }: { rows: CampaignPerformanceRow[]; metric: CampaignMetric; onSelect: (id: string) => void }) {
  const sorted = [...rows].sort((a, b) => METRIC_META[metric].value(b) - METRIC_META[metric].value(a))
  const columns = [metric, ...SECONDARY_ORDER.filter((m) => m !== metric)]

  return (
    <div>
      {/* Desktop / tablet — comparison table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              {columns.map((col) => (
                <TableHead key={col} className={cn("text-right", col === metric && "text-foreground")}>
                  {METRIC_META[col].label}
                </TableHead>
              ))}
              <TableHead className="hidden text-right lg:table-cell">Budget Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onSelect(row.id)}>
                <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BrandLogoTile initials={row.brandInitials} color={row.brandColor} size="sm" />
                    <span className="text-muted-foreground">{row.brandName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge status={row.status} />
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
        {sorted.map((row) => (
          <button key={row.id} onClick={() => onSelect(row.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{row.name}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <BrandLogoTile initials={row.brandInitials} color={row.brandColor} size="sm" />
                <span className="truncate text-xs text-muted-foreground">{row.brandName}</span>
                <StatusBadge status={row.status} />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold tabular-nums text-foreground">{METRIC_META[metric].format(METRIC_META[metric].value(row))}</p>
              <p className="text-[11px] text-muted-foreground">{METRIC_META[metric].label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
