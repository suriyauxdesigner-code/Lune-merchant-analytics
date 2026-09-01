import type { Campaign, Channel } from "./types"
import { NOW, type DateRange } from "./analytics-utils"

// ---------------------------------------------------------------------------
// Prototype performance data.
//
// Pulse does not yet capture transaction, SDK-event, or customer data. Every
// number this file produces is a deterministic MOCK derived from a campaign's
// real configuration (budget, cashback %, status, dates) — never random on
// each render, so the same campaign always shows the same numbers and brand/
// main-level totals always foot to the sum of their campaigns.
//
// "GMV" (gross transaction value) and "ROI" here are computed from two
// available (mock) numbers — transaction value and cashback cost — never
// from a fabricated attribution or baseline/control assumption. True
// incremental impact (the business generated *because of* the campaign,
// versus what would have happened anyway) is NOT modeled here — that
// requires attribution methodology Pulse doesn't have, and this file
// deliberately does not pretend otherwise.
//
// Tiers (shown as small badges in the UI, never as locks):
//  - "live"        available today from Pulse's existing config data
//  - "transaction" requires transaction/settlement data from the backend
//  - "future"      requires SDK event / customer instrumentation Pulse doesn't have yet
// ---------------------------------------------------------------------------

export type DataTier = "live" | "transaction" | "future"

export const TIER_LABEL: Record<DataTier, string> = {
  live: "Live",
  transaction: "Requires transaction data",
  future: "Coming soon",
}

// --- deterministic seeded "randomness" ---------------------------------

function hash(str: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return ((h >>> 0) % 100000) / 100000
}

function seeded(id: string, salt: number, min: number, max: number): number {
  return min + hash(id, salt) * (max - min)
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

// --- per-campaign mock performance --------------------------------------

export type DailyPoint = { date: string; transactions: number; transactionValue: number; cashbackIssued: number }

export type ChannelPerf = {
  transactions: number
  transactionValue: number
  cashbackIssued: number
  avgTransactionValue: number
  utilizationPct: number
  roi: number
}

export type QualificationReason = "Minimum spend not met" | "Outside campaign period" | "Invalid merchant/terminal" | "Other"

export type QualificationBucket = { reason: QualificationReason; count: number }

export type CampaignPerformance = {
  hasStarted: boolean
  utilizationPct: number
  cashbackIssued: number
  remainingBudget: number
  /** Cashback issued per active day since activation — the basis for the Budget Pacing forecast. */
  burnRatePerDay: number
  /** Projected date the remaining budget runs out at the current burn rate. Null when the campaign isn't actively spending (completed, or no burn yet). */
  estimatedExhaustionDate: string | null
  avgTransactionValue: number
  avgCashbackPerTransaction: number
  transactions: number
  transactionValue: number
  roi: number
  /**
   * Modeled assumption of what GMV would have been without the cashback incentive — NOT a
   * measured figure. A real incremental-impact number requires transaction attribution and a
   * control/baseline group, which Pulse doesn't have; every consumer of these three fields must
   * label them "Estimated".
   */
  estimatedUpliftPct: number
  estimatedBaselineValue: number
  estimatedIncrementalValue: number
  offerShown: number
  offerViewed: number
  offerClicked: number
  cashbackIssuedCount: number
  viewToClickRate: number
  clickToTransactionRate: number
  offerToTransactionRate: number
  transactionToCashbackRate: number
  customersReached: number
  customersTransacted: number
  newCustomers: number
  returningCustomers: number
  repeatPurchaseRate: number
  qualification: QualificationBucket[]
  disqualifiedCount: number
  channelSplit: Partial<Record<Channel, ChannelPerf>> | null
  dailySeries: DailyPoint[]
}

const ZERO_QUALIFICATION: QualificationBucket[] = [
  { reason: "Minimum spend not met", count: 0 },
  { reason: "Outside campaign period", count: 0 },
  { reason: "Invalid merchant/terminal", count: 0 },
  { reason: "Other", count: 0 },
]

const ZERO_PERF: Omit<CampaignPerformance, "hasStarted"> = {
  utilizationPct: 0,
  cashbackIssued: 0,
  remainingBudget: 0,
  burnRatePerDay: 0,
  estimatedExhaustionDate: null,
  avgTransactionValue: 0,
  avgCashbackPerTransaction: 0,
  transactions: 0,
  transactionValue: 0,
  roi: 0,
  estimatedUpliftPct: 0,
  estimatedBaselineValue: 0,
  estimatedIncrementalValue: 0,
  offerShown: 0,
  offerViewed: 0,
  offerClicked: 0,
  cashbackIssuedCount: 0,
  viewToClickRate: 0,
  clickToTransactionRate: 0,
  offerToTransactionRate: 0,
  transactionToCashbackRate: 0,
  customersReached: 0,
  customersTransacted: 0,
  newCustomers: 0,
  returningCustomers: 0,
  repeatPurchaseRate: 0,
  qualification: ZERO_QUALIFICATION,
  disqualifiedCount: 0,
  channelSplit: null,
  dailySeries: [],
}

const cache = new Map<string, CampaignPerformance>()

export function getCampaignPerformance(campaign: Campaign): CampaignPerformance {
  const cached = cache.get(campaign.id)
  if (cached) return cached

  const perf = computeCampaignPerformance(campaign)
  cache.set(campaign.id, perf)
  return perf
}

function computeCampaignPerformance(campaign: Campaign): CampaignPerformance {
  const id = campaign.id

  // A campaign that never went live has no performance yet — that's a real
  // zero, not a missing/locked value.
  if (!campaign.activatedAt) {
    return { hasStarted: false, ...ZERO_PERF }
  }

  const activatedAt = new Date(campaign.activatedAt)
  const windowEnd = campaign.completedAt ? new Date(campaign.completedAt) : NOW

  const isCompleted = campaign.status === "completed"
  const utilizationPct = seeded(id, 1, isCompleted ? 74 : 28, isCompleted ? 98 : 79)
  const cashbackIssued = Math.round((campaign.budget * utilizationPct) / 100)
  const remainingBudget = campaign.budget - cashbackIssued

  const minSpendFloor = campaign.minimumSpend ?? 60
  const avgTransactionValue = Math.round(seeded(id, 2, minSpendFloor * 1.15, minSpendFloor * 2.6) / 5) * 5
  const avgCashbackPerTransaction = Math.min(campaign.cashbackCap, Math.round((avgTransactionValue * campaign.cashbackPercentage) / 100))

  const transactions = Math.max(1, Math.round(cashbackIssued / Math.max(1, avgCashbackPerTransaction)))
  const transactionValue = transactions * avgTransactionValue
  const roi = cashbackIssued > 0 ? transactionValue / cashbackIssued : 0

  // Burn rate + exhaustion forecast — only meaningful while a campaign is still actively spending.
  const activeDays = Math.max(1, daysBetween(activatedAt, windowEnd))
  const burnRatePerDay = campaign.status === "active" ? cashbackIssued / activeDays : 0
  const estimatedExhaustionDate =
    campaign.status === "active" && burnRatePerDay > 0 && remainingBudget > 0
      ? new Date(NOW.getTime() + (remainingBudget / burnRatePerDay) * 86_400_000).toISOString().slice(0, 10)
      : null

  // Modeled baseline/uplift — a deterministic estimate, not a measured attribution result.
  const estimatedUpliftPct = seeded(id, 40, 8, 24)
  const estimatedBaselineValue = transactionValue / (1 + estimatedUpliftPct / 100)
  const estimatedIncrementalValue = transactionValue - estimatedBaselineValue

  // Funnel — built upward from `transactions` so every widget agrees on the same count.
  const clickToTransactionRate = seeded(id, 4, 0.18, 0.35)
  const viewToClickRate = seeded(id, 5, 0.3, 0.48)
  const shownToViewRate = seeded(id, 6, 0.55, 0.72)
  const offerClicked = Math.round(transactions / clickToTransactionRate)
  const offerViewed = Math.round(offerClicked / viewToClickRate)
  const offerShown = Math.round(offerViewed / shownToViewRate)
  const offerToTransactionRate = transactions / offerShown
  const transactionToCashbackRate = seeded(id, 7, 0.92, 0.99)
  const cashbackIssuedCount = Math.round(transactions * transactionToCashbackRate)

  // Customers
  const customersReached = Math.round(offerShown * seeded(id, 8, 0.55, 0.75))
  const customersTransacted = Math.round(transactions * seeded(id, 9, 0.85, 0.97))
  const returningCustomers = Math.round(customersTransacted * seeded(id, 10, 0.3, 0.55))
  const newCustomers = customersTransacted - returningCustomers
  const repeatPurchaseRate = customersTransacted > 0 ? returningCustomers / customersTransacted : 0

  // Qualification — attempted transactions that didn't clear the campaign's own rules
  // (minimum spend, active window, merchant/terminal registration). Derived from the
  // same transaction count so it scales with actual campaign activity.
  const disqualifiedCount = Math.round(transactions * seeded(id, 13, 0.08, 0.22))
  const minSpendShare = seeded(id, 14, 0.38, 0.55)
  const outsidePeriodShare = seeded(id, 15, 0.14, 0.26)
  const invalidTerminalShare = seeded(id, 16, 0.08, 0.18)
  const otherShare = Math.max(0, 1 - minSpendShare - outsidePeriodShare - invalidTerminalShare)
  const qualification: QualificationBucket[] = [
    { reason: "Minimum spend not met", count: Math.round(disqualifiedCount * minSpendShare) },
    { reason: "Outside campaign period", count: Math.round(disqualifiedCount * outsidePeriodShare) },
    { reason: "Invalid merchant/terminal", count: Math.round(disqualifiedCount * invalidTerminalShare) },
    { reason: "Other", count: Math.round(disqualifiedCount * otherShare) },
  ]

  const channelSplit = campaign.channel === "both" ? buildChannelSplit(id, { transactions, transactionValue, cashbackIssued, avgTransactionValue, utilizationPct }) : null

  const dailySeries = buildDailySeries(id, activatedAt, windowEnd, isCompleted, cashbackIssued, avgCashbackPerTransaction, avgTransactionValue)

  return {
    hasStarted: true,
    utilizationPct,
    cashbackIssued,
    remainingBudget,
    burnRatePerDay,
    estimatedExhaustionDate,
    avgTransactionValue,
    avgCashbackPerTransaction,
    transactions,
    transactionValue,
    roi,
    estimatedUpliftPct,
    estimatedBaselineValue,
    estimatedIncrementalValue,
    offerShown,
    offerViewed,
    offerClicked,
    cashbackIssuedCount,
    viewToClickRate,
    clickToTransactionRate,
    offerToTransactionRate,
    transactionToCashbackRate,
    customersReached,
    customersTransacted,
    newCustomers,
    returningCustomers,
    repeatPurchaseRate,
    qualification,
    disqualifiedCount,
    channelSplit,
    dailySeries,
  }
}

function buildChannelSplit(
  id: string,
  totals: { transactions: number; transactionValue: number; cashbackIssued: number; avgTransactionValue: number; utilizationPct: number }
): Partial<Record<Channel, ChannelPerf>> {
  const onlineShare = seeded(id, 12, 0.35, 0.65)
  const onlineTransactions = Math.round(totals.transactions * onlineShare)
  const inStoreTransactions = totals.transactions - onlineTransactions
  const onlineCashback = Math.round(totals.cashbackIssued * onlineShare)
  const inStoreCashback = totals.cashbackIssued - onlineCashback
  const onlineValue = onlineTransactions * totals.avgTransactionValue
  const inStoreValue = inStoreTransactions * totals.avgTransactionValue

  return {
    online: {
      transactions: onlineTransactions,
      transactionValue: onlineValue,
      cashbackIssued: onlineCashback,
      avgTransactionValue: totals.avgTransactionValue,
      utilizationPct: totals.utilizationPct * onlineShare * 2 * (onlineTransactions / Math.max(1, totals.transactions)),
      roi: onlineCashback > 0 ? onlineValue / onlineCashback : 0,
    },
    in_store: {
      transactions: inStoreTransactions,
      transactionValue: inStoreValue,
      cashbackIssued: inStoreCashback,
      avgTransactionValue: totals.avgTransactionValue,
      utilizationPct: totals.utilizationPct * (1 - onlineShare) * 2 * (inStoreTransactions / Math.max(1, totals.transactions)),
      roi: inStoreCashback > 0 ? inStoreValue / inStoreCashback : 0,
    },
  }
}

function buildDailySeries(
  id: string,
  start: Date,
  end: Date,
  isCompleted: boolean,
  totalCashback: number,
  avgCashbackPerTransaction: number,
  avgTransactionValue: number
): DailyPoint[] {
  const days = Math.min(180, Math.max(1, daysBetween(start, end) + 1))
  const weights: number[] = []
  const rampDays = Math.max(1, Math.round(days * 0.15))
  const taperDays = isCompleted ? Math.max(1, Math.round(days * 0.1)) : 0

  for (let i = 0; i < days; i++) {
    let w = 1
    if (i < rampDays) w = (i + 1) / rampDays
    if (isCompleted && i >= days - taperDays) w *= (days - i) / taperDays
    const noise = 0.75 + seeded(`${id}-${i}`, 20, 0, 0.5)
    weights.push(Math.max(0.05, w * noise))
  }
  const weightSum = weights.reduce((s, w) => s + w, 0) || 1

  const points: DailyPoint[] = []
  const cursor = new Date(start)
  for (let i = 0; i < days; i++) {
    const dailyCashback = Math.round((totalCashback * weights[i]) / weightSum)
    const dailyTransactions = Math.round(dailyCashback / Math.max(1, avgCashbackPerTransaction))
    points.push({
      date: cursor.toISOString().slice(0, 10),
      transactions: dailyTransactions,
      transactionValue: dailyTransactions * avgTransactionValue,
      cashbackIssued: dailyCashback,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

// --- aggregation ----------------------------------------------------------

export type AggregatePerformance = Omit<CampaignPerformance, "hasStarted" | "channelSplit"> & {
  campaignsStarted: number
  /** Configured budget behind this aggregate — for channel buckets this includes the proportional split of "both"-channel campaigns, so it always matches utilizationPct's denominator. */
  budget: number
}

export function aggregatePerformance(campaigns: Campaign[]): AggregatePerformance {
  const perfs = campaigns.map((c) => ({ c, p: getCampaignPerformance(c) })).filter((x) => x.p.hasStarted)

  const budget = campaigns.reduce((s, c) => s + c.budget, 0)
  const cashbackIssued = sum(perfs, (p) => p.cashbackIssued)
  const transactions = sum(perfs, (p) => p.transactions)
  const transactionValue = sum(perfs, (p) => p.transactionValue)
  const offerShown = sum(perfs, (p) => p.offerShown)
  const offerViewed = sum(perfs, (p) => p.offerViewed)
  const offerClicked = sum(perfs, (p) => p.offerClicked)
  const cashbackIssuedCount = sum(perfs, (p) => p.cashbackIssuedCount)
  const customersReached = sum(perfs, (p) => p.customersReached)
  const customersTransacted = sum(perfs, (p) => p.customersTransacted)
  const newCustomers = sum(perfs, (p) => p.newCustomers)
  const returningCustomers = sum(perfs, (p) => p.returningCustomers)
  const disqualifiedCount = sum(perfs, (p) => p.disqualifiedCount)
  const remainingBudget = budget - cashbackIssued

  const qualification: QualificationBucket[] = ZERO_QUALIFICATION.map((z) => ({
    reason: z.reason,
    count: perfs.reduce((s, x) => s + (x.p.qualification.find((q) => q.reason === z.reason)?.count ?? 0), 0),
  }))

  // Burn rate sums across every campaign still actively spending; the exhaustion forecast uses the
  // combined remaining budget against that combined pace.
  const burnRatePerDay = sum(perfs, (p) => p.burnRatePerDay)
  const estimatedExhaustionDate =
    burnRatePerDay > 0 && remainingBudget > 0 ? new Date(NOW.getTime() + (remainingBudget / burnRatePerDay) * 86_400_000).toISOString().slice(0, 10) : null

  const estimatedBaselineValue = sum(perfs, (p) => p.estimatedBaselineValue)
  const estimatedIncrementalValue = transactionValue - estimatedBaselineValue
  const estimatedUpliftPct = estimatedBaselineValue > 0 ? (estimatedIncrementalValue / estimatedBaselineValue) * 100 : 0

  return {
    campaignsStarted: perfs.length,
    budget,
    utilizationPct: budget > 0 ? (cashbackIssued / budget) * 100 : 0,
    cashbackIssued,
    remainingBudget,
    burnRatePerDay,
    estimatedExhaustionDate,
    avgTransactionValue: transactions > 0 ? Math.round(transactionValue / transactions) : 0,
    avgCashbackPerTransaction: transactions > 0 ? cashbackIssued / transactions : 0,
    transactions,
    transactionValue,
    roi: cashbackIssued > 0 ? transactionValue / cashbackIssued : 0,
    estimatedUpliftPct,
    estimatedBaselineValue,
    estimatedIncrementalValue,
    offerShown,
    offerViewed,
    offerClicked,
    cashbackIssuedCount,
    viewToClickRate: offerViewed > 0 ? offerClicked / offerViewed : 0,
    clickToTransactionRate: offerClicked > 0 ? transactions / offerClicked : 0,
    offerToTransactionRate: offerShown > 0 ? transactions / offerShown : 0,
    transactionToCashbackRate: transactions > 0 ? cashbackIssuedCount / transactions : 0,
    customersReached,
    customersTransacted,
    newCustomers,
    returningCustomers,
    repeatPurchaseRate: customersTransacted > 0 ? returningCustomers / customersTransacted : 0,
    qualification,
    disqualifiedCount,
    dailySeries: mergeDailySeries(perfs.map((x) => x.p.dailySeries)),
  }
}

function sum(perfs: { p: CampaignPerformance }[], fn: (p: CampaignPerformance) => number): number {
  return perfs.reduce((s, x) => s + fn(x.p), 0)
}

function mergeDailySeries(series: DailyPoint[][]): DailyPoint[] {
  const byDate = new Map<string, DailyPoint>()
  for (const s of series) {
    for (const point of s) {
      const existing = byDate.get(point.date)
      if (existing) {
        existing.transactions += point.transactions
        existing.transactionValue += point.transactionValue
        existing.cashbackIssued += point.cashbackIssued
      } else {
        byDate.set(point.date, { ...point })
      }
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Aggregate performance for one channel bucket across a set of campaigns (channel === 'both' campaigns are split). */
export function aggregateChannelPerformance(campaigns: Campaign[], channel: Channel): AggregatePerformance {
  const directCampaigns = campaigns.filter((c) => c.channel === channel)
  const both = campaigns.filter((c) => c.channel === "both")

  const direct = aggregatePerformance(directCampaigns)
  const fromSplit = both.reduce(
    (acc, c) => {
      const perf = getCampaignPerformance(c)
      const split = perf.channelSplit?.[channel]
      if (!perf.hasStarted || !split) return acc
      acc.transactions += split.transactions
      acc.transactionValue += split.transactionValue
      acc.cashbackIssued += split.cashbackIssued
      acc.budget += c.budget / 2
      return acc
    },
    { transactions: 0, transactionValue: 0, cashbackIssued: 0, budget: 0 }
  )

  const transactions = direct.transactions + fromSplit.transactions
  const transactionValue = direct.transactionValue + fromSplit.transactionValue
  const cashbackIssued = direct.cashbackIssued + fromSplit.cashbackIssued
  const budget = directCampaigns.reduce((s, c) => s + c.budget, 0) + fromSplit.budget

  return {
    ...direct,
    budget,
    transactions,
    transactionValue,
    cashbackIssued,
    avgTransactionValue: transactions > 0 ? Math.round(transactionValue / transactions) : 0,
    avgCashbackPerTransaction: transactions > 0 ? cashbackIssued / transactions : 0,
    utilizationPct: budget > 0 ? (cashbackIssued / budget) * 100 : 0,
    remainingBudget: budget - cashbackIssued,
    roi: cashbackIssued > 0 ? transactionValue / cashbackIssued : 0,
  }
}

// --- charting + period comparison helpers ----------------------------------

export type SeriesPoint = { label: string; transactions: number; transactionValue: number; cashbackIssued: number }

/** Buckets a merged daily series into the selected date range, at a granularity that keeps the chart readable. */
export function bucketSeries(daily: DailyPoint[], range: DateRange): SeriesPoint[] {
  const inRange = daily.filter((p) => {
    const d = new Date(p.date)
    return d >= range.from && d <= range.to
  })
  if (inRange.length === 0) return []

  const spanDays = daysBetween(range.from, range.to) + 1
  const bucketDays = spanDays <= 31 ? 1 : spanDays <= 120 ? 7 : 30

  const buckets = new Map<string, SeriesPoint>()
  for (const p of inRange) {
    const d = new Date(p.date)
    const bucketStart = new Date(range.from)
    const offset = Math.floor(daysBetween(range.from, d) / bucketDays) * bucketDays
    bucketStart.setDate(bucketStart.getDate() + offset)
    const key = bucketStart.toISOString().slice(0, 10)
    const label =
      bucketDays === 1
        ? bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : bucketDays === 7
          ? `${bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : bucketStart.toLocaleDateString("en-US", { month: "short" })

    const existing = buckets.get(key)
    if (existing) {
      existing.transactions += p.transactions
      existing.transactionValue += p.transactionValue
      existing.cashbackIssued += p.cashbackIssued
    } else {
      buckets.set(key, { label, transactions: p.transactions, transactionValue: p.transactionValue, cashbackIssued: p.cashbackIssued })
    }
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
}

export type PeriodTotals = { transactions: number; transactionValue: number; cashbackIssued: number; avgTransactionValue: number; roi: number }

/** Sums a merged daily series within an arbitrary [from, to] window — used to compare the current period against the one before it. */
export function sumSeriesInRange(daily: DailyPoint[], range: DateRange): PeriodTotals {
  let transactions = 0
  let transactionValue = 0
  let cashbackIssued = 0
  for (const p of daily) {
    const d = new Date(p.date)
    if (d >= range.from && d <= range.to) {
      transactions += p.transactions
      transactionValue += p.transactionValue
      cashbackIssued += p.cashbackIssued
    }
  }
  return {
    transactions,
    transactionValue,
    cashbackIssued,
    avgTransactionValue: transactions > 0 ? Math.round(transactionValue / transactions) : 0,
    roi: cashbackIssued > 0 ? transactionValue / cashbackIssued : 0,
  }
}

/** The immediately preceding window of equal length to `range` — e.g. "Last 30 days" -> the 30 days before that. */
export function previousPeriod(range: DateRange): DateRange {
  const spanMs = range.to.getTime() - range.from.getTime()
  return { from: new Date(range.from.getTime() - spanMs - 86_400_000), to: new Date(range.from.getTime() - 86_400_000) }
}

/** % change from previous -> current, or null when there's no prior-period activity to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

// --- transaction log --------------------------------------------------------

const TERMINAL_POOL = ["Dubai Mall", "Mall of the Emirates", "Yas Mall, Abu Dhabi", "City Centre Deira", "Sharjah City Centre", "Abu Dhabi Corniche"]

export type TransactionRow = {
  id: string
  date: string // ISO date
  campaignId: string
  brandId: string
  amount: number
  cashback: number
  channel: "online" | "in_store"
  terminalName: string
  status: "Rewarded" | "Pending settlement"
}

/** Individual transaction rows for the Transaction Log — expanded from each campaign's daily series so counts always foot to the Transactions KPI. */
export function generateTransactionRows(campaigns: Campaign[]): TransactionRow[] {
  const rows: TransactionRow[] = []

  for (const campaign of campaigns) {
    const perf = getCampaignPerformance(campaign)
    if (!perf.hasStarted || perf.dailySeries.length === 0) continue

    // Daily counts are independently rounded per bucket, so they can drift a little from the
    // authoritative `transactions` total shown everywhere else. Correct the last active day so
    // the log always foots exactly to that number.
    const dailySum = perf.dailySeries.reduce((s, d) => s + d.transactions, 0)
    const drift = perf.transactions - dailySum
    const lastActiveIndex = [...perf.dailySeries].map((d) => d.transactions).lastIndexOf(Math.max(...perf.dailySeries.map((d) => d.transactions)))
    const adjustedDays = perf.dailySeries.map((d, i) => (i === lastActiveIndex ? { ...d, transactions: Math.max(0, d.transactions + drift) } : d))

    for (const day of adjustedDays) {
      for (let i = 0; i < day.transactions; i++) {
        const rowSeed = `${campaign.id}-${day.date}-${i}`
        const amount = Math.max(1, Math.round(perf.avgTransactionValue * seeded(rowSeed, 30, 0.65, 1.4)))
        const cashback = Math.min(campaign.cashbackCap, Math.round((amount * campaign.cashbackPercentage) / 100))
        const channel: "online" | "in_store" =
          campaign.channel === "both" ? (seeded(rowSeed, 31, 0, 1) < 0.5 ? "online" : "in_store") : campaign.channel
        const terminalName = channel === "online" ? `${campaign.brandId}.ae checkout` : TERMINAL_POOL[Math.floor(seeded(rowSeed, 32, 0, TERMINAL_POOL.length))]
        const status = seeded(rowSeed, 33, 0, 1) < 0.04 ? "Pending settlement" : "Rewarded"

        rows.push({
          id: rowSeed,
          date: day.date,
          campaignId: campaign.id,
          brandId: campaign.brandId,
          amount,
          cashback,
          channel,
          terminalName,
          status,
        })
      }
    }
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date))
}
