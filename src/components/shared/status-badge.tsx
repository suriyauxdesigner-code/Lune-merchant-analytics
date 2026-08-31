import { Badge } from "@/components/ui/badge"
import type { CampaignStatus } from "@/lib/types"
import { STATUS_LABEL } from "@/lib/analytics-utils"

const STATUS_VARIANT: Record<CampaignStatus, "success" | "warning" | "info" | "neutral" | "destructive"> = {
  active: "success",
  pending_approval: "warning",
  scheduled: "info",
  completed: "neutral",
  rejected: "destructive",
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
