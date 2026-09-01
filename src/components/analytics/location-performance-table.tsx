import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber } from "@/lib/utils"
import type { LocationStat } from "@/lib/transaction-stats"
import { MapPin } from "lucide-react"

/** This brand's strongest locations/terminals — a merchant question that only makes sense at brand scope. */
export function LocationPerformanceTable({ locations }: { locations: LocationStat[] }) {
  if (locations.length === 0) {
    return <EmptyState icon={<MapPin className="size-6" />} title="No location activity in range" description="Try widening the date range or clearing a filter." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Location</TableHead>
          <TableHead>GMV</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>AOV</TableHead>
          <TableHead>Customers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((loc) => (
          <TableRow key={loc.location}>
            <TableCell className="font-medium text-foreground">{loc.location}</TableCell>
            <TableCell className="text-foreground">{formatAed(loc.gmv)}</TableCell>
            <TableCell className="text-foreground">{formatNumber(loc.transactions)}</TableCell>
            <TableCell className="text-foreground">{formatAed(loc.aov)}</TableCell>
            <TableCell className="text-foreground">{formatNumber(loc.customers)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
