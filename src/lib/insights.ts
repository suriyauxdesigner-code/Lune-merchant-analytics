import { formatCompactAed, formatPercent, formatRatio } from "./utils"
import { getPacingStatus } from "./analytics-utils"
import type { QualificationBucket, WeekdayPoint } from "./mock-performance"

export type InsightTone = "positive" | "warning" | "neutral"
export type Insight = { id: string; tone: InsightTone; title: string; description: string }

function topQualificationReason(buckets: QualificationBucket[]): { reason: string; sharePct: number } | null {
  const total = buckets.reduce((s, b) => s + b.count, 0)
  if (total === 0) return null
  const top = [...buckets].sort((a, b) => b.count - a.count)[0]
  return { reason: top.reason, sharePct: (top.count / total) * 100 }
}

// ---------------------------------------------------------------------------
// Campaign Insights — Campaign Analytics. "What should I change about this campaign?"
// ---------------------------------------------------------------------------

export function generateCampaignInsights(input: {
  transactionValue: number
  cashbackIssued: number
  channelMix: { onlinePct: number; inStorePct: number } | null
  qualification: QualificationBucket[]
  utilizationPct: number
  estimatedExhaustionDate: string | null
  weekday: WeekdayPoint[]
  topMid: { mid: string; gmvSharePct: number } | null
  topAgeSegment: { ageBand: string; gmvSharePct: number } | null
}): Insight[] {
  const insights: Insight[] = []

  if (input.cashbackIssued > 0) {
    insights.push({
      id: "recap",
      tone: "positive",
      title: `${formatCompactAed(input.transactionValue)} GMV from ${formatCompactAed(input.cashbackIssued)} cashback`,
      description: `That's a return of ${formatRatio(input.cashbackIssued > 0 ? input.transactionValue / input.cashbackIssued : 0)} on every AED spent.`,
    })
  }

  const pacingStatus = getPacingStatus(input.utilizationPct, input.estimatedExhaustionDate)
  if (pacingStatus === "spending_fast" && input.estimatedExhaustionDate) {
    const days = Math.max(0, Math.round((new Date(input.estimatedExhaustionDate).getTime() - Date.now()) / 86_400_000))
    insights.push({
      id: "pacing",
      tone: "warning",
      title: `Budget is projected to exhaust in ~${days} day${days === 1 ? "" : "s"}`,
      description: "At the current burn rate, this campaign will run out of budget before a typical campaign window closes — consider a top-up.",
    })
  } else if (pacingStatus === "underutilized") {
    insights.push({
      id: "pacing",
      tone: "warning",
      title: `Only ${formatPercent(input.utilizationPct, 0)} of budget used so far`,
      description: "Spend is slow relative to what's allocated — consider boosting visibility for this offer.",
    })
  }

  const topReason = topQualificationReason(input.qualification)
  if (topReason && topReason.sharePct >= 25) {
    insights.push({
      id: "qualification",
      tone: "warning",
      title: `${formatPercent(topReason.sharePct, 0)} of rejected transactions failed "${topReason.reason}"`,
      description: "This is the single biggest reason attempted transactions don't qualify for cashback.",
    })
  }

  if (input.topMid && input.topMid.gmvSharePct >= 20) {
    insights.push({
      id: "top-mid",
      tone: "positive",
      title: `${input.topMid.mid} is the strongest-performing Merchant ID`,
      description: `It contributes ${formatPercent(input.topMid.gmvSharePct, 0)} of this campaign's GMV.`,
    })
  }

  if (input.channelMix) {
    const leader = input.channelMix.inStorePct >= input.channelMix.onlinePct ? "In-store" : "Online"
    const pct = Math.max(input.channelMix.inStorePct, input.channelMix.onlinePct)
    insights.push({
      id: "channel-mix",
      tone: "neutral",
      title: `${leader} contributes ${formatPercent(pct, 0)} of campaign GMV`,
      description: `The offer is performing best through the ${leader.toLowerCase()} channel — worth reflecting in how it's promoted.`,
    })
  }

  if (input.topAgeSegment && input.topAgeSegment.gmvSharePct >= 20) {
    insights.push({
      id: "top-segment",
      tone: "neutral",
      title: `${input.topAgeSegment.ageBand} is the highest-value customer segment`,
      description: `This age group contributes ${formatPercent(input.topAgeSegment.gmvSharePct, 0)} of campaign GMV — worth tailoring creative or offers toward it.`,
    })
  }

  const started = input.weekday.filter((d) => d.transactionValue > 0)
  if (started.length >= 3) {
    const best = [...started].sort((a, b) => b.transactionValue - a.transactionValue)[0]
    const worst = [...started].sort((a, b) => a.transactionValue - b.transactionValue)[0]
    if (worst.transactionValue > 0) {
      const multiple = best.transactionValue / worst.transactionValue
      if (multiple >= 1.4) {
        insights.push({
          id: "peak-day",
          tone: "neutral",
          title: `${best.day} is the strongest-performing day`,
          description: `${best.day} generated ${formatRatio(multiple)} more GMV than ${worst.day}, the weakest day.`,
        })
      }
    }
  }

  return insights.slice(0, 4)
}

/** A one-line trend caption shown under a chart — "GMV is up 12% vs. the prior period." */
export function trendCaption(metricLabel: string, deltaPct: number | null): string | null {
  if (deltaPct == null) return null
  const up = deltaPct >= 0
  return `${metricLabel} is ${up ? "up" : "down"} ${formatPercent(Math.abs(deltaPct), 0)} vs. the prior period of equal length.`
}

/** Used by Qualification widgets to surface one actionable line when a reason clearly dominates. */
export function qualificationActionInsight(buckets: QualificationBucket[]): string | null {
  const top = topQualificationReason(buckets)
  if (!top || top.sharePct < 30) return null
  const suggestion =
    top.reason === "Minimum spend not met"
      ? "consider lowering the minimum spend threshold"
      : top.reason === "Outside campaign period"
        ? "consider extending the campaign window"
        : top.reason === "Invalid merchant/terminal"
          ? "check that all terminals are correctly registered to this campaign"
          : "review the rules driving this reason"
  return `"${top.reason}" accounts for ${formatPercent(top.sharePct, 0)} of disqualified attempts — ${suggestion}.`
}
