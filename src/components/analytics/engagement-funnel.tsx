import { ArrowDown } from "lucide-react"
import { FUNNEL_STAGES } from "@/lib/future-data"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<AggregatePerformance, "offerShown" | "offerViewed" | "offerClicked" | "transactions" | "cashbackIssuedCount">

const FUNNEL_KEYS: (keyof Perf)[] = ["offerShown", "offerViewed", "offerClicked", "transactions", "cashbackIssuedCount"]

// One distinct color per stage, reusing the same palette Performance Over Time already uses for
// its GMV/Transactions/Cashback/ROI/AOV metrics, so the funnel doesn't invent a new color set.
const STAGE_COLORS = ["hsl(160 62% 22%)", "hsl(217 91% 55%)", "hsl(266 65% 58%)", "hsl(340 70% 50%)", "hsl(38 92% 45%)"]

const MIN_BAND_PCT = 5
const BAND_HEIGHT = 88

/**
 * A vertical bar chart funnel — each column shows the stage's raw count and its conversion from
 * the previous stage, sitting above its own bottom-aligned bar (one color per stage) whose height
 * represents its share of "Offer Shown".
 */
export function EngagementFunnel({ perf }: { perf: Perf }) {
  const values = FUNNEL_KEYS.map((k) => perf[k])
  const max = values[0] || 1
  const n = FUNNEL_STAGES.length
  const heights = values.map((v) => Math.max(MIN_BAND_PCT, (v / max) * 100))
  const gridCols = { gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }

  let biggestDrop = { index: -1, lossPct: 0 }
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] <= 0) continue
    const lossPct = (1 - values[i] / values[i - 1]) * 100
    if (lossPct > biggestDrop.lossPct) biggestDrop = { index: i, lossPct }
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Stage headers */}
          <div className="grid gap-3" style={gridCols}>
            {FUNNEL_STAGES.map((stage, i) => {
              const conversionFromPrev = i > 0 && values[i - 1] > 0 ? (values[i] / values[i - 1]) * 100 : null
              return (
                <div key={stage.key}>
                  <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{stage.label}</p>
                  <p className="mt-1 whitespace-nowrap text-2xl font-bold text-foreground">{formatNumber(values[i])}</p>
                  <p className="mt-1 flex h-4 items-center gap-1 text-xs font-medium text-muted-foreground">
                    {conversionFromPrev != null && (
                      <>
                        <ArrowDown className="size-3" />
                        {formatPercent(conversionFromPrev, 0)} of previous
                      </>
                    )}
                  </p>
                </div>
              )
            })}
          </div>

          {/* One independent bar per stage, bottom-aligned, height proportional to its share of "Offer Shown" */}
          <div className="mt-3 grid items-end gap-3" style={{ ...gridCols, height: BAND_HEIGHT }}>
            {FUNNEL_STAGES.map((stage, i) => (
              <div key={stage.key} className="rounded-t-md transition-all" style={{ height: `${heights[i]}%`, backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }} />
            ))}
          </div>
        </div>
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
