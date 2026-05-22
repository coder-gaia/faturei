import type { ProjectionResult } from '../../utils/projectionEngine'
import { formatBRL, formatPercent } from '../../utils/formatters'
import { MEI } from '../../constants/mei'

interface Props { projection: ProjectionResult }

export function RevenueProgressBar({ projection }: Props) {
  const { percentUsed, totalReceived, remainingCapacity } = projection
  const fillClass = percentUsed >= 95 ? 'progress-fill--danger'
    : percentUsed >= 80 ? 'progress-fill--warning'
    : 'progress-fill--blue'

  return (
    <div className="card">
      <p className="card-title">Faturamento anual {new Date().getFullYear()}</p>
      <p className="card-value">{formatBRL(totalReceived)}</p>
      <p className="text-sm text-muted" style={{ marginBottom: 14, marginTop: 4 }}>
        de {formatBRL(MEI.ANNUAL_LIMIT)} permitidos
      </p>
      <div className="progress-track" style={{ height: 10 }}>
        <div className={`progress-fill ${fillClass}`} style={{ width: `${Math.min(percentUsed, 100)}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <span className="text-sm text-muted">{formatPercent(percentUsed)} utilizado</span>
        <span className="text-sm" style={{ color: 'var(--color-success)' }}>{formatBRL(remainingCapacity)} disponível</span>
      </div>
    </div>
  )
}