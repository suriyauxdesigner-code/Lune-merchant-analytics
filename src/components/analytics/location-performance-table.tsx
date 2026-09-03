import { RankedBarList } from "./ranked-bar-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber } from "@/lib/utils"
import type { LocationStat } from "@/lib/transaction-stats"
import { MapPin } from "lucide-react"

/**
 * This brand's strongest locations, ranked by GMV. A location's GMV/transactions are already the
 * sum across every terminal registered there — the "Terminals" column says how many that is
 * (and lists the IDs), rather than showing one ID as if a location only ever had one terminal.
 */
export function LocationPerformanceTable({ locations }: { locations: LocationStat[] }) {
  if (locations.length === 0) {
    return <EmptyState icon={<MapPin className="size-6" />} title="No location activity in range" description="Try widening the date range or clearing a filter." />
  }

  return (
    <div>
      <RankedBarList
        items={locations.map((loc) => ({ id: loc.location, label: loc.location, value: loc.gmv, sublabel: `${formatNumber(loc.transactions)} transactions` }))}
        formatValue={formatAed}
        color="hsl(38 92% 45%)"
      />
      <div className="mt-5 border-t border-border pt-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Terminals</TableHead>
              <TableHead>GMV</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>AOV</TableHead>
              <TableHead>Customers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.location}>
                <TableCell className="max-w-[220px] whitespace-normal font-medium text-foreground">{loc.location}</TableCell>
                <TableCell className="text-muted-foreground">
                  {loc.terminalIds.length > 0 ? `${loc.terminalIds.length} · ${loc.terminalIds.join(", ")}` : "—"}
                </TableCell>
                <TableCell className="text-foreground">{formatAed(loc.gmv)}</TableCell>
                <TableCell className="text-foreground">{formatNumber(loc.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(loc.aov)}</TableCell>
                <TableCell className="text-foreground">{formatNumber(loc.customers)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
