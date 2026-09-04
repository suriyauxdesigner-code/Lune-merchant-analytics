import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

export type DonutSegment = { label: string; value: number; color: string }

/** A donut chart with a legend and an optional big center label — for composition ("how is X split") questions. */
export function DonutChart({
  segments,
  formatValue,
  centerLabel,
  centerValue,
  size = 180,
}: {
  segments: DonutSegment[]
  formatValue: (v: number) => string
  centerLabel?: string
  centerValue?: string
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="value" nameKey="label" innerRadius={size * 0.32} outerRadius={size * 0.5} paddingAngle={segments.length > 1 ? 2 : 0} stroke="none">
              {segments.map((seg) => (
                <Cell key={seg.label} fill={seg.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${formatValue(value)} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, name]}
              contentStyle={{ borderRadius: 10, border: "1px solid hsl(220 16% 91%)", boxShadow: "0 12px 24px -8px rgb(15 23 42 / 0.10)", fontSize: 12, fontFamily: "inherit" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <p className="text-lg font-bold text-foreground">{centerValue}</p>}
            {centerLabel && <p className="text-[11px] text-muted-foreground">{centerLabel}</p>}
          </div>
        )}
      </div>

      <div className="w-full min-w-0 space-y-2.5">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0
          return (
            <div key={seg.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className={cn("size-2.5 shrink-0 rounded-full")} style={{ backgroundColor: seg.color }} />
                <span className="truncate text-foreground">{seg.label}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap">
                <span className="font-semibold tabular-nums text-foreground">{formatValue(seg.value)}</span>
                <span className="ml-1 text-muted-foreground">· {Math.round(pct)}%</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
