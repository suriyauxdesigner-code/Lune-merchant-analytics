import { FUNNEL_STAGES } from "@/lib/future-data"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<AggregatePerformance, "offerShown" | "offerViewed" | "offerClicked" | "transactions" | "cashbackIssuedCount">

const FUNNEL_KEYS: (keyof Perf)[] = ["offerShown", "offerViewed", "offerClicked", "transactions", "cashbackIssuedCount"]

/** A tapering funnel bar chart — each stage's bar width is proportional to its share of "Offer Shown". */
export function EngagementFunnel({ perf }: { perf: Perf }) {
  const values = FUNNEL_KEYS.map((k) => perf[k])
  const max = values[0] || 1

  return (
    <div>
      <div className="space-y-4">
        {FUNNEL_STAGES.map((stage, i) => {
          const value = values[i]
          const widthPct = Math.max(4, Math.round((value / max) * 100))
          const conversionFromPrev = i > 0 && values[i - 1] > 0 ? (value / values[i - 1]) * 100 : null

          return (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-foreground">{stage.label}</span>
                <span className="text-muted-foreground">
                  {formatNumber(value)}
                  {conversionFromPrev != null && <span className="ml-1.5">· {formatPercent(conversionFromPrev, 0)} of previous</span>}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Offer shown/viewed/clicked requires SDK event instrumentation; transacted and rewarded require transaction data. Shown here as prototype sample data.
      </p>
    </div>
  )
}
