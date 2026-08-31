import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { CAMPAIGNS } from "@/lib/data"
import { aggregatePerformance } from "@/lib/mock-performance"
import type { Brand, Campaign } from "@/lib/types"
import { Store } from "lucide-react"

export function BrandTable({ brands, campaignsOverride }: { brands: Brand[]; campaignsOverride?: Campaign[] }) {
  const navigate = useNavigate()
  const pool = campaignsOverride ?? CAMPAIGNS

  if (brands.length === 0) {
    return <EmptyState icon={<Store className="size-6" />} title="No brands match these filters" description="Try clearing a filter to see more brands." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead>Active campaigns</TableHead>
          <TableHead>Total campaigns</TableHead>
          <TableHead>Campaign budget</TableHead>
          <TableHead>Cashback %</TableHead>
          <TableHead>Transactions</TableHead>
          <TableHead>Transaction value</TableHead>
          <TableHead>Cashback issued</TableHead>
          <TableHead>Budget utilization</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => {
          const campaigns = pool.filter((c) => c.brandId === brand.id)
          const active = campaigns.filter((c) => c.status === "active").length
          const budget = campaigns.reduce((sum, c) => sum + c.budget, 0)
          const avgCashback = campaigns.length ? campaigns.reduce((sum, c) => sum + c.cashbackPercentage, 0) / campaigns.length : 0
          const perf = aggregatePerformance(campaigns)

          return (
            <TableRow key={brand.id} className="cursor-pointer" onClick={() => navigate(`/analytics/brands/${brand.id}`)}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />
                  <span className="font-medium text-foreground">{brand.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-foreground">{active}</TableCell>
              <TableCell className="text-foreground">{campaigns.length}</TableCell>
              <TableCell className="text-foreground">{formatAed(budget)}</TableCell>
              <TableCell className="text-foreground">{campaigns.length ? `${avgCashback.toFixed(1)}%` : "—"}</TableCell>
              <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
              <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
              <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
