import { useNavigate } from "react-router-dom"
import { BrandLogoTile } from "@/components/shared/brand-logo-tile"
import { formatAed, formatRatio } from "@/lib/utils"
import { brandById } from "@/lib/data"
import { getCampaignPerformance } from "@/lib/mock-performance"
import type { Campaign } from "@/lib/types"

/** Compact ranked view of the best-performing campaigns by GMV — a quick "who's winning" glance, not a repeat of the full table. */
export function TopCampaigns({ campaigns, onViewAll, limit = 5 }: { campaigns: Campaign[]; onViewAll?: () => void; limit?: number }) {
  const navigate = useNavigate()

  const ranked = campaigns
    .map((c) => ({ campaign: c, perf: getCampaignPerformance(c) }))
    .filter((r) => r.perf.hasStarted)
    .sort((a, b) => b.perf.transactionValue - a.perf.transactionValue)
    .slice(0, limit)

  if (ranked.length === 0) {
    return <p className="text-sm text-muted-foreground">No campaign activity yet in this range.</p>
  }

  const maxGmv = ranked[0].perf.transactionValue || 1

  return (
    <div>
      <div className="space-y-1">
        {ranked.map(({ campaign: c, perf }, i) => {
          const brand = brandById(c.brandId)
          const widthPct = Math.max(6, Math.round((perf.transactionValue / maxGmv) * 100))
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/analytics/campaigns/${c.id}`)}
              className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{i + 1}</span>
              {brand && <BrandLogoTile initials={brand.logoInitials} color={brand.logoColor} size="sm" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-foreground">{formatAed(perf.transactionValue)}</p>
                <p className="text-xs text-muted-foreground">{formatRatio(perf.roi)} ROI</p>
              </div>
            </button>
          )
        })}
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="mt-3 text-sm font-medium text-primary hover:underline">
          View all campaigns →
        </button>
      )}
    </div>
  )
}
