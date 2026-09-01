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

  return (
    <div>
      <div className="flex flex-wrap items-start gap-8">
        <div className="shrink-0">
          <DonutChart
            segments={stats.map((s) => ({ label: s.segment, value: s.customers, color: SEGMENT_COLORS[s.segment] }))}
            formatValue={formatNumber}
            centerLabel="Customers"
            centerValue={formatNumber(totalCustomers)}
            size={160}
          />
        </div>
        <div className="min-w-[240px] flex-1 space-y-4">
          {stats.map((s) => {
            const avgSpend = s.customers > 0 ? s.gmv / s.customers : 0
            const avgTx = s.customers > 0 ? s.transactions / s.customers : 0
            return (
              <div key={s.segment} className="rounded-[var(--radius-sm)] border border-border p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.segment] }} />
                  {s.segment} · {formatPercent(totalCustomers > 0 ? (s.customers / totalCustomers) * 100 : 0, 0)}
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
      {spendMultiple > 1.05 && (
        <p className="mt-4 text-xs text-muted-foreground">Returning customers spend {spendMultiple.toFixed(1)}× more on average than a new customer's first purchase.</p>
      )}
    </div>
  )
}
