import { Info } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import type { QualificationBucket, QualificationReason } from "@/lib/mock-performance"

const COLORS = ["hsl(38 92% 42%)", "hsl(217 91% 45%)", "hsl(0 72% 51%)", "hsl(266 65% 58%)", "hsl(340 70% 50%)", "hsl(152 55% 34%)", "hsl(220 9% 55%)"]

// Reason → plain-language meaning, always visible, and an actionable tip where one genuinely
// exists — every reason here is something a merchant can actually investigate or adjust, so all
// seven currently have both.
const MEANING: Partial<Record<QualificationReason, string>> = {
  "Minimum spend not met": "The transaction was below this campaign's minimum spend requirement.",
  "Customer not activated for this offer": "The customer hadn't activated this cashback offer before completing the transaction.",
  "Per-customer cashback cap reached": "This customer had already earned the maximum cashback allowed per customer on this campaign.",
  "Transaction from an unconfigured terminal": "This transaction occurred at a payment terminal that isn't linked to the campaign.",
  "Card not eligible for this offer": "The card used isn't within this offer's eligible card range.",
  "Customer outside the target segment": "This customer isn't part of the audience segment this campaign targets.",
  "Campaign budget exhausted": "The campaign's allocated budget had already been fully spent when this transaction occurred.",
}

const TIP: Partial<Record<QualificationReason, string>> = {
  "Minimum spend not met": "Consider lowering the minimum spend threshold to increase the number of eligible transactions.",
  "Customer not activated for this offer": "Consider prompting customers to activate the offer earlier in their journey, or simplifying the activation step.",
  "Per-customer cashback cap reached": "Consider raising the per-customer cashback cap if you want repeat customers to keep earning on this offer.",
  "Transaction from an unconfigured terminal": "Check that all terminals are correctly linked to this campaign.",
  "Card not eligible for this offer": "Check that the offer's eligible card list covers the card ranges your customers actually use.",
  "Customer outside the target segment": "Consider widening this campaign's target audience if a large share of attempted transactions fall outside it.",
  "Campaign budget exhausted": "Consider topping up the campaign budget to keep rewarding eligible transactions.",
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
  const sortedBuckets = [...buckets].sort((a, b) => b.count - a.count)

  return (
    <div>
      {attempted != null && (
        <div className="mb-6 grid grid-cols-3 gap-3 border-b border-border pb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Attempted</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatNumber(attempted)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Qualified</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-success">{formatNumber(qualified!)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Rejected</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{formatNumber(rejected)}</p>
          </div>
        </div>
      )}
      <div className="space-y-5">
        {sortedBuckets.map((bucket, i) => {
          const pct = Math.round((bucket.count / total) * 100)
          const meaning = MEANING[bucket.reason]
          const tip = TIP[bucket.reason]
          return (
            <div key={bucket.reason}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold text-foreground">{bucket.reason}</span>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="text-base font-semibold tabular-nums text-foreground">{formatNumber(bucket.count)}</span>
                  <span className="ml-1 text-sm text-muted-foreground">· {pct}%</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
              {meaning && <p className="mt-2 text-xs text-muted-foreground">{meaning}</p>}
              {tip && (
                <p className="mt-1 flex items-start gap-1 text-xs font-medium text-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
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
