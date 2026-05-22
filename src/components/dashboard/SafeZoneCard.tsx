import type { ProjectionResult } from '../../utils/projectionEngine'
import { formatBRL } from '../../utils/formatters'

interface Props { projection: ProjectionResult }

export function SafeZoneCard({ projection }: Props) {
  const { remainingCapacity, willExceed, projectedExcess, monthsUntilLimit, projectedTotal } = projection
  return (
    <div className="card" style={{ borderColor: willExceed ? 'var(--color-danger)' : undefined }}>
      <p className="card-title">{willExceed ? '⚠ Risco de desenquadramento' : 'Capacidade disponível'}</p>
      {willExceed ? (
        <>
          <p className="card-value" style={{ color: 'var(--color-danger)' }}>+{formatBRL(projectedExcess)}</p>
          <p className="text-sm" style={{ color: 'var(--color-warning)', marginTop: 6 }}>Projeção excede o limite. Consulte um contador.</p>
        </>
      ) : (
        <>
          <p className="card-value" style={{ color: 'var(--color-success)' }}>{formatBRL(remainingCapacity)}</p>
          <p className="text-sm text-muted" style={{ marginTop: 6 }}>
            {monthsUntilLimit === Infinity ? 'Você ainda pode crescer bastante este ano.' : `No ritmo atual, limite em ~${Math.floor(monthsUntilLimit)} meses.`}
          </p>
          <p className="text-xs text-muted" style={{ marginTop: 4 }}>Projeção anual: {formatBRL(projectedTotal)}</p>
        </>
      )}
    </div>
  )
}