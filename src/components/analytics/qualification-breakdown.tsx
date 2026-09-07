import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
 * their own rules. Each reason's plain-language meaning sits behind an info icon next to its
 * title (hover to read it); the actionable tip, where one exists, is the one thing that's always
 * visible as helper text, since it's the part worth acting on rather than just understanding.
 * `qualified` is optional: pass it (Campaign Analytics) to show the attempted/qualified/rejected
 * eligibility summary above the breakdown.
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
      <div>
        {sortedBuckets.map((bucket, i) => {
          const pct = Math.round((bucket.count / total) * 100)
          const meaning = MEANING[bucket.reason]
          const tip = TIP[bucket.reason]
          return (
            <div key={bucket.reason} className="border-t border-border py-4 first:border-t-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                  {bucket.reason}
                  {meaning && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 shrink-0 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>{meaning}</TooltipContent>
                    </Tooltip>
                  )}
                </span>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="text-base font-semibold tabular-nums text-foreground">{formatNumber(bucket.count)}</span>
                  <span className="ml-1 text-sm text-muted-foreground">· {pct}%</span>
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
              {tip && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> {tip}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
