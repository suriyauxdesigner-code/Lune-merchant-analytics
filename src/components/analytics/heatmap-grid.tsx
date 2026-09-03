import { Fragment } from "react"
import { formatCompactAed } from "@/lib/utils"
import type { HeatCell } from "@/lib/mock-performance"

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_DAY: Record<string, string> = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" }

const LABEL_W = 40
const CELL_MIN_W = 48
const CELL_H = 36

/** A day × time-of-day heatmap — darker cells mean more GMV. Modeled from each day's real total spread across a typical retail traffic curve. Cells grow to fill the full available card width (only floored by a minimum, never capped) so the grid never leaves a dead strip of blank card on wide screens. */
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
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `${LABEL_W}px repeat(${blocks.length}, minmax(${CELL_MIN_W}px, 1fr))`, minWidth: LABEL_W + blocks.length * CELL_MIN_W }}
        >
          <div />
          {blocks.map((b) => (
            <div key={b} className="pb-1 text-center text-[10px] font-medium leading-tight text-muted-foreground">
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
                    className="relative rounded-[4px]"
                    style={{ height: CELL_H, backgroundColor: `hsl(160 62% 22% / ${0.08 + intensity * 0.85})` }}
                  >
                    {isPeak && <span className="absolute inset-0 rounded-[4px] ring-2 ring-warning" />}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
      {peak && (
        <div className="mt-4 border-t border-border/70 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Peak window</p>
          <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            {SHORT_DAY[peak.day]}, {peak.block}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Highest GMV of the week</p>
        </div>
      )}
    </div>
  )
}
