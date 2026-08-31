import { ArrowDown, ArrowRight } from "lucide-react"
import { TierBadge } from "@/components/shared/kpi-card"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { DataTier } from "@/lib/mock-performance"

type FunnelData = {
  offerShown: number
  offerViewed: number
  offerClicked: number
  transactions: number
  cashbackIssuedCount: number
}

const STAGES: { key: keyof FunnelData; label: string; tier: Exclude<DataTier, "live"> }[] = [
  { key: "offerShown", label: "Offer Shown", tier: "future" },
  { key: "offerViewed", label: "Offer Viewed", tier: "future" },
  { key: "offerClicked", label: "Offer Clicked", tier: "future" },
  { key: "transactions", label: "Transaction", tier: "transaction" },
  { key: "cashbackIssuedCount", label: "Cashback Issued", tier: "transaction" },
]

export function CampaignFunnel({ data }: { data: FunnelData }) {
  const max = Math.max(1, data.offerShown)

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-0">
      {STAGES.map((stage, i) => {
        const value = data[stage.key]
        const prevValue = i === 0 ? null : data[STAGES[i - 1].key]
        const conversionFromPrev = prevValue ? (value / prevValue) * 100 : null
        const barPct = Math.max(4, (value / max) * 100)

        return (
          <div key={stage.key} className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-stretch">
            <div className="flex flex-1 flex-col justify-between rounded-[var(--radius-sm)] border border-border bg-card px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                <p className="mt-1.5 text-xl font-bold text-foreground">{formatNumber(value)}</p>
                {conversionFromPrev !== null && <p className="mt-0.5 text-[11px] text-muted-foreground">{formatPercent(conversionFromPrev)} of previous stage</p>}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${barPct}%` }} />
              </div>
              <TierBadge tier={stage.tier} className="mt-3 self-start" />
            </div>
            {i < STAGES.length - 1 && (
              <div className="flex items-center justify-center py-1.5 text-muted-foreground/50 sm:px-2 sm:py-0">
                <ArrowDown className="size-4 sm:hidden" />
                <ArrowRight className="hidden size-4 sm:block" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
