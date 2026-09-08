import { ArrowDown } from "lucide-react"
import { FUNNEL_STAGES } from "@/lib/future-data"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<AggregatePerformance, "offerShown" | "offerViewed" | "offerClicked" | "transactions" | "cashbackIssuedCount">

const FUNNEL_KEYS: (keyof Perf)[] = ["offerShown", "offerViewed", "offerClicked", "transactions", "cashbackIssuedCount"]

// One distinct color per stage, reusing the same palette Performance Over Time already uses for
// its GMV/Transactions/Cashback/ROI/AOV metrics, so the funnel doesn't invent a new color set.
const STAGE_COLORS = ["hsl(160 62% 22%)", "hsl(217 91% 55%)", "hsl(266 65% 58%)", "hsl(340 70% 50%)", "hsl(38 92% 45%)"]

const MIN_BAND_PCT = 4
const BAR_HEIGHT = 36

/**
 * A horizontal bar chart funnel — one row per stage, each showing its raw count and conversion
 * from the previous stage above a bar whose width represents its share of "Offer Shown".
 */
export function EngagementFunnel({ perf }: { perf: Perf }) {
  const values = FUNNEL_KEYS.map((k) => perf[k])
  const max = values[0] || 1
  const widths = values.map((v) => Math.max(MIN_BAND_PCT, (v / max) * 100))

  let biggestDrop = { index: -1, lossPct: 0 }
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] <= 0) continue
    const lossPct = (1 - values[i] / values[i - 1]) * 100
    if (lossPct > biggestDrop.lossPct) biggestDrop = { index: i, lossPct }
  }

  return (
    <div>
      <div className="space-y-4">
        {FUNNEL_STAGES.map((stage, i) => {
          const conversionFromPrev = i > 0 && values[i - 1] > 0 ? (values[i] / values[i - 1]) * 100 : null
          return (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{stage.label}</span>
                <span className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-base font-semibold tabular-nums text-foreground">{formatNumber(values[i])}</span>
                  {conversionFromPrev != null && (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <ArrowDown className="size-3" />
                      {formatPercent(conversionFromPrev, 0)} of previous
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full overflow-hidden rounded-md bg-muted" style={{ height: BAR_HEIGHT }}>
                <div className="h-full rounded-md transition-all" style={{ width: `${widths[i]}%`, backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }} />
              </div>
            </div>
          )
        })}
      </div>

      {biggestDrop.index > 0 && (
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Biggest drop-off</p>
          <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{formatPercent(biggestDrop.lossPct, 0)} lost</p>
          <p className="mt-1 text-xs text-muted-foreground">
            between {FUNNEL_STAGES[biggestDrop.index - 1].label} → {FUNNEL_STAGES[biggestDrop.index].label}
          </p>
        </div>
      )}
    </div>
  )
}
