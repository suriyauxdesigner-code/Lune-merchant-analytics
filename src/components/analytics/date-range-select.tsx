import * as React from "react"
import { Calendar, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DATE_RANGE_OPTIONS, type DateRange, type DateRangeKey } from "@/lib/analytics-utils"

export function DateRangeSelect({
  value,
  customRange,
  onChange,
}: {
  value: DateRangeKey
  customRange?: DateRange
  onChange: (key: DateRangeKey, custom?: DateRange) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [from, setFrom] = React.useState(customRange ? isoDate(customRange.from) : "")
  const [to, setTo] = React.useState(customRange ? isoDate(customRange.to) : "")

  const label = DATE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? "Select range"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-1">
          {DATE_RANGE_OPTIONS.filter((o) => o.value !== "custom").map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm hover:bg-muted",
                value === opt.value && "font-medium text-primary"
              )}
            >
              {opt.label}
              {value === opt.value && <Check className="size-4" />}
            </button>
          ))}
        </div>
        <div className="mt-2 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Custom range</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="date-from" className="mb-1 block text-xs text-muted-foreground">From</label>
              <Input id="date-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 px-2.5 text-xs" />
            </div>
            <div>
              <label htmlFor="date-to" className="mb-1 block text-xs text-muted-foreground">To</label>
              <Input id="date-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 px-2.5 text-xs" />
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3 w-full"
            disabled={!from || !to}
            onClick={() => {
              if (!from || !to) return
              onChange("custom", { from: new Date(from), to: new Date(to) })
              setOpen(false)
            }}
          >
            Apply custom range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}
