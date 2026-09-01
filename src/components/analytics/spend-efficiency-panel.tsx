import { MetricTiles } from "./metric-tiles"
import { formatAed, formatRatio } from "@/lib/utils"

/** Is cashback spend efficient? Frames Investment/GMV/ROI around a cost lens, plus the one genuinely new number: cost per transaction. */
export function SpendEfficiencyPanel({ cashbackIssued, transactionValue, transactions, roi }: { cashbackIssued: number; transactionValue: number; transactions: number; roi: number }) {
  const costPerTransaction = transactions > 0 ? cashbackIssued / transactions : 0

  return (
    <div>
      <MetricTiles
        columns={2}
        showTierBadges={false}
        items={[
          { key: "investment", label: "Cashback Investment", value: formatAed(cashbackIssued) },
          { key: "gmv", label: "GMV Generated", value: formatAed(transactionValue) },
          { key: "cost", label: "Cost per Transaction", value: formatAed(costPerTransaction) },
          { key: "roi", label: "Return on Cashback", value: formatRatio(roi) },
        ]}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Every AED 1 of cashback generated {formatRatio(roi)} in GMV, at an average cost of {formatAed(costPerTransaction)} per transaction.
      </p>
    </div>
  )
}
