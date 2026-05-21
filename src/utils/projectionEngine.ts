import { MEI } from '../constants/mei'

export interface Revenue {
  id: string
  value: number
  status: 'pending' | 'received' | 'overdue'
  received_date: string | null
  issue_date: string
}

export interface ProjectionResult {
  totalReceived: number       // total recebido no ano
  monthlyAverage: number      // média mensal real
  projectedTotal: number      // projeção para o fim do ano
  remainingCapacity: number   // quanto ainda pode faturar
  percentUsed: number         // % do limite usado
  isAtRisk: boolean           // projeta > 80% do limite
  willExceed: boolean         // projeta ultrapassar o limite
  monthsUntilLimit: number    // meses até atingir o limite no ritmo atual
  projectedExcess: number     // quanto vai exceder (se exceder)
  monthlyData: MonthlyData[]  // dados mês a mês para o gráfico
}

export interface MonthlyData {
  month: number
  label: string
  actual: number | null       // valor real (null = mês futuro)
  projected: number | null    // valor projetado (null = mês passado já registrado)
  cumulative: number          // acumulado real
  projectedCumulative: number // acumulado projetado
}

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export function calculateProjection(
  revenues: Revenue[],
  referenceDate = new Date()
): ProjectionResult {
  const year = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1 // 1-12
  const monthsElapsed = currentMonth
  const monthsRemaining = 12 - currentMonth

  // Agrupa receitas recebidas por mês
  const revenueByMonth: Record<number, number> = {}
  for (let m = 1; m <= 12; m++) revenueByMonth[m] = 0

  revenues
    .filter(r =>
      r.status === 'received' &&
      r.received_date?.startsWith(String(year))
    )
    .forEach(r => {
      const month = new Date(r.received_date! + 'T00:00:00').getMonth() + 1
      revenueByMonth[month] = (revenueByMonth[month] || 0) + r.value
    })

  const totalReceived = Object.values(revenueByMonth)
    .slice(0, currentMonth)
    .reduce((sum, v) => sum + v, 0)

  const monthlyAverage = monthsElapsed > 0 ? totalReceived / monthsElapsed : 0
  const projectedTotal = totalReceived + monthlyAverage * monthsRemaining
  const remainingCapacity = Math.max(0, MEI.ANNUAL_LIMIT - totalReceived)
  const percentUsed = (totalReceived / MEI.ANNUAL_LIMIT) * 100

  const monthsUntilLimit =
    monthlyAverage > 0 ? remainingCapacity / monthlyAverage : Infinity

  // Monta dados mês a mês para o gráfico
  let cumulative = 0
  let projectedCumulative = 0

  const monthlyData: MonthlyData[] = MONTH_LABELS.map((label, i) => {
    const month = i + 1
    const isPast = month < currentMonth
    const isCurrent = month === currentMonth
    const isFuture = month > currentMonth

    const actual = (isPast || isCurrent) ? revenueByMonth[month] : null
    const projected = isFuture ? monthlyAverage : null

    cumulative += actual ?? 0
    projectedCumulative += actual ?? projected ?? 0

    return {
      month,
      label,
      actual,
      projected,
      cumulative,
      projectedCumulative,
    }
  })

  return {
    totalReceived,
    monthlyAverage,
    projectedTotal,
    remainingCapacity,
    percentUsed,
    isAtRisk: projectedTotal > MEI.ANNUAL_LIMIT * MEI.WARNING_THRESHOLD,
    willExceed: projectedTotal > MEI.ANNUAL_LIMIT,
    monthsUntilLimit,
    projectedExcess: Math.max(0, projectedTotal - MEI.ANNUAL_LIMIT),
    monthlyData,
  }
}