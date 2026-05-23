import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import type { ProjectionResult } from '../../utils/projectionEngine'
import { formatBRL } from '../../utils/formatters'
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent'
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'
import { MEI } from '../../constants/mei'
import { COLORS } from '../../constants/colors'

interface Props { projection: ProjectionResult }

export function ProjectionChart({ projection }: Props) {
  const data = projection.monthlyData.map(m => ({
    name:      m.label,
    real:      m.cumulative > 0 ? m.cumulative : undefined,
    projetado: m.projectedCumulative,
  }))

const tooltipFormatter: Formatter<ValueType, NameType> = (
  value,
) => {
  const formatted =
    typeof value === 'number'
      ? formatBRL(value)
      : String(value ?? '')

  return [formatted, '']
}

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <p className="card-title">Projeção de faturamento {new Date().getFullYear()}</p>
      <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
        {projection.willExceed
          ? `⚠ Projeção indica ultrapassagem de ${formatBRL(projection.projectedExcess)} acima do limite`
          : `✓ Projeção para o ano: ${formatBRL(projection.projectedTotal)}`
        }
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.blue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gProj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.blueLight} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.blueLight} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fill: COLORS.gray2, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: COLORS.gray2, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
            formatter={tooltipFormatter}
            labelStyle={{ color: COLORS.gray1 }}
          />
          <ReferenceLine y={MEI.ANNUAL_LIMIT} stroke={COLORS.danger} strokeDasharray="4 3"
            label={{ value: 'Limite R$ 81k', fill: COLORS.danger, fontSize: 13, position: 'insideBottomRight' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={v => <span style={{ color: COLORS.gray1 }}>{v}</span>}
          />
          <Area type="monotone" dataKey="real"      name="Realizado"  stroke={COLORS.blue}      fill="url(#gReal)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="projetado" name="Projetado"  stroke={COLORS.blueLight} fill="url(#gProj)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}