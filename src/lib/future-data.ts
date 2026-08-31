// ---------------------------------------------------------------------------
// Narrative content for widgets that show prototype numbers (see
// mock-performance.ts for the numbers themselves) plus the handful of
// genuinely future-only concepts that aren't worth mocking numbers for.
// ---------------------------------------------------------------------------

export type FunnelStageMeta = { key: "offer_shown" | "offer_viewed" | "offer_clicked" | "transaction" | "cashback_issued"; label: string }

export const FUNNEL_STAGES: FunnelStageMeta[] = [
  { key: "offer_shown", label: "Offer Shown" },
  { key: "offer_viewed", label: "Offer Viewed" },
  { key: "offer_clicked", label: "Offer Clicked" },
  { key: "transaction", label: "Transaction" },
  { key: "cashback_issued", label: "Cashback Issued" },
]

export const CAMPAIGN_ROI_REQUIREMENTS = ["Transaction data", "Campaign cost", "Incremental revenue attribution", "Control/baseline methodology"]

export const CAMPAIGN_ROI_EXPLANATION =
  "These figures are a prototype estimate. True ROI requires transaction attribution and a control/baseline group to isolate revenue the campaign actually caused — transaction value alone is not the same as incremental revenue."

export type FutureOpportunity = { title: string; description: string }

export const FUTURE_OPPORTUNITIES: FutureOpportunity[] = [
  { title: "Incremental Revenue", description: "Requires transaction attribution and control/baseline measurement." },
  { title: "Customer Lifetime Value", description: "Requires longitudinal customer transaction history." },
  { title: "Customer Demographics", description: "Requires privacy-safe customer profile data." },
  { title: "Product / Category Performance", description: "Requires product-level transaction data." },
  { title: "Geographic Performance", description: "Requires transaction/store/customer location data." },
  { title: "Cross-brand Behavior", description: "Requires customer-level ecosystem data." },
]
