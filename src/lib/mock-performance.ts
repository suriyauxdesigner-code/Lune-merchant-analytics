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
// Tiers (shown as small badges in the UI, never as locks):
//  - "live"        available today from Pulse's existing config data
//  - "transaction" requires transaction/settlement data from the backend
//  - "future"      requires SDK event / customer instrumentation Pulse doesn't have yet
// ---------------------------------------------------------------------------

export type DataTier = "live" | "transaction" | "future"

export const TIER_LABEL: Record<DataTier, string> = {
  live: "Live",
  transaction: "Requires transaction data",
  future: "Future capability",
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
}

export type CampaignPerformance = {
  hasStarted: boolean
  utilizationPct: number
  cashbackIssued: number
  remainingBudget: number
  avgTransactionValue: number
  avgCashbackPerTransaction: number
  transactions: number
  transactionValue: number
  burnRatePerDay: number
  estimatedExhaustionDate: string | null
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
  campaignSpend: number
  attributedTransactionValue: number
  estimatedRevenue: number
  roas: number
  roiPct: number
  costPerTransaction: number
  cashbackCostPerAed: number
  channelSplit: Partial<Record<Channel, ChannelPerf>> | null
  dailySeries: DailyPoint[]
}

const ZERO_PERF: Omit<CampaignPerformance, "hasStarted"> = {
  utilizationPct: 0,
  cashbackIssued: 0,
  remainingBudget: 0,
  avgTransactionValue: 0,
  avgCashbackPerTransaction: 0,
  transactions: 0,
  transactionValue: 0,
  burnRatePerDay: 0,
  estimatedExhaustionDate: null,
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
  campaignSpend: 0,
  attributedTransactionValue: 0,
  estimatedRevenue: 0,
  roas: 0,
  roiPct: 0,
  costPerTransaction: 0,
  cashbackCostPerAed: 0,
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
  const activeDays = Math.max(1, daysBetween(activatedAt, windowEnd))

  const isCompleted = campaign.status === "completed"
  const utilizationPct = seeded(id, 1, isCompleted ? 74 : 28, isCompleted ? 98 : 79)
  const cashbackIssued = Math.round((campaign.budget * utilizationPct) / 100)
  const remainingBudget = campaign.budget - cashbackIssued

  const minSpendFloor = campaign.minimumSpend ?? 60
  const avgTransactionValue = Math.round(seeded(id, 2, minSpendFloor * 1.15, minSpendFloor * 2.6) / 5) * 5
  const avgCashbackPerTransaction = Math.min(campaign.cashbackCap, Math.round((avgTransactionValue * campaign.cashbackPercentage) / 100))

  const transactions = Math.max(1, Math.round(cashbackIssued / Math.max(1, avgCashbackPerTransaction)))
  const transactionValue = transactions * avgTransactionValue

  const burnRatePerDay = cashbackIssued / activeDays
  const estimatedExhaustionDate =
    campaign.status === "active" && burnRatePerDay > 0 ? new Date(NOW.getTime() + (remainingBudget / burnRatePerDay) * 86_400_000).toISOString() : null

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

  // ROI (explicitly a prototype estimate — requires attribution + a control group in reality)
  const campaignSpend = cashbackIssued
  const attributionFactor = seeded(id, 11, 0.35, 0.65)
  const attributedTransactionValue = Math.round(transactionValue * attributionFactor)
  const estimatedRevenue = attributedTransactionValue
  const roas = campaignSpend > 0 ? attributedTransactionValue / campaignSpend : 0
  const roiPct = campaignSpend > 0 ? ((attributedTransactionValue - campaignSpend) / campaignSpend) * 100 : 0
  const costPerTransaction = transactions > 0 ? campaignSpend / transactions : 0
  const cashbackCostPerAed = transactionValue > 0 ? campaignSpend / transactionValue : 0

  const channelSplit = campaign.channel === "both" ? buildChannelSplit(id, { transactions, transactionValue, cashbackIssued, avgTransactionValue, utilizationPct }) : null

  const dailySeries = buildDailySeries(id, activatedAt, windowEnd, isCompleted, cashbackIssued, avgCashbackPerTransaction, avgTransactionValue)

  return {
    hasStarted: true,
    utilizationPct,
    cashbackIssued,
    remainingBudget,
    avgTransactionValue,
    avgCashbackPerTransaction,
    transactions,
    transactionValue,
    burnRatePerDay,
    estimatedExhaustionDate,
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
    campaignSpend,
    attributedTransactionValue,
    estimatedRevenue,
    roas,
    roiPct,
    costPerTransaction,
    cashbackCostPerAed,
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

  return {
    online: {
      transactions: onlineTransactions,
      transactionValue: onlineTransactions * totals.avgTransactionValue,
      cashbackIssued: onlineCashback,
      avgTransactionValue: totals.avgTransactionValue,
      utilizationPct: totals.utilizationPct * onlineShare * 2 * (onlineTransactions / Math.max(1, totals.transactions)),
    },
    in_store: {
      transactions: inStoreTransactions,
      transactionValue: inStoreTransactions * totals.avgTransactionValue,
      cashbackIssued: inStoreCashback,
      avgTransactionValue: totals.avgTransactionValue,
      utilizationPct: totals.utilizationPct * (1 - onlineShare) * 2 * (inStoreTransactions / Math.max(1, totals.transactions)),
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

export type AggregatePerformance = Omit<CampaignPerformance, "hasStarted" | "channelSplit" | "estimatedExhaustionDate"> & {
  campaignsStarted: number
  estimatedExhaustionDate: string | null
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
  const campaignSpend = sum(perfs, (p) => p.campaignSpend)
  const attributedTransactionValue = sum(perfs, (p) => p.attributedTransactionValue)
  const estimatedRevenue = sum(perfs, (p) => p.estimatedRevenue)
  const burnRatePerDay = sum(perfs, (p) => p.burnRatePerDay)
  const remainingBudget = budget - cashbackIssued

  const activeWithBurn = perfs.filter((x) => x.c.status === "active" && x.p.burnRatePerDay > 0)
  const estimatedExhaustionDate =
    activeWithBurn.length > 0 && burnRatePerDay > 0 ? new Date(NOW.getTime() + (remainingBudget / burnRatePerDay) * 86_400_000).toISOString() : null

  return {
    campaignsStarted: perfs.length,
    budget,
    utilizationPct: budget > 0 ? (cashbackIssued / budget) * 100 : 0,
    cashbackIssued,
    remainingBudget,
    avgTransactionValue: transactions > 0 ? Math.round(transactionValue / transactions) : 0,
    avgCashbackPerTransaction: transactions > 0 ? cashbackIssued / transactions : 0,
    transactions,
    transactionValue,
    burnRatePerDay,
    estimatedExhaustionDate,
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
    campaignSpend,
    attributedTransactionValue,
    estimatedRevenue,
    roas: campaignSpend > 0 ? attributedTransactionValue / campaignSpend : 0,
    roiPct: campaignSpend > 0 ? ((attributedTransactionValue - campaignSpend) / campaignSpend) * 100 : 0,
    costPerTransaction: transactions > 0 ? campaignSpend / transactions : 0,
    cashbackCostPerAed: transactionValue > 0 ? campaignSpend / transactionValue : 0,
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
  }
}

// --- charting helper --------------------------------------------------------

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
