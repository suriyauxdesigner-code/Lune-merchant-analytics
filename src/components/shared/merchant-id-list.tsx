import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { cn } from "@/lib/utils"
import type { MerchantId } from "@/lib/types"

/** Merchant IDs for a brand, each expandable to its terminals — shared by Brand Detail and Campaign Detail. */
export function MerchantIdList({ merchantIds }: { merchantIds: MerchantId[] }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 text-xs font-medium text-muted-foreground">
        <span>Merchant ID</span>
        <span>Acquirer</span>
      </div>
      <div className="divide-y divide-border">
        {merchantIds.map((mid) => {
          const isExpanded = expanded.has(mid.id)
          return (
            <div key={mid.id}>
              <button onClick={() => toggle(mid.id)} className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40">
                <span className="font-medium text-foreground">{mid.merchantId}</span>
                <span className="flex items-center gap-3 text-sm text-muted-foreground">
                  {mid.acquirer}
                  <ChevronDown className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
                </span>
              </button>
              {isExpanded && (
                <div className="bg-muted/20 px-5 pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Terminal ID</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Terminal name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mid.terminals.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium text-foreground">{t.terminalId}</TableCell>
                          <TableCell>
                            <ChannelBadge channel={t.channel} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">{t.terminalName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
