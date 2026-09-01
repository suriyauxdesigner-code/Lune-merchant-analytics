import { formatNumber } from "@/lib/utils"
import { QUALIFICATION_NOTE } from "@/lib/future-data"
import { qualificationActionInsight } from "@/lib/insights"
import type { QualificationBucket } from "@/lib/mock-performance"

const COLORS = ["hsl(38 92% 42%)", "hsl(217 91% 45%)", "hsl(0 72% 51%)", "hsl(220 9% 55%)"]

/**
 * "Why didn't this transaction qualify" — helps a merchant spot optimization opportunities in
 * their own rules. `qualified` is optional: pass it (Campaign Analytics) to show the
 * attempted/qualified/rejected eligibility summary above the reason breakdown.
 */
export function QualificationBreakdown({ buckets, qualified }: { buckets: QualificationBucket[]; qualified?: number }) {
  const rejected = buckets.reduce((s, b) => s + b.count, 0)
  const total = rejected || 1
  const attempted = qualified != null ? qualified + rejected : null
  const actionInsight = qualificationActionInsight(buckets)

  return (
    <div>
      {attempted != null && (
        <div className="mb-5 grid grid-cols-3 gap-3 border-b border-border pb-5">
          <div>
            <p className="text-xs text-muted-foreground">Attempted</p>
            <p className="mt-1 text-lg font-bold text-foreground">{formatNumber(attempted)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Qualified</p>
            <p className="mt-1 text-lg font-bold text-success">{formatNumber(qualified!)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rejected</p>
            <p className="mt-1 text-lg font-bold text-destructive">{formatNumber(rejected)}</p>
          </div>
        </div>
      )}
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
      {actionInsight && <p className="mt-1.5 text-xs font-medium text-foreground">{actionInsight}</p>}
    </div>
  )
}
