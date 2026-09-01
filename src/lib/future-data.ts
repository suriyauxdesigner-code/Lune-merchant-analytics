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

export const QUALIFICATION_NOTE = "Attempted transactions that didn't clear this campaign's own rules — a prototype estimate of what a transaction/rules engine would report."
