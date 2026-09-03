import { DonutChart } from "./donut-chart"
import { formatAed, formatNumber, formatPercent } from "@/lib/utils"
import type { NewReturningStat } from "@/lib/mock-performance"

const SEGMENT_COLORS: Record<string, string> = { New: "hsl(217 91% 55%)", Returning: "hsl(160 62% 22%)" }

/** New vs. returning customers, and how each segment's value compares. */
export function NewReturningPanel({ stats }: { stats: NewReturningStat[] }) {
  const totalCustomers = stats.reduce((s, x) => s + x.customers, 0)
  const [newStat, returningStat] = stats
  const newAvgSpend = newStat.customers > 0 ? newStat.gmv / newStat.customers : 0
  const returningAvgSpend = returningStat.customers > 0 ? returningStat.gmv / returningStat.customers : 0
  const spendMultiple = newAvgSpend > 0 ? returningAvgSpend / newAvgSpend : 0
  const newPct = totalCustomers > 0 ? (newStat.customers / totalCustomers) * 100 : 0
  const returningPct = totalCustomers > 0 ? (returningStat.customers / totalCustomers) * 100 : 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline gap-6">
        <div>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">{formatPercent(newPct, 0)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS.New }} />
            New
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">{formatPercent(returningPct, 0)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS.Returning }} />
            Returning
          </p>
        </div>
      </div>

      {spendMultiple > 1.05 && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-secondary/60 px-3.5 py-2.5 text-sm font-medium text-foreground">
          Returning customers spend <span className="font-bold">{spendMultiple.toFixed(1)}×</span> more on average than a new customer's first purchase.
        </p>
      )}

      {/* Donut always sits above the New/Returning detail cards, never beside them — a side-by-side
          layout here used to depend on how much width this panel happened to get (which flips
          between stacked and side-by-side as the viewport changes), so the position visibly jumped
          around depending on screen size. Stacking unconditionally keeps it identical everywhere. */}
      <div className="mt-6 flex-1">
        <DonutChart
          segments={stats.map((s) => ({ label: s.segment, value: s.customers, color: SEGMENT_COLORS[s.segment] }))}
          formatValue={formatNumber}
          centerLabel="Customers"
          centerValue={formatNumber(totalCustomers)}
          size={200}
        />
        <div className="mt-5 space-y-3">
          {stats.map((s) => {
            const avgSpend = s.customers > 0 ? s.gmv / s.customers : 0
            const avgTx = s.customers > 0 ? s.transactions / s.customers : 0
            return (
              <div key={s.segment} className="rounded-[var(--radius-sm)] border border-border p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.segment] }} />
                  {s.segment}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>
                    GMV <span className="font-medium text-foreground">{formatAed(s.gmv)}</span>
                  </span>
                  <span>
                    Avg. spend <span className="font-medium text-foreground">{formatAed(avgSpend)}</span>
                  </span>
                  <span>
                    Transactions <span className="font-medium text-foreground">{formatNumber(s.transactions)}</span>
                  </span>
                  <span>
                    Purchases / customer <span className="font-medium text-foreground">{avgTx.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
