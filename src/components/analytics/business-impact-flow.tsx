import { ArrowDown, ArrowRight, Coins, Receipt, TrendingUp, Target } from "lucide-react"
import { formatAed, formatNumber, formatRatio } from "@/lib/utils"
import { INCREMENTAL_IMPACT_NOTE } from "@/lib/future-data"

export function BusinessImpactFlow({ cashbackIssued, transactions, transactionValue, roi }: { cashbackIssued: number; transactions: number; transactionValue: number; roi: number }) {
  const steps = [
    { label: "Cashback Investment", value: formatAed(cashbackIssued), icon: Coins },
    { label: "Transactions", value: formatNumber(transactions), icon: Receipt },
    { label: "GMV Generated", value: formatAed(transactionValue), icon: TrendingUp },
    { label: "Return on Cashback", value: formatRatio(roi), icon: Target },
  ]

  return (
    <div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-stretch">
            <div className="flex-1 rounded-[var(--radius)] border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">{step.label}</p>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-secondary text-primary">
                  <step.icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{step.value}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center py-1 text-muted-foreground/50 sm:px-2 sm:py-0">
                <ArrowDown className="size-4 sm:hidden" />
                <ArrowRight className="hidden size-4 sm:block" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{INCREMENTAL_IMPACT_NOTE}</p>
    </div>
  )
}
