import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/utils"
import type { QualificationBucket, QualificationReason } from "@/lib/mock-performance"

const COLORS = ["hsl(38 92% 42%)", "hsl(217 91% 45%)", "hsl(0 72% 51%)", "hsl(220 9% 55%)"]

// Reason → plain-language meaning, always visible, and an actionable tip where one genuinely
// exists. "Other" has neither — there's nothing meaningful to explain or recommend.
const MEANING: Partial<Record<QualificationReason, string>> = {
  "Minimum spend not met": "The transaction was below this campaign's minimum spend requirement.",
  "Outside campaign period": "The transaction occurred outside the campaign's active period.",
  "Transaction from an unconfigured terminal": "This transaction occurred at a payment terminal that isn't linked to the campaign.",
}

const TIP: Partial<Record<QualificationReason, string>> = {
  "Minimum spend not met": "Consider lowering the minimum spend threshold to increase the number of eligible transactions.",
  "Transaction from an unconfigured terminal": "Check that all terminals are correctly linked to this campaign.",
}

/**
 * "Why didn't this transaction qualify" — helps a merchant spot optimization opportunities in
 * their own rules. Each reason shows its meaning and, where one exists, an actionable tip
 * directly in the body text — never only on hover. `qualified` is optional: pass it (Campaign
 * Analytics) to show the attempted/qualified/rejected eligibility summary above the breakdown.
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
      <div className="space-y-5">
        {buckets.map((bucket, i) => {
          const pct = Math.round((bucket.count / total) * 100)
          const meaning = MEANING[bucket.reason]
          const tip = TIP[bucket.reason]
          return (
            <div key={bucket.reason}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{bucket.reason}</span>
                <span className="text-muted-foreground">
                  {formatNumber(bucket.count)} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
              {meaning && <p className="mt-1.5 text-xs text-muted-foreground">{meaning}</p>}
              {tip && (
                <p className="mt-1 flex items-start gap-1 text-xs font-medium text-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="mt-0.5 shrink-0 text-muted-foreground">
                        <Info className="size-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{tip}</TooltipContent>
                  </Tooltip>
                  Tip: {tip}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
