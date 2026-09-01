import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { MidStat } from "@/lib/transaction-stats"

/** Qualification rate vs. transaction volume per Merchant ID — spots high-volume, low-qualification MIDs worth investigating. */
export function MidQualificationScatter({ mids }: { mids: MidStat[] }) {
  const avgQualification = mids.length > 0 ? mids.reduce((s, m) => s + m.qualificationRate, 0) / mids.length : 0
  const data = mids.map((m) => ({ ...m, isLow: m.qualificationRate < avgQualification - 5 }))
  const minRate = mids.length > 0 ? Math.min(...mids.map((m) => m.qualificationRate)) : 50
  const yFloor = Math.max(0, Math.floor((minRate - 10) / 10) * 10)

  return (
    <div className="h-[200px] w-full max-w-[560px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="hsl(220 16% 93%)" />
          <XAxis
            type="number"
            dataKey="transactions"
            name="Transactions"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
            tickFormatter={formatNumber}
            label={{ value: "Transaction volume", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(220 9% 46%)" }}
          />
          <YAxis
            type="number"
            dataKey="qualificationRate"
            name="Qualification rate"
            domain={[yFloor, 100]}
            tickLine={false}
            axisLine={false}
            tickCount={4}
            tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
            tickFormatter={(v) => `${v}%`}
            width={38}
          />
          <ZAxis dataKey="gmv" range={[80, 320]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number, name: string) => (name === "Qualification rate" ? [formatPercent(value, 0), name] : [formatNumber(value), name])}
            labelFormatter={() => ""}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as MidStat
              return (
                <div className="rounded-[10px] border border-border bg-card px-3 py-2 text-xs shadow-card">
                  <p className="font-semibold text-foreground">{d.mid}</p>
                  <p className="mt-1 text-muted-foreground">{formatNumber(d.transactions)} transactions · {formatPercent(d.qualificationRate, 0)} qualified</p>
                </div>
              )
            }}
          />
          <Scatter data={data}>
            {data.map((d) => (
              <Cell key={d.mid} fill={d.isLow ? "hsl(0 72% 51%)" : "hsl(160 62% 22%)"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
