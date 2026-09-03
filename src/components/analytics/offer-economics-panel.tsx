import { MetricTiles } from "./metric-tiles"
import { formatAed, formatPercent } from "@/lib/utils"
import type { OfferEconomics } from "@/lib/transaction-stats"
import type { Campaign } from "@/lib/types"

/** Is the offer configuration itself working? Reads the campaign's rate/spend/cap setup against how customers are actually transacting. */
export function OfferEconomicsPanel({ campaign, economics }: { campaign: Campaign; economics: OfferEconomics }) {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        <ProgressStat
          label="Near minimum spend"
          pct={economics.pctNearMinSpend}
          color="hsl(38 92% 45%)"
          caption={`of transactions land close to the ${campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "minimum spend"} threshold`}
        />
        <ProgressStat
          label="Reaching cashback cap"
          pct={economics.pctAtCap}
          color="hsl(0 72% 51%)"
          caption={`of transactions hit the ${formatAed(campaign.cashbackCap)} cashback cap`}
        />
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
        A high share near the minimum spend suggests customers are shopping to the threshold; a high share reaching the cap means the offer may be under-rewarding larger baskets.
      </p>

      <div className="mt-5 border-t border-border pt-4">
        <MetricTiles
          columns={3}
          showTierBadges={false}
          items={[
            { key: "cashback-rate", label: "Cashback rate", value: `${campaign.cashbackPercentage}%` },
            { key: "avg-cashback", label: "Avg. cashback / transaction", value: formatAed(economics.avgCashbackPerTransaction) },
            { key: "median-cashback", label: "Median cashback / transaction", value: formatAed(economics.medianCashbackPerTransaction) },
            { key: "min-spend", label: "Minimum spend", value: campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "None" },
            { key: "cashback-cap", label: "Cashback cap", value: formatAed(campaign.cashbackCap) },
            { key: "aov", label: "Average order value", value: formatAed(economics.aov) },
          ]}
        />
      </div>
    </div>
  )
}

function ProgressStat({ label, pct, color, caption }: { label: string; pct: number; color: string; caption: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{formatPercent(pct, 0)}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(1, Math.min(100, pct))}%`, backgroundColor: color }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}
