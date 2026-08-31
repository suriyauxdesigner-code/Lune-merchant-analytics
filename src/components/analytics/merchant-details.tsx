import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { cn } from "@/lib/utils"
import type { MerchantId } from "@/lib/types"

export function MerchantDetails({ merchantIds }: { merchantIds: MerchantId[] }) {
  const [openId, setOpenId] = React.useState<string | null>(merchantIds[0]?.id ?? null)

  return (
    <div className="space-y-3">
      {merchantIds.map((mid) => {
        const isOpen = openId === mid.id
        return (
          <div key={mid.id} className="overflow-hidden rounded-[var(--radius)] border border-border">
            <button
              onClick={() => setOpenId(isOpen ? null : mid.id)}
              className="flex w-full items-center justify-between gap-4 bg-card px-4 py-3.5 text-left hover:bg-muted/40"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Merchant ID</p>
                  <p className="text-sm font-semibold text-foreground">{mid.merchantId}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Acquirer</p>
                  <p className="text-sm text-foreground">{mid.acquirer}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Channel</p>
                  <ChannelBadge channel={mid.channel} />
                </div>
              </div>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="border-t border-border bg-muted/30">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Terminal ID</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Terminal name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mid.terminals.map((t) => (
                      <TableRow key={t.id} className="hover:bg-transparent">
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
  )
}
