import type { CampaignStatus } from "@/lib/types"
import { STATUS_LABEL } from "@/lib/analytics-utils"

const STATUS_ORDER: CampaignStatus[] = ["active", "pending_approval", "scheduled", "completed", "rejected"]
const STATUS_COLOR: Record<CampaignStatus, string> = {
  active: "hsl(152 55% 34%)",
  pending_approval: "hsl(38 92% 42%)",
  scheduled: "hsl(217 91% 45%)",
  completed: "hsl(220 9% 55%)",
  rejected: "hsl(0 72% 51%)",
}

export function StatusDistribution({ counts }: { counts: Record<CampaignStatus, number> }) {
  const total = STATUS_ORDER.reduce((sum, s) => sum + counts[s], 0) || 1

  return (
    <div className="space-y-3.5">
      {STATUS_ORDER.map((status) => {
        const count = counts[status]
        const pct = Math.round((count / total) * 100)
        return (
          <div key={status}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
                {STATUS_LABEL[status]}
              </span>
              <span className="text-muted-foreground">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: STATUS_COLOR[status] }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
