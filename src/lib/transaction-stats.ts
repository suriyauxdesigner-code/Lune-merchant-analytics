import type { TransactionRow } from "./mock-performance"
import type { Campaign } from "./types"

// ---------------------------------------------------------------------------
// Derived statistics computed directly from generated transaction rows — real
// aggregation of already-generated numbers, not a new fabricated concept.
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

/** Buckets transaction amounts into 5 evenly-spaced ranges for a distribution view. */
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

export type LocationStat = { location: string; transactions: number; gmv: number; aov: number; customers: number }

/**
 * GMV/transactions/AOV per terminal, derived directly from transaction rows. "Customers" is
 * estimated by applying the same transactions-to-unique-customers ratio used at the campaign
 * level (Pulse doesn't yet track a per-transaction customer identity).
 */
export function computeLocationStats(rows: TransactionRow[], customerRatio: number): LocationStat[] {
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
      transactions: v.transactions,
      gmv: v.gmv,
      aov: v.transactions > 0 ? Math.round(v.gmv / v.transactions) : 0,
      customers: Math.round(v.transactions * customerRatio),
    }))
    .sort((a, b) => b.gmv - a.gmv)
}

export type OfferEconomics = {
  avgCashbackPerTransaction: number
  aov: number
  pctNearMinSpend: number
  pctAtCap: number
}

/** Reads the offer configuration against real transaction behavior: are customers clustering near the minimum spend, or maxing out the cashback cap? */
export function computeOfferEconomics(rows: TransactionRow[], campaign: Campaign): OfferEconomics {
  if (rows.length === 0) return { avgCashbackPerTransaction: 0, aov: 0, pctNearMinSpend: 0, pctAtCap: 0 }

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0)
  const totalCashback = rows.reduce((s, r) => s + r.cashback, 0)

  const minSpend = campaign.minimumSpend ?? 0
  const nearMinCount = minSpend > 0 ? rows.filter((r) => r.amount <= minSpend * 1.15).length : 0
  const atCapCount = rows.filter((r) => r.cashback >= campaign.cashbackCap * 0.95).length

  return {
    avgCashbackPerTransaction: totalCashback / rows.length,
    aov: totalAmount / rows.length,
    pctNearMinSpend: minSpend > 0 ? (nearMinCount / rows.length) * 100 : 0,
    pctAtCap: (atCapCount / rows.length) * 100,
  }
}
