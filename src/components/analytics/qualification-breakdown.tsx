import { formatNumber } from "@/lib/utils"
import { QUALIFICATION_NOTE } from "@/lib/future-data"
import type { QualificationBucket } from "@/lib/mock-performance"

const COLORS = ["hsl(38 92% 42%)", "hsl(217 91% 45%)", "hsl(0 72% 51%)", "hsl(220 9% 55%)"]

/** "Why didn't this transaction qualify" — helps a merchant spot optimization opportunities in their own rules. */
export function QualificationBreakdown({ buckets }: { buckets: QualificationBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1

  return (
    <div>
      <div className="space-y-3.5">
        {buckets.map((bucket, i) => {
          const pct = Math.round((bucket.count / total) * 100)
          return (
            <div key={bucket.reason}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{bucket.reason}</span>
                <span className="text-muted-foreground">
                  {formatNumber(bucket.count)} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{QUALIFICATION_NOTE}</p>
    </div>
  )
}
