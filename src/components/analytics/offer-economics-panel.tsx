import { MetricTiles } from "./metric-tiles"
import { formatAed, formatPercent } from "@/lib/utils"
import type { OfferEconomics } from "@/lib/transaction-stats"
import type { Campaign } from "@/lib/types"

/** Is the offer configuration itself working? Reads the campaign's rate/spend/cap setup against how customers are actually transacting. */
export function OfferEconomicsPanel({ campaign, economics }: { campaign: Campaign; economics: OfferEconomics }) {
  return (
    <div>
      <MetricTiles
        columns={4}
        showTierBadges={false}
        items={[
          { key: "rate", label: "Cashback Rate", value: `${campaign.cashbackPercentage}%` },
          { key: "min-spend", label: "Minimum Spend", value: campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "No minimum" },
          { key: "cap", label: "Cashback Cap", value: `${formatAed(campaign.cashbackCap)} / transaction` },
          { key: "avg-cashback", label: "Avg. Cashback / Transaction", value: formatAed(economics.avgCashbackPerTransaction) },
          { key: "aov", label: "Average Order Value", value: formatAed(economics.aov) },
          { key: "near-min", label: "Transactions Near Minimum Spend", value: formatPercent(economics.pctNearMinSpend, 0) },
          { key: "at-cap", label: "Transactions Reaching Cashback Cap", value: formatPercent(economics.pctAtCap, 0) },
        ]}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        A high share near the minimum spend suggests customers are shopping to the threshold; a high share reaching the cap means the offer may be under-rewarding larger baskets.
      </p>
    </div>
  )
}
