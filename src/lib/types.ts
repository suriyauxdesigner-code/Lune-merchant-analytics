// ---------------------------------------------------------------------------
// Core product data model — everything here mirrors data that already exists
// in the current Pulse Merchant product (brands, campaigns, merchant/terminal
// configuration). Nothing in this file represents transaction, customer, or
// attribution data — see future-data.ts for that conceptual, clearly-labeled
// future state.
// ---------------------------------------------------------------------------

export type Channel = "online" | "in_store" | "both"

export type MerchantIdChannel = Channel
export type TerminalChannel = "online" | "in_store"

export type TerminalId = {
  id: string
  terminalId: string
  channel: TerminalChannel
  terminalName: string
}

export type Acquirer = "Stripe" | "Network International" | "Magnati" | "Checkout.com"

export type MerchantId = {
  id: string
  merchantId: string
  acquirer: Acquirer
  channel: MerchantIdChannel
  terminals: TerminalId[]
}

export type BrandSnapshot = {
  avgTransactionValue: number
  avgMonthlyOrders: number
  monthlyMarketingBudget: number
}

export type Brand = {
  id: string
  name: string
  slug: string
  website: string
  logoInitials: string
  logoColor: string
  addedOn: string // ISO date
  merchantIds: MerchantId[]
  businessSnapshot: BrandSnapshot
}

export type CampaignStatus =
  | "active"
  | "pending_approval"
  | "scheduled"
  | "completed"
  | "rejected"

export type BudgetUtilization = "exhaust" | "fixed_duration"

export type DistributionBank =
  | "ADCB"
  | "Mashreq"
  | "DIB"
  | "ADIB"
  | "Emirates NBD"
  | "RAKBANK"

export type Campaign = {
  id: string
  brandId: string
  name: string
  status: CampaignStatus
  budget: number
  cashbackPercentage: number
  minimumSpend: number | null
  cashbackCap: number
  startDate: string // ISO date
  endDate: string | null // null when budgetUtilization === "exhaust" and no fixed end
  budgetUtilization: BudgetUtilization
  durationDays: number | null // null = "till budget exhausted"
  channel: Channel
  distributionBank: DistributionBank
  createdAt: string // ISO date — when the campaign was first created/drafted
  activatedAt: string | null // ISO date — when it went live (null if never activated)
  completedAt: string | null // ISO date — when it finished
}

export type Merchant = {
  id: string
  name: string
  region: string
  currency: string
  contactEmail: string
}
