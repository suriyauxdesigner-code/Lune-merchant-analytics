import { Check } from "lucide-react"
import { MetricTiles } from "./metric-tiles"
import { CAMPAIGN_ROI_REQUIREMENTS, CAMPAIGN_ROI_EXPLANATION } from "@/lib/future-data"
import { formatAed, formatPercent, formatRatio } from "@/lib/utils"
import type { AggregatePerformance } from "@/lib/mock-performance"

type RoiData = Pick<AggregatePerformance, "campaignSpend" | "attributedTransactionValue" | "estimatedRevenue" | "roas" | "roiPct" | "costPerTransaction" | "cashbackCostPerAed">

export function CampaignRoi({ data }: { data: RoiData }) {
  return (
    <div className="space-y-4">
      <MetricTiles
        columns={3}
        items={[
          { key: "spend", label: "Campaign Spend", value: formatAed(data.campaignSpend), tier: "future" },
          { key: "attributed", label: "Attributed Transaction Value", value: formatAed(data.attributedTransactionValue), tier: "future" },
          { key: "revenue", label: "Estimated Revenue", value: formatAed(data.estimatedRevenue), tier: "future" },
          { key: "roas", label: "ROAS", value: formatRatio(data.roas), tier: "future" },
          { key: "roi", label: "ROI", value: formatPercent(data.roiPct), tier: "future" },
          { key: "cost-per-txn", label: "Cost per Transaction", value: formatAed(data.costPerTransaction), tier: "future" },
        ]}
      />

      <div className="grid gap-6 rounded-[var(--radius-sm)] border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">{CAMPAIGN_ROI_EXPLANATION}</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requires</p>
          <ul className="space-y-2">
            {CAMPAIGN_ROI_REQUIREMENTS.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-foreground">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Check className="size-2.5" />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
