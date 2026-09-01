import { MetricTiles } from "./metric-tiles"
import { formatAed, formatPercent } from "@/lib/utils"
import type { OfferEconomics } from "@/lib/transaction-stats"
import type { Campaign } from "@/lib/types"

/** Is the offer configuration itself working? Reads the campaign's rate/spend/cap setup against how customers are actually transacting. */
export function OfferEconomicsPanel({ campaign, economics }: { campaign: Campaign; economics: OfferEconomics }) {
  return (
    <div>
      <MetricTiles
        columns={3}
        showTierBadges={false}
        items={[
          { key: "rate", label: "Cashback Rate", value: `${campaign.cashbackPercentage}%` },
          { key: "min-spend", label: "Minimum Spend", value: campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "No minimum" },
          { key: "cap", label: "Cashback Cap", value: `${formatAed(campaign.cashbackCap)} / transaction` },
          { key: "avg-cashback", label: "Avg. Cashback / Transaction", value: formatAed(economics.avgCashbackPerTransaction) },
          { key: "median-cashback", label: "Median Cashback / Transaction", value: formatAed(economics.medianCashbackPerTransaction) },
          { key: "aov", label: "Average Order Value", value: formatAed(economics.aov) },
        ]}
      />

      <div className="mt-5 space-y-4 border-t border-border pt-4">
        <ProgressRow label="Transactions near minimum spend" pct={economics.pctNearMinSpend} color="hsl(38 92% 45%)" />
        <ProgressRow label="Transactions reaching cashback cap" pct={economics.pctAtCap} color="hsl(0 72% 51%)" />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        A high share near the minimum spend suggests customers are shopping to the threshold; a high share reaching the cap means the offer may be under-rewarding larger baskets.
      </p>
    </div>
  )
}

function ProgressRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-semibold text-foreground">{formatPercent(pct, 0)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(1, Math.min(100, pct))}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
