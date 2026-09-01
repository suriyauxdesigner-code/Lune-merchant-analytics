import { TrendingUp, AlertTriangle, Sparkles } from "lucide-react"
import type { Insight, InsightTone } from "@/lib/insights"
import { cn } from "@/lib/utils"

const TONE_STYLE: Record<InsightTone, string> = {
  positive: "bg-success-bg text-success-foreground",
  warning: "bg-warning-bg text-warning-foreground",
  neutral: "bg-info-bg text-info-foreground",
}

const TONE_ICON: Record<InsightTone, typeof TrendingUp> = {
  positive: TrendingUp,
  warning: AlertTriangle,
  neutral: Sparkles,
}

/** 3-4 concise, data-driven takeaways with a recommended action — the "so what do I do" summary of the page. */
export function KeyInsights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight) => {
        const Icon = TONE_ICON[insight.tone]
        return (
          <div key={insight.id} className="flex gap-3 rounded-[var(--radius)] border border-border bg-card p-4">
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", TONE_STYLE[insight.tone])}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{insight.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
