import { TrendingUp } from "lucide-react"
import { DonutChart } from "./donut-chart"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { NewReturningStat } from "@/lib/mock-performance"

const SEGMENT_COLORS: Record<string, string> = { New: "hsl(217 91% 55%)", Returning: "hsl(160 62% 22%)" }

/** New vs. returning customers, and how each segment's value compares. Donut + compact legend on
 * the left, a detail card per segment on the right — side by side once there's room, stacked on
 * narrow screens. Safe to lay out this way because this panel always renders full-width (never
 * paired 2-up with another card), so the available width doesn't swing unpredictably. */
export function NewReturningPanel({ stats }: { stats: NewReturningStat[] }) {
  const totalCustomers = stats.reduce((s, x) => s + x.customers, 0)
  const [newStat, returningStat] = stats
  const newAvgSpend = newStat.customers > 0 ? newStat.gmv / newStat.customers : 0
  const returningAvgSpend = returningStat.customers > 0 ? returningStat.gmv / returningStat.customers : 0
  const spendMultiple = newAvgSpend > 0 ? returningAvgSpend / newAvgSpend : 0

  return (
    <div>
      {spendMultiple > 1.05 && (
        <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-secondary/60 px-3.5 py-2.5 text-sm font-medium text-foreground">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Returning customers spend <span className="font-bold">{spendMultiple.toFixed(1)}×</span> more on average than a new customer's first purchase.
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="flex flex-col items-center">
          <DonutChart
            segments={stats.map((s) => ({ label: s.segment, value: s.customers, color: SEGMENT_COLORS[s.segment] }))}
            formatValue={formatNumber}
            centerLabel="Customers"
            centerValue={formatNumber(totalCustomers)}
            size={260}
            hideLegend
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {stats.map((s) => {
              const pct = totalCustomers > 0 ? (s.customers / totalCustomers) * 100 : 0
              return (
                <span key={s.segment} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.segment] }} />
                  <span className="font-medium text-foreground">{s.segment}</span>
                  <span className="text-muted-foreground">
                    {formatPercent(pct, 0)} ({formatNumber(s.customers)})
                  </span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {stats.map((s) => {
            const avgSpend = s.customers > 0 ? s.gmv / s.customers : 0
            const avgTx = s.customers > 0 ? s.transactions / s.customers : 0
            return (
              <div key={s.segment} className="rounded-[var(--radius)] border border-border p-5">
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.segment] }} />
                  {s.segment} Customers
                </div>
                <div className="mt-4 grid grid-cols-2 divide-x divide-border">
                  <div className="space-y-4 pr-6">
                    <div>
                      <p className="text-sm text-muted-foreground">GMV</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{formatAed(s.gmv)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{formatNumber(s.transactions)}</p>
                    </div>
                  </div>
                  <div className="space-y-4 pl-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. spend</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{formatAed(avgSpend)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchases / customer</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{avgTx.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
