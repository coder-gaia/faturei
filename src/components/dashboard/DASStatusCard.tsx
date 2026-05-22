import type { DASPayment } from '../../types'
import { MEI } from '../../constants/mei'
import { getDASStatus } from '../../utils/dasCalculator'
import { Badge } from '../ui/Badge'

interface Props { payments: DASPayment[]; onGoToDAS: () => void }

export function DASStatusCard({ payments, onGoToDAS }: Props) {
  const currentMonth = new Date().getMonth() + 1
  const current = payments.find(p => p.month === currentMonth)
  const paidCount = payments.filter(p => p.status === 'paid').length
  if (!current) return null
  const { label, color } = getDASStatus(current.status, current.due_date)
  const badgeVariant = color === 'success' ? 'success' : color === 'warning' ? 'warning' : color === 'danger' ? 'danger' : 'gray'
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onGoToDAS}>
      <p className="card-title">DAS — {MEI.MONTH_NAMES[currentMonth - 1]}</p>
      <p className="card-value" style={{ fontFamily: 'var(--font-mono)' }}>R$ {current.value.toFixed(2).replace('.', ',')}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Badge variant={badgeVariant as never}>{label}</Badge>
      </div>
      <div className="das-dots-mini">
        {payments.map(p => (
          <div key={p.month} className={`das-dot-mini ${p.status === 'paid' ? 'das-dot-mini--paid' : p.month === currentMonth ? 'das-dot-mini--current' : ''}`} title={`${MEI.MONTH_NAMES[p.month - 1]}`} />
        ))}
      </div>
      <p className="text-xs text-muted" style={{ marginTop: 6 }}>{paidCount}/12 meses pagos · Ver todos →</p>
    </div>
  )
}