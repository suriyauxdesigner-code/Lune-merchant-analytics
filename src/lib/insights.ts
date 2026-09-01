import { formatPercent, formatRatio } from "./utils"
import { getPacingStatus } from "./analytics-utils"
import type { QualificationBucket } from "./mock-performance"

export type InsightTone = "positive" | "warning" | "neutral"
export type Insight = { id: string; tone: InsightTone; title: string; description: string }

/**
 * A small rules engine turning the dashboard's own numbers into 3-4 concise, data-driven
 * "so what" takeaways — deliberately not hardcoded copy. Every rule reads from data already
 * shown elsewhere on the page.
 */
export function generateInsights(input: {
  gmvDeltaPct: number | null
  utilizationPct: number
  estimatedExhaustionDate: string | null
  roi: number
  qualification: QualificationBucket[]
}): Insight[] {
  const insights: Insight[] = []

  if (input.gmvDeltaPct != null) {
    const up = input.gmvDeltaPct >= 0
    insights.push({
      id: "gmv-trend",
      tone: up ? "positive" : "warning",
      title: `GMV ${up ? "up" : "down"} ${formatPercent(Math.abs(input.gmvDeltaPct))} vs. the prior period`,
      description: up
        ? "Cashback campaigns are generating more business than the equivalent period before — see Top Campaigns for what's driving it."
        : "Business generated through cashback slowed vs. the prior period — check Campaign Performance for which campaigns pulled back.",
    })
  }

  const pacingStatus = getPacingStatus(input.utilizationPct, input.estimatedExhaustionDate)
  if (pacingStatus === "spending_fast") {
    insights.push({
      id: "pacing",
      tone: "warning",
      title: "Budget is spending fast",
      description: "At the current burn rate, active campaign budgets will run out soon — top them up if they should keep running through their full window.",
    })
  } else if (pacingStatus === "underutilized") {
    insights.push({
      id: "pacing",
      tone: "warning",
      title: `Only ${formatPercent(input.utilizationPct)} of budget used`,
      description: "Spend is slow relative to what's allocated — consider boosting campaign visibility or promotion to capture more of the budget set aside.",
    })
  } else {
    insights.push({
      id: "pacing",
      tone: "positive",
      title: "Budget is pacing on track",
      description: "Spend is on a healthy trajectory to use the allocated budget without running out early.",
    })
  }

  if (input.roi > 0) {
    const strong = input.roi >= 5
    insights.push({
      id: "roi",
      tone: strong ? "positive" : "warning",
      title: strong ? `Strong return on cashback at ${formatRatio(input.roi)}` : `Return on cashback is thin at ${formatRatio(input.roi)}`,
      description: strong
        ? "Every AED spent in cashback is generating well above its cost in GMV — a healthy multiplier for the program."
        : "Consider tightening the minimum spend or cashback cap on lower-performing campaigns to improve the ratio.",
    })
  }

  const disqualifiedTotal = input.qualification.reduce((s, b) => s + b.count, 0)
  if (disqualifiedTotal > 0) {
    const top = [...input.qualification].sort((a, b) => b.count - a.count)[0]
    const share = top.count / disqualifiedTotal
    insights.push({
      id: "qualification",
      tone: "warning",
      title: `"${top.reason}" is the top disqualification reason`,
      description: `It accounts for ${formatPercent(share * 100, 0)} of disqualified attempts — addressing it could recover the most missed cashback opportunities.`,
    })
  }

  return insights.slice(0, 4)
}
