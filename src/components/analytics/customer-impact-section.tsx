import { ArrowDown, ArrowRight } from "lucide-react"
import { MetricTiles } from "./metric-tiles"
import { FUNNEL_STAGES } from "@/lib/future-data"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type Perf = Pick<
  AggregatePerformance,
  | "offerShown"
  | "offerViewed"
  | "offerClicked"
  | "transactions"
  | "cashbackIssuedCount"
  | "customersReached"
  | "customersTransacted"
  | "newCustomers"
  | "returningCustomers"
  | "repeatPurchaseRate"
  | "offerToTransactionRate"
>

const FUNNEL_KEYS: (keyof Perf)[] = ["offerShown", "offerViewed", "offerClicked", "transactions", "cashbackIssuedCount"]

/** One cohesive "how are customers responding" section — a compact funnel plus the metrics it feeds. */
export function CustomerImpactSection({ perf }: { perf: Perf }) {
  return (
    <div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {FUNNEL_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-stretch">
            <div className="flex-1 rounded-[var(--radius-sm)] bg-gradient-to-br from-card to-secondary/60 px-4 py-4 text-center">
              <p className="text-xl font-bold text-foreground">{formatNumber(perf[FUNNEL_KEYS[i]])}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{stage.label}</p>
            </div>
            {i < FUNNEL_STAGES.length - 1 && (
              <div className="flex items-center justify-center py-1 text-muted-foreground/50 sm:px-2 sm:py-0">
                <ArrowDown className="size-4 sm:hidden" />
                <ArrowRight className="hidden size-4 sm:block" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <MetricTiles
          columns={6}
          showTierBadges={false}
          items={[
            { key: "reached", label: "Customers Reached", value: formatNumber(perf.customersReached) },
            { key: "transacted", label: "Customers Transacted", value: formatNumber(perf.customersTransacted) },
            { key: "new", label: "New Customers", value: formatNumber(perf.newCustomers) },
            { key: "returning", label: "Returning Customers", value: formatNumber(perf.returningCustomers) },
            { key: "repeat", label: "Repeat Purchase Rate", value: formatPercent(perf.repeatPurchaseRate * 100) },
            { key: "conversion", label: "Conversion Rate", value: formatPercent(perf.offerToTransactionRate * 100) },
          ]}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Reach and click data requires SDK event instrumentation; customer and repeat-purchase data requires customer-level transaction history. Shown here as prototype sample data.
        </p>
      </div>
    </div>
  )
}
