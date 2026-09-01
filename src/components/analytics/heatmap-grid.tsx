import { Fragment } from "react"
import { formatCompactAed } from "@/lib/utils"
import type { HeatCell } from "@/lib/mock-performance"

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_DAY: Record<string, string> = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" }

/** A day × time-of-day heatmap — darker cells mean more GMV. Modeled from each day's real total spread across a typical retail traffic curve. */
export function HeatmapGrid({ cells }: { cells: HeatCell[] }) {
  const blocks = [...new Set(cells.map((c) => c.block))]
  const max = Math.max(1, ...cells.map((c) => c.value))

  const byDay = new Map<string, Map<string, number>>()
  for (const cell of cells) {
    if (!byDay.has(cell.day)) byDay.set(cell.day, new Map())
    byDay.get(cell.day)!.set(cell.block, cell.value)
  }

  let peak = cells[0]
  for (const c of cells) if (c.value > (peak?.value ?? -1)) peak = c

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid gap-1" style={{ gridTemplateColumns: `56px repeat(${blocks.length}, minmax(0,1fr))` }}>
            <div />
            {blocks.map((b) => (
              <div key={b} className="pb-1.5 text-center text-[10px] font-medium text-muted-foreground">
                {b}
              </div>
            ))}
            {DAY_ORDER.map((day) => (
              <Fragment key={day}>
                <div className="flex items-center text-xs font-medium text-muted-foreground">{SHORT_DAY[day]}</div>
                {blocks.map((block) => {
                  const value = byDay.get(day)?.get(block) ?? 0
                  const intensity = value / max
                  const isPeak = peak && peak.day === day && peak.block === block
                  return (
                    <div
                      key={`${day}-${block}`}
                      title={`${day}, ${block}: ${formatCompactAed(value)}`}
                      className="relative flex aspect-[4/3] items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-medium"
                      style={{ backgroundColor: `hsl(160 62% 22% / ${0.08 + intensity * 0.85})`, color: intensity > 0.55 ? "white" : "hsl(220 20% 30%)" }}
                    >
                      {isPeak && <span className="absolute inset-0 rounded-[var(--radius-sm)] ring-2 ring-warning" />}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {peak && (
        <p className="mt-4 text-xs text-muted-foreground">
          Peak window: <span className="font-medium text-foreground">{SHORT_DAY[peak.day]}, {peak.block}</span> generates the highest modeled GMV of the week.
        </p>
      )}
    </div>
  )
}
