export type PairedMetricRow = { label: string; a: number; b: number; format: (v: number) => string }
export type PairedSeries = { label: string; color: string }

/** A compact list of paired horizontal bars — for comparing two series (channels, segments) across several metrics without a separate chart per metric. */
export function PairedMetricBars({ metrics, seriesA, seriesB }: { metrics: PairedMetricRow[]; seriesA: PairedSeries; seriesB: PairedSeries }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        {[seriesA, seriesB].map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="space-y-4">
        {metrics.map((m) => {
          const max = Math.max(m.a, m.b, 1)
          return (
            <div key={m.label}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{m.label}</p>
              <div className="space-y-1">
                <BarRow value={m.a} max={max} color={seriesA.color} label={m.format(m.a)} />
                <BarRow value={m.b} max={max} color={seriesB.color} label={m.format(m.b)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BarRow({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max(3, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-28 shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">{label}</span>
    </div>
  )
}
