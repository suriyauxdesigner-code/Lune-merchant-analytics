import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/utils"
import type { QualificationBucket, QualificationReason } from "@/lib/mock-performance"

const COLORS = ["hsl(38 92% 42%)", "hsl(217 91% 45%)", "hsl(0 72% 51%)", "hsl(220 9% 55%)"]

const SUGGESTION: Partial<Record<QualificationReason, string>> = {
  "Minimum spend not met": "Consider lowering the minimum spend threshold to qualify more transactions.",
  "Outside campaign period": "Consider extending the campaign window to capture more eligible purchases.",
  "Invalid merchant/terminal": "Check that all terminals are correctly registered to this campaign.",
}

/**
 * "Why didn't this transaction qualify" — helps a merchant spot optimization opportunities in
 * their own rules. `qualified` is optional: pass it (Campaign Analytics) to show the
 * attempted/qualified/rejected eligibility summary above the reason breakdown.
 */
export function QualificationBreakdown({ buckets, qualified }: { buckets: QualificationBucket[]; qualified?: number }) {
  const rejected = buckets.reduce((s, b) => s + b.count, 0)
  const total = rejected || 1
  const attempted = qualified != null ? qualified + rejected : null

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
          const suggestion = SUGGESTION[bucket.reason]
          return (
            <div key={bucket.reason}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {bucket.reason}
                  {suggestion && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground">
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{suggestion}</TooltipContent>
                    </Tooltip>
                  )}
                </span>
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
    </div>
  )
}
