import { ArrowRight } from "lucide-react"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<
  AggregatePerformance,
  "offerShown" | "offerViewed" | "offerClicked" | "transactions" | "cashbackIssuedCount" | "customersReached" | "customersTransacted" | "repeatPurchaseRate"
>

const FUNNEL_STEPS: { key: keyof Perf; label: string }[] = [
  { key: "offerShown", label: "Shown" },
  { key: "offerViewed", label: "Viewed" },
  { key: "offerClicked", label: "Clicked" },
  { key: "transactions", label: "Transacted" },
  // Distinct from the "Cashback Issued" AED figure shown elsewhere — this is a count of transactions, not a value.
  { key: "cashbackIssuedCount", label: "Rewarded" },
]

export function CustomerInsightsPreview({ perf }: { perf: Perf }) {
  return (
    <div className="h-full rounded-[var(--radius)] border border-border bg-card p-6">
      <p className="text-sm font-semibold text-foreground">Customer Insights</p>
      <p className="mt-1 max-w-xl text-xs text-muted-foreground">
        Understand reach, acquisition and repeat purchase behavior once customer-level transaction data is available.
      </p>

      {/* Mini funnel */}
      <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {FUNNEL_STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-1.5">
            <div className="rounded-[var(--radius-sm)] bg-muted px-2.5 py-1.5">
              <span className="text-sm font-semibold text-foreground">{formatNumber(perf[step.key])}</span>
              <span className="ml-1.5 text-[11px] text-muted-foreground">{step.label}</span>
            </div>
            {i < FUNNEL_STEPS.length - 1 && <ArrowRight className="size-3 text-muted-foreground/40" />}
          </div>
        ))}
      </div>

      {/* Supporting customer stats */}
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4">
        <div>
          <span className="text-sm font-semibold text-foreground">{formatNumber(perf.customersReached)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">customers reached</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">{formatNumber(perf.customersTransacted)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">customers transacted</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">{formatPercent(perf.repeatPurchaseRate * 100)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">repeat purchase rate</span>
        </div>
      </div>
    </div>
  )
}
