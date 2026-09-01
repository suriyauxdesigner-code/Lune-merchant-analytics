import { CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts"
import { formatNumber, formatPercent } from "@/lib/utils"
import type { MidStat } from "@/lib/transaction-stats"

const BELOW_AVG_COLOR = "hsl(0 72% 51%)"
const AT_ABOVE_AVG_COLOR = "hsl(160 62% 22%)"

/**
 * Every dot is one Merchant ID. Further right = more transactions; higher up = a better
 * qualification rate. Dots below the dashed average line are worth a closer look — high volume
 * with a below-average qualification rate is where cashback is most often being left on the table.
 */
export function MidQualificationScatter({ mids }: { mids: MidStat[] }) {
  const avgQualification = mids.length > 0 ? mids.reduce((s, m) => s + m.qualificationRate, 0) / mids.length : 0
  const data = mids.map((m) => ({ ...m, isLow: m.qualificationRate < avgQualification - 5 }))
  const minRate = mids.length > 0 ? Math.min(...mids.map((m) => m.qualificationRate)) : 50
  const yFloor = Math.max(0, Math.floor((minRate - 10) / 10) * 10)

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: AT_ABOVE_AVG_COLOR }} />
          At/above average
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: BELOW_AVG_COLOR }} />
          Below average
        </span>
      </div>
      <div className="h-[220px] w-full max-w-[560px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 16, left: 0, bottom: 8 }}>
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
            <ReferenceLine y={avgQualification} stroke="hsl(220 9% 65%)" strokeDasharray="4 4" label={{ value: "Avg", position: "insideTopRight", fontSize: 10, fill: "hsl(220 9% 46%)" }} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as MidStat
                return (
                  <div className="rounded-[10px] border border-border bg-card px-3 py-2 text-xs shadow-card">
                    <p className="font-semibold text-foreground">{d.mid}</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatNumber(d.transactions)} transactions · {formatPercent(d.qualificationRate, 0)} qualified
                    </p>
                  </div>
                )
              }}
            />
            <Scatter data={data}>
              <LabelList dataKey="mid" position="top" style={{ fontSize: 10, fill: "hsl(220 20% 30%)", fontWeight: 600 }} />
              {data.map((d) => (
                <Cell key={d.mid} fill={d.isLow ? BELOW_AVG_COLOR : AT_ABOVE_AVG_COLOR} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
