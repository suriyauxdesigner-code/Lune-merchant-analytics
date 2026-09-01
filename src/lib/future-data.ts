// ---------------------------------------------------------------------------
// Narrative copy paired with the numbers in mock-performance.ts.
// ---------------------------------------------------------------------------

export type FunnelStageMeta = { key: "offer_shown" | "offer_viewed" | "offer_clicked" | "transaction" | "rewarded"; label: string }

export const FUNNEL_STAGES: FunnelStageMeta[] = [
  { key: "offer_shown", label: "Offer Shown" },
  { key: "offer_viewed", label: "Offer Viewed" },
  { key: "offer_clicked", label: "Offer Clicked" },
  { key: "transaction", label: "Transacted" },
  // Distinct from the "Cashback Issued" AED figure shown elsewhere — this is a count of transactions, not a value.
  { key: "rewarded", label: "Rewarded" },
]

/** GMV and ROI below are real ratios of two available (mock) numbers — never a fabricated attribution or baseline assumption. */
export const INCREMENTAL_IMPACT_NOTE =
  "GMV and ROI reflect total transaction value against cashback cost — not incremental revenue. Measuring the business this campaign generated beyond what would have happened anyway requires transaction attribution and a control/baseline group, which Pulse doesn't yet support."

export const QUALIFICATION_NOTE = "Attempted transactions that didn't clear this campaign's own rules — a prototype estimate of what a transaction/rules engine would report."

/** Paired with estimatedBaselineValue / estimatedIncrementalValue / estimatedUpliftPct — always label these "Estimated", never "Measured". */
export const ESTIMATED_IMPACT_NOTE =
  "Baseline and incremental GMV are modeled estimates, not measured results. A confirmed figure requires transaction attribution and a control/baseline group, which Pulse doesn't yet support."
