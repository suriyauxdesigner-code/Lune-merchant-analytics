import { FUNNEL_STAGES } from "@/lib/future-data"
import { formatNumber, formatPercent, cn } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<AggregatePerformance, "offerShown" | "offerViewed" | "offerClicked" | "transactions" | "cashbackIssuedCount">

const FUNNEL_KEYS: (keyof Perf)[] = ["offerShown", "offerViewed", "offerClicked", "transactions", "cashbackIssuedCount"]

const MIN_BAND_PCT = 6
const BAND_HEIGHT = 96

/**
 * A tapering river funnel — each column shows the stage's raw count, and the connecting band
 * beneath it narrows to the next stage's share, colored by depth. The stage right after the
 * single biggest drop-off gets a highlighted card, echoing where a merchant should look first.
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
              const isHighlight = i === biggestDrop.index
              const conversionFromPrev = i > 0 && values[i - 1] > 0 ? (values[i] / values[i - 1]) * 100 : null
              return (
                <div key={stage.key} className={cn("rounded-[var(--radius-sm)] p-3", isHighlight ? "bg-primary shadow-card" : "bg-transparent")}>
                  <p className={cn("truncate text-[11px] font-medium uppercase tracking-wide", isHighlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {stage.label}
                  </p>
                  <p className={cn("mt-1 whitespace-nowrap text-lg font-bold", isHighlight ? "text-primary-foreground" : "text-foreground")}>{formatNumber(values[i])}</p>
                  {isHighlight && conversionFromPrev != null && <p className="mt-2 text-xs font-semibold text-primary-foreground/80">{formatPercent(conversionFromPrev, 0)} of previous</p>}
                </div>
              )
            })}
          </div>

          {/* Connecting bands, tapering from each stage's share to the next */}
          <div className="grid gap-0" style={{ ...gridCols, height: BAND_HEIGHT }}>
            {FUNNEL_STAGES.map((stage, i) => {
              const leftPct = heights[i]
              const rightPct = i < n - 1 ? heights[i + 1] : leftPct
              const top1 = (100 - leftPct) / 2
              const bottom1 = (100 + leftPct) / 2
              const top2 = (100 - rightPct) / 2
              const bottom2 = (100 + rightPct) / 2
              const opacity = 0.2 + 0.8 * (i / Math.max(1, n - 1))

              return (
                <div
                  key={stage.key}
                  style={{ clipPath: `polygon(0% ${top1}%, 100% ${top2}%, 100% ${bottom2}%, 0% ${bottom1}%)`, backgroundColor: `hsl(160 62% 22% / ${opacity})` }}
                />
              )
            })}
          </div>

          {/* Conversion into each stage, sitting under its band */}
          <div className="mt-2 grid gap-0" style={gridCols}>
            {FUNNEL_STAGES.map((stage, i) => {
              const label = i < n - 1 && values[i] > 0 ? formatPercent((values[i + 1] / values[i]) * 100, 0) : null
              return (
                <div key={stage.key} className="text-center text-[11px] font-semibold text-muted-foreground">
                  {label}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {biggestDrop.index > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Biggest drop-off:{" "}
          <span className="font-medium text-foreground">
            {FUNNEL_STAGES[biggestDrop.index - 1].label} → {FUNNEL_STAGES[biggestDrop.index].label}
          </span>{" "}
          ({formatPercent(biggestDrop.lossPct, 0)} lost). Offer shown/viewed/clicked requires SDK event instrumentation; transacted and rewarded require transaction data.
        </p>
      )}
    </div>
  )
}
