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

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-3">
        <span>
          Cashback rate <span className="font-medium text-foreground">{campaign.cashbackPercentage}%</span>
        </span>
        <span>
          Avg. cashback / transaction <span className="font-medium text-foreground">{formatAed(economics.avgCashbackPerTransaction)}</span>
        </span>
        <span>
          Median cashback / transaction <span className="font-medium text-foreground">{formatAed(economics.medianCashbackPerTransaction)}</span>
        </span>
        <span>
          Minimum spend <span className="font-medium text-foreground">{campaign.minimumSpend ? formatAed(campaign.minimumSpend) : "None"}</span>
        </span>
        <span>
          Cashback cap <span className="font-medium text-foreground">{formatAed(campaign.cashbackCap)}</span>
        </span>
        <span>
          Average order value <span className="font-medium text-foreground">{formatAed(economics.aov)}</span>
        </span>
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
