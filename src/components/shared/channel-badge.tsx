import { Globe, Store, GitMerge } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Channel, TerminalChannel } from "@/lib/types"
import { CHANNEL_LABEL } from "@/lib/analytics-utils"

const CONFIG: Record<Channel, { icon: typeof Globe; variant: "success" | "warning" | "info" }> = {
  online: { icon: Globe, variant: "success" },
  in_store: { icon: Store, variant: "warning" },
  both: { icon: GitMerge, variant: "info" },
}

export function ChannelBadge({ channel }: { channel: Channel | TerminalChannel }) {
  const cfg = CONFIG[channel]
  const Icon = cfg.icon
  return (
    <Badge variant={cfg.variant} className="gap-1">
      <Icon className="size-3" />
      {CHANNEL_LABEL[channel]}
    </Badge>
  )
}
