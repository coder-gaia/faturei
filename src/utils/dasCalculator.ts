import { MEI, type ActivityType } from '../constants/mei'

/**
 * Retorna o valor do DAS para um tipo de atividade.
 */
export function getDASValue(activityType: ActivityType): number {
  return MEI.ACTIVITY_TYPES[activityType].das
}

/**
 * Gera os 12 registros de DAS para um ano,
 * marcando meses anteriores como pendentes automaticamente.
 */
export function generateYearlyDAS(
  userId: string,
  activityType: ActivityType,
  year = new Date().getFullYear()
) {
  const value = getDASValue(activityType)
  const currentMonth = new Date().getMonth() + 1

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const dueDate = new Date(year, month - 1, MEI.DAS_DUE_DAY)

    // Meses passados ficam pendentes; meses futuros também
    const isPastDue = month < currentMonth && year <= new Date().getFullYear()

    return {
      user_id: userId,
      year,
      month,
      value,
      due_date: formatDueDate(dueDate),
      paid_date: null,
      status: isPastDue ? 'overdue' : 'pending',
    }
  })
}

function formatDueDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Retorna o status visual de um DAS baseado nas datas.
 */
export function getDASStatus(
  status: string,
  dueDate: string
): { label: string; color: string } {
  if (status === 'paid') return { label: 'Pago', color: 'success' }

  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysUntilDue = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilDue < 0) return { label: 'Vencido', color: 'danger' }
  if (daysUntilDue <= 5) return { label: `Vence em ${daysUntilDue}d`, color: 'warning' }
  return { label: 'Pendente', color: 'gray' }
}