import { cn } from "@/lib/utils"

export type RankedBarItem = {
  id: string
  label: string
  value: number
  sublabel?: string
  color?: string
}

/** A ranked horizontal bar list — for "who's winning" questions (brands, campaigns, Merchant IDs, locations) without reaching for a full table. */
export function RankedBarList({
  items,
  formatValue,
  onSelect,
  color = "hsl(160 62% 22%)",
}: {
  items: RankedBarItem[]
  formatValue: (v: number) => string
  onSelect?: (id: string) => void
  color?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <div className="space-y-3.5">
      {items.map((item, i) => {
        const widthPct = Math.max(3, Math.round((item.value / max) * 100))
        const Tag = onSelect ? "button" : "div"
        return (
          <Tag
            key={item.id}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
            className={cn("block w-full text-left", onSelect && "cursor-pointer")}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                <span className="text-xs text-muted-foreground">{i + 1}</span>
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-muted-foreground">
                {formatValue(item.value)}
                {item.sublabel && <span className="ml-1.5">· {item.sublabel}</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${widthPct}%`, backgroundColor: item.color ?? color }} />
            </div>
          </Tag>
        )
      })}
    </div>
  )
}
