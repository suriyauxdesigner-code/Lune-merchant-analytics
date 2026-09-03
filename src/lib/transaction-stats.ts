import { seeded, type TransactionRow } from "./mock-performance"
import { merchantIdsForBrand, terminalsForBrand } from "./data"
import type { Campaign } from "./types"

// ---------------------------------------------------------------------------
// Derived statistics computed directly from generated transaction rows — real
// aggregation of already-generated numbers, not a new fabricated concept.
// Qualification rates are the one exception: Pulse only records successful
// (qualifying) transactions today, so per-MID/terminal qualification is a
// deterministic seeded estimate, clearly labeled wherever it's shown.
// ---------------------------------------------------------------------------

export type AmountStats = { avg: number; median: number; max: number; min: number }

export function computeAmountStats(rows: TransactionRow[]): AmountStats {
  if (rows.length === 0) return { avg: 0, median: 0, max: 0, min: 0 }
  const amounts = rows.map((r) => r.amount).sort((a, b) => a - b)
  const mid = Math.floor(amounts.length / 2)
  const median = amounts.length % 2 === 0 ? (amounts[mid - 1] + amounts[mid]) / 2 : amounts[mid]
  const sum = amounts.reduce((s, a) => s + a, 0)
  return { avg: sum / amounts.length, median, max: amounts[amounts.length - 1], min: amounts[0] }
}

export type AmountBucket = { label: string; count: number }

/** Buckets transaction amounts into evenly-spaced ranges for a distribution view. */
export function computeAmountDistribution(rows: TransactionRow[], bucketCount = 5): AmountBucket[] {
  if (rows.length === 0) return []
  const amounts = rows.map((r) => r.amount)
  const max = Math.max(...amounts)
  const min = Math.min(...amounts)
  const span = Math.max(1, max - min)
  const step = Math.ceil(span / bucketCount / 10) * 10 || 1
  const buckets: AmountBucket[] = []
  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * step
    const hi = i === bucketCount - 1 ? max : lo + step - 1
    buckets.push({ label: `AED ${lo.toLocaleString()}–${hi.toLocaleString()}`, count: 0 })
  }
  for (const a of amounts) {
    const idx = Math.min(bucketCount - 1, Math.floor((a - min) / step))
    buckets[idx].count++
  }
  return buckets
}

export type LocationStat = { location: string; terminalId: string | null; transactions: number; gmv: number; aov: number; customers: number }

/**
 * GMV/transactions/AOV per terminal, derived directly from transaction rows. "Customers" is
 * estimated by applying the same transactions-to-unique-customers ratio used at the campaign
 * level (Pulse doesn't yet track a per-transaction customer identity). `terminalId` disambiguates
 * the display name (e.g. "Mall of the Emirates") from the actual registered POS terminal.
 */
export function computeLocationStats(rows: TransactionRow[], customerRatio: number, brandId: string): LocationStat[] {
  const terminalIdByName = new Map(terminalsForBrand(brandId).map((t) => [t.terminalName, t.terminalId]))
  const byLocation = new Map<string, { transactions: number; gmv: number }>()
  for (const row of rows) {
    const existing = byLocation.get(row.terminalName)
    if (existing) {
      existing.transactions += 1
      existing.gmv += row.amount
    } else {
      byLocation.set(row.terminalName, { transactions: 1, gmv: row.amount })
    }
  }
  return [...byLocation.entries()]
    .map(([location, v]) => ({
      location,
      terminalId: terminalIdByName.get(location) ?? null,
      transactions: v.transactions,
      gmv: v.gmv,
      aov: v.transactions > 0 ? Math.round(v.gmv / v.transactions) : 0,
      customers: Math.round(v.transactions * customerRatio),
    }))
    .sort((a, b) => b.gmv - a.gmv)
}

export type TerminalStat = { terminalName: string; terminalId: string | null; mid: string | null; transactions: number; gmv: number; cashback: number; qualificationRate: number }

/** Per-location breakdown (keyed by the registered terminal) including a modeled qualification rate — used to spot operational issues (high volume, low qualification). */
export function computeTerminalStats(rows: TransactionRow[], brandId: string): TerminalStat[] {
  const terminalIdByName = new Map(terminalsForBrand(brandId).map((t) => [t.terminalName, t.terminalId]))
  const byTerminal = new Map<string, { mid: string | null; transactions: number; gmv: number; cashback: number }>()
  for (const row of rows) {
    const existing = byTerminal.get(row.terminalName)
    if (existing) {
      existing.transactions += 1
      existing.gmv += row.amount
      existing.cashback += row.cashback
    } else {
      byTerminal.set(row.terminalName, { mid: row.mid, transactions: 1, gmv: row.amount, cashback: row.cashback })
    }
  }
  return [...byTerminal.entries()]
    .map(([terminalName, v]) => ({
      terminalName,
      terminalId: terminalIdByName.get(terminalName) ?? null,
      mid: v.mid,
      transactions: v.transactions,
      gmv: v.gmv,
      cashback: v.cashback,
      qualificationRate: seeded(terminalName, 64, 60, 98),
    }))
    .sort((a, b) => b.gmv - a.gmv)
}

export type MidStat = {
  mid: string
  acquirer: string
  channel: string
  /** Human-readable terminal/store names registered under this Merchant ID — e.g. ["Mall of the Emirates", "faces.ae checkout"]. */
  locations: string[]
  transactions: number
  gmv: number
  aov: number
  roi: number
  qualificationRate: number
}

/** GMV/transactions/AOV/ROI per Merchant ID, derived from transaction rows, plus a modeled qualification rate. */
export function computeMidStats(rows: TransactionRow[], brandId: string): MidStat[] {
  const byMid = new Map<string, { transactions: number; gmv: number; cashback: number; channels: Set<string> }>()
  for (const row of rows) {
    if (!row.mid) continue
    const existing = byMid.get(row.mid)
    if (existing) {
      existing.transactions += 1
      existing.gmv += row.amount
      existing.cashback += row.cashback
      existing.channels.add(row.channel)
    } else {
      byMid.set(row.mid, { transactions: 1, gmv: row.amount, cashback: row.cashback, channels: new Set([row.channel]) })
    }
  }
  const merchantIds = merchantIdsForBrand(brandId)
  const acquirerByMid = new Map(merchantIds.map((m) => [m.merchantId, m.acquirer]))
  const locationsByMid = new Map(merchantIds.map((m) => [m.merchantId, m.terminals.map((t) => t.terminalName)]))

  return [...byMid.entries()]
    .map(([mid, v]) => ({
      mid,
      acquirer: acquirerByMid.get(mid) ?? "—",
      channel: [...v.channels].map((c) => (c === "online" ? "Online" : "In-Store")).join(" & "),
      locations: locationsByMid.get(mid) ?? [],
      transactions: v.transactions,
      gmv: v.gmv,
      aov: v.transactions > 0 ? Math.round(v.gmv / v.transactions) : 0,
      roi: v.cashback > 0 ? v.gmv / v.cashback : 0,
      qualificationRate: seeded(mid, 63, 62, 97),
    }))
    .sort((a, b) => b.gmv - a.gmv)
}

export type ChannelBehaviorStat = { channel: "online" | "in_store"; gmv: number; transactions: number; cashback: number; roi: number; customers: number; aov: number; repeatRate: number }

/** GMV, unique customers, AOV, ROI and repeat rate per channel — derived from real transaction rows, not the config-based channel split used elsewhere. */
export function computeChannelBehavior(rows: TransactionRow[]): ChannelBehaviorStat[] {
  const byChannel: Record<"online" | "in_store", { gmv: number; transactions: number; cashback: number; customerCounts: Map<string, number> }> = {
    online: { gmv: 0, transactions: 0, cashback: 0, customerCounts: new Map() },
    in_store: { gmv: 0, transactions: 0, cashback: 0, customerCounts: new Map() },
  }
  for (const row of rows) {
    const bucket = byChannel[row.channel]
    bucket.gmv += row.amount
    bucket.cashback += row.cashback
    bucket.transactions += 1
    bucket.customerCounts.set(row.customerId, (bucket.customerCounts.get(row.customerId) ?? 0) + 1)
  }
  return (["online", "in_store"] as const).map((channel) => {
    const b = byChannel[channel]
    const customers = b.customerCounts.size
    const repeatCustomers = [...b.customerCounts.values()].filter((c) => c > 1).length
    return {
      channel,
      gmv: b.gmv,
      transactions: b.transactions,
      cashback: b.cashback,
      roi: b.cashback > 0 ? b.gmv / b.cashback : 0,
      customers,
      aov: b.transactions > 0 ? Math.round(b.gmv / b.transactions) : 0,
      repeatRate: customers > 0 ? (repeatCustomers / customers) * 100 : 0,
    }
  })
}

export type OfferEconomics = {
  avgCashbackPerTransaction: number
  medianCashbackPerTransaction: number
  aov: number
  pctNearMinSpend: number
  pctAtCap: number
}

/** Reads the offer configuration against real transaction behavior: are customers clustering near the minimum spend, or maxing out the cashback cap? */
export function computeOfferEconomics(rows: TransactionRow[], campaign: Campaign): OfferEconomics {
  if (rows.length === 0) return { avgCashbackPerTransaction: 0, medianCashbackPerTransaction: 0, aov: 0, pctNearMinSpend: 0, pctAtCap: 0 }

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0)
  const totalCashback = rows.reduce((s, r) => s + r.cashback, 0)
  const sortedCashback = [...rows].map((r) => r.cashback).sort((a, b) => a - b)
  const mid = Math.floor(sortedCashback.length / 2)
  const medianCashback = sortedCashback.length % 2 === 0 ? (sortedCashback[mid - 1] + sortedCashback[mid]) / 2 : sortedCashback[mid]

  const minSpend = campaign.minimumSpend ?? 0
  const nearMinCount = minSpend > 0 ? rows.filter((r) => r.amount <= minSpend * 1.15).length : 0
  const atCapCount = rows.filter((r) => r.cashback >= campaign.cashbackCap * 0.95).length

  return {
    avgCashbackPerTransaction: totalCashback / rows.length,
    medianCashbackPerTransaction: medianCashback,
    aov: totalAmount / rows.length,
    pctNearMinSpend: minSpend > 0 ? (nearMinCount / rows.length) * 100 : 0,
    pctAtCap: (atCapCount / rows.length) * 100,
  }
}
