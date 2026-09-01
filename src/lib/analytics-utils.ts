import type { Campaign, CampaignStatus, Channel } from "./types"

// Fixed "today" so the prototype's sample data (spanning 2025–2026) filters
// against a stable, demoable reference point instead of the real clock.
export const NOW = new Date("2026-08-31T12:00:00Z")

export type DateRangeKey = "7d" | "30d" | "90d" | "ytd" | "custom"

export const DATE_RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "This year" },
  { value: "custom", label: "Custom range" },
]

export type DateRange = { from: Date; to: Date }

/** The label shown under KPI cards to say what period the figure covers — e.g. "Last 90 days". */
export function dateRangeLabel(key: DateRangeKey): string {
  return DATE_RANGE_OPTIONS.find((o) => o.value === key)?.label ?? "Custom range"
}

export function resolveDateRange(key: DateRangeKey, custom?: DateRange): DateRange {
  if (key === "custom" && custom) return custom
  const to = NOW
  if (key === "ytd") return { from: new Date(NOW.getFullYear(), 0, 1), to }
  const days = key === "7d" ? 7 : key === "30d" ? 30 : 90
  const from = new Date(to)
  from.setDate(from.getDate() - days)
  return { from, to }
}

export function isWithinRange(iso: string | null, range: DateRange) {
  if (!iso) return false
  const d = new Date(iso)
  return d >= range.from && d <= range.to
}

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "Active",
  pending_approval: "Pending Approval",
  scheduled: "Scheduled",
  completed: "Completed",
  rejected: "Rejected",
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  online: "Online",
  in_store: "In-Store",
  both: "Online & In-Store",
}

export type CampaignFilters = {
  dateRange: DateRangeKey
  customRange?: DateRange
  brandId: string | "all"
  channel: Channel | "all"
  status: CampaignStatus | "all"
  /** Free-text campaign name search, used on Main Analytics. */
  campaignQuery: string
}

export const DEFAULT_FILTERS: CampaignFilters = {
  dateRange: "90d",
  brandId: "all",
  channel: "all",
  status: "all",
  campaignQuery: "",
}

function matchesNonDateFilters(c: Campaign, filters: CampaignFilters) {
  if (filters.brandId !== "all" && c.brandId !== filters.brandId) return false
  if (filters.channel !== "all" && c.channel !== filters.channel) return false
  if (filters.status !== "all" && c.status !== filters.status) return false
  if (filters.campaignQuery.trim() && !c.name.toLowerCase().includes(filters.campaignQuery.trim().toLowerCase())) return false
  return true
}

export function applyCampaignFilters(campaigns: Campaign[], filters: CampaignFilters) {
  const range = resolveDateRange(filters.dateRange, filters.customRange)
  return campaigns.filter((c) => isWithinRange(c.createdAt, range) && matchesNonDateFilters(c, filters))
}

/** Same as applyCampaignFilters but ignores the date range — used for the activity
 * chart, which needs to see created/activated/completed events across the full
 * campaign lifecycle, not just campaigns whose createdAt falls in range. */
export function applyCampaignFiltersExceptDate(campaigns: Campaign[], filters: CampaignFilters) {
  return campaigns.filter((c) => matchesNonDateFilters(c, filters))
}

export function durationLabel(c: Campaign) {
  if (c.budgetUtilization === "exhaust") return "Till budget exhausted"
  if (c.durationDays) return `${c.durationDays} days`
  return "—"
}

export type PacingStatus = "spending_fast" | "on_track" | "underutilized"

export const PACING_LABEL: Record<PacingStatus, string> = {
  spending_fast: "Spending Fast",
  on_track: "On Track",
  underutilized: "Underutilized",
}

/**
 * Classifies budget pace from utilization-to-date and the forecast exhaustion date. A rough
 * heuristic, not a statistical model: very low spend with no exhaustion in sight reads as
 * underutilized; budget projected to run out within three weeks reads as spending fast.
 */
export function getPacingStatus(utilizationPct: number, estimatedExhaustionDate: string | null): PacingStatus {
  const daysToExhaustion = estimatedExhaustionDate ? Math.round((new Date(estimatedExhaustionDate).getTime() - NOW.getTime()) / 86_400_000) : null
  if (daysToExhaustion !== null && daysToExhaustion <= 21) return "spending_fast"
  if (utilizationPct < 20 && (daysToExhaustion === null || daysToExhaustion > 90)) return "underutilized"
  return "on_track"
}

export function monthKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" })
}

/** Builds a monthly time series of created / activated / completed campaign counts within range. */
export function buildActivitySeries(campaigns: Campaign[], range: DateRange) {
  const months: string[] = []
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1)
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), 1)
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  if (months.length === 0) months.push(monthKey(range.to.toISOString()))

  return months.map((key) => {
    const created = campaigns.filter((c) => monthKey(c.createdAt) === key).length
    const activated = campaigns.filter((c) => c.activatedAt && monthKey(c.activatedAt) === key).length
    const completed = campaigns.filter((c) => c.completedAt && monthKey(c.completedAt) === key).length
    return { month: monthLabel(key), created, activated, completed }
  })
}
