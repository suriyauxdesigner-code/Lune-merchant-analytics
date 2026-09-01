import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import { BRANDS, brandById } from "@/lib/data"
import { aggregatePerformance, aggregateChannelPerformance, getCampaignPerformance } from "@/lib/mock-performance"
import type { Campaign, Channel } from "@/lib/types"
import { PackageSearch } from "lucide-react"

const CHANNELS: Channel[] = ["online", "in_store", "both"]
const PAGE_SIZE = 6

export function PerformanceBreakdown({ campaigns }: { campaigns: Campaign[] }) {
  const navigate = useNavigate()
  const [page, setPage] = React.useState(0)

  const brandRows = React.useMemo(() => {
    const ids = new Set(campaigns.map((c) => c.brandId))
    return BRANDS.filter((b) => ids.has(b.id)).map((brand) => {
      const brandCampaigns = campaigns.filter((c) => c.brandId === brand.id)
      return { brand, campaignCount: brandCampaigns.length, perf: aggregatePerformance(brandCampaigns) }
    })
  }, [campaigns])

  const channelRows = React.useMemo(
    () =>
      CHANNELS.map((channel) => ({
        channel,
        campaignCount: campaigns.filter((c) => c.channel === channel).length,
        perf: aggregateChannelPerformance(campaigns, channel),
      })),
    [campaigns]
  )

  const pageCount = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE))
  const campaignPage = campaigns.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (campaigns.length === 0) {
    return <EmptyState icon={<PackageSearch className="size-6" />} title="Nothing matches these filters" description="Try widening the date range or clearing a filter." />
  }

  return (
    <Tabs defaultValue="brand" onValueChange={() => setPage(0)}>
      <TabsList className="mb-5">
        <TabsTrigger value="brand">By Brand</TabsTrigger>
        <TabsTrigger value="channel">By Channel</TabsTrigger>
        <TabsTrigger value="campaign">By Campaign</TabsTrigger>
      </TabsList>

      <TabsContent value="brand">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Transaction value</TableHead>
              <TableHead>Cashback issued</TableHead>
              <TableHead>Budget utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brandRows.map(({ brand, campaignCount, perf }) => (
              <TableRow key={brand.id} className="cursor-pointer" onClick={() => navigate(`/analytics/brands/${brand.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />
                    <span className="font-medium text-foreground">{brand.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{campaignCount}</TableCell>
                <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
                <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
                <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="channel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Transaction value</TableHead>
              <TableHead>Cashback issued</TableHead>
              <TableHead>Budget utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelRows.map(({ channel, campaignCount, perf }) => (
              <TableRow key={channel}>
                <TableCell>
                  <ChannelBadge channel={channel} />
                </TableCell>
                <TableCell className="text-foreground">{campaignCount}</TableCell>
                <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
                <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
                <TableCell className="text-foreground">{formatAed(perf.cashbackIssued)}</TableCell>
                <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="campaign">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Transaction value</TableHead>
              <TableHead>Budget utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignPage.map((c) => {
              const brand = brandById(c.brandId)
              const perf = getCampaignPerformance(c)
              return (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/analytics/campaigns/${c.id}`)}>
                  <TableCell>
                    <span className="font-medium text-foreground">{c.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {brand && <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />}
                      <span className="text-foreground">{brand?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-foreground">{formatAed(c.budget)}</TableCell>
                  <TableCell className="text-foreground">{formatNumber(perf.transactions)}</TableCell>
                  <TableCell className="text-foreground">{formatAed(perf.transactionValue)}</TableCell>
                  <TableCell className="text-foreground">{formatPercent(perf.utilizationPct)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
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
        )}
      </TabsContent>
    </Tabs>
  )
}
