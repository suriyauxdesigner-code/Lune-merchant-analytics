import { formatAed, formatPercent, cn } from "@/lib/utils"
import { ESTIMATED_IMPACT_NOTE } from "@/lib/future-data"

function ImpactTag({ estimated }: { estimated: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
        estimated ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
      )}
    >
      {estimated ? "Estimated" : "Measured"}
    </span>
  )
}

/** GMV against a modeled "without cashback" baseline — clearly split into what's measured vs. what's estimated. */
export function CampaignImpact({
  transactionValue,
  estimatedBaselineValue,
  estimatedIncrementalValue,
  estimatedUpliftPct,
}: {
  transactionValue: number
  estimatedBaselineValue: number
  estimatedIncrementalValue: number
  estimatedUpliftPct: number
}) {
  const tiles = [
    { label: "GMV (with cashback)", value: formatAed(transactionValue), estimated: false },
    { label: "Estimated Baseline GMV", value: formatAed(estimatedBaselineValue), estimated: true },
    { label: "Estimated Incremental GMV", value: `+${formatAed(estimatedIncrementalValue)}`, estimated: true },
    { label: "Estimated Uplift", value: `+${formatPercent(estimatedUpliftPct)}`, estimated: true },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[var(--radius-sm)] border border-border bg-card px-3.5 py-3">
            <p className="text-sm font-medium text-muted-foreground">{t.label}</p>
            <p className="mt-1.5 text-lg font-bold text-foreground">{t.value}</p>
            <div className="mt-1.5">
              <ImpactTag estimated={t.estimated} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{ESTIMATED_IMPACT_NOTE}</p>
    </div>
  )
}
