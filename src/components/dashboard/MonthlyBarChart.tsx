import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ProjectionResult } from '../../utils/projectionEngine'
import { formatBRL } from '../../utils/formatters'
import { COLORS } from '../../constants/colors'
import type {
  ValueType,
  NameType,
  Formatter,
} from 'recharts/types/component/DefaultTooltipContent'

const tooltipFormatter: Formatter<ValueType, NameType> = (
  value,
) => {
  const formatted =
    typeof value === 'number'
      ? formatBRL(value)
      : String(value ?? '')

  return [formatted, 'Faturado']
}

interface Props { projection: ProjectionResult }

export function MonthlyBarChart({ projection }: Props) {
  const currentMonth = new Date().getMonth() + 1
  const data = projection.monthlyData
    .filter(m => m.actual !== null)
    .map(m => ({ name: m.label, value: m.actual ?? 0, month: m.month }))

  if (data.length === 0) return null

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <p className="card-title">Faturamento mês a mês</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: COLORS.gray2, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
            formatter={tooltipFormatter}
            labelStyle={{ color: COLORS.gray1 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.month}
                fill={entry.month === currentMonth ? COLORS.blue : COLORS.surface2}
                stroke={entry.month === currentMonth ? COLORS.blue : COLORS.border}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}