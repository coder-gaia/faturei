import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Revenue, DASPayment } from '../../types'
import type { ProjectionResult } from '../../utils/projectionEngine'
import { formatBRL } from '../../utils/formatters'
import { MEI } from '../../constants/mei'
import { X } from 'lucide-react'
import { useState } from 'react'

interface Alert {
  id:       string
  type:     'danger' | 'warning' | 'info'
  message:  string
  action?:  { label: string; to: string }
}

interface Props {
  revenues:   Revenue[]
  das:        DASPayment[]
  projection: ProjectionResult
}

export function SmartAlerts({ revenues, das, projection }: Props) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<string[]>([])

  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth() + 1

    // DAS do mês atual
    const currentDAS = das.find(d => d.month === currentMonth)
    if (currentDAS && currentDAS.status !== 'paid') {
      const due = new Date(currentDAS.due_date + 'T00:00:00')
      const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000)

      if (daysLeft < 0) {
        list.push({ id: 'das-overdue', type: 'danger', message: `DAS de ${MEI.MONTH_NAMES[currentMonth - 1]} está vencido. Regularize para evitar multas.`, action: { label: 'Ver DAS', to: '/app/das' } })
      } else if (daysLeft <= 5) {
        list.push({ id: 'das-due-soon', type: 'warning', message: `DAS de ${MEI.MONTH_NAMES[currentMonth - 1]} vence em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} (dia ${MEI.DAS_DUE_DAY}).`, action: { label: 'Ver DAS', to: '/app/das' } })
      }
    }

    // Receitas vencidas não recebidas
    const overdueRevenues = revenues.filter(r => {
      if (r.status !== 'pending' || !r.due_date) return false
      return new Date(r.due_date + 'T00:00:00') < today
    })
    if (overdueRevenues.length > 0) {
      const total = overdueRevenues.reduce((s, r) => s + r.value, 0)
      list.push({ id: 'revenues-overdue', type: 'warning', message: `${overdueRevenues.length} receita${overdueRevenues.length > 1 ? 's' : ''} vencida${overdueRevenues.length > 1 ? 's' : ''} sem receber (${formatBRL(total)}).`, action: { label: 'Ver receitas', to: '/app/receitas' } })
    }

    // Limite anual — crítico
    if (projection.percentUsed >= 95) {
      list.push({ id: 'limit-critical', type: 'danger', message: `Você utilizou ${projection.percentUsed.toFixed(0)}% do limite anual. Restam apenas ${formatBRL(projection.remainingCapacity)}.` })
    } else if (projection.percentUsed >= 80) {
      list.push({ id: 'limit-warning', type: 'warning', message: `Você está em ${projection.percentUsed.toFixed(0)}% do limite. Ainda pode faturar ${formatBRL(projection.remainingCapacity)} com segurança.` })
    }

    // Projeção de desenquadramento
    if (projection.willExceed) {
      list.push({ id: 'will-exceed', type: 'danger', message: `No ritmo atual, você ultrapassará o limite em ${formatBRL(projection.projectedExcess)}. Considere consultar um contador.` })
    }

    return list
  }, [revenues, das, projection])

  const visible = alerts.filter(a => !dismissed.includes(a.id))
  if (!visible.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
      <AnimatePresence>
        {visible.map(alert => (
          <motion.div
            key={alert.id}
            className={`smart-alert smart-alert--${alert.type}`}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="smart-alert-msg">{alert.message}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {alert.action && (
                <button
                  className="smart-alert-action"
                  onClick={() => navigate(alert.action!.to)}
                >
                  {alert.action.label}
                </button>
              )}
              <button
                className="smart-alert-close"
                onClick={() => setDismissed(p => [...p, alert.id])}
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}