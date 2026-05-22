import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRevenues } from '../hooks/useRevenues'
import { useDAS } from '../hooks/useDAS'
import { useProjection } from '../hooks/useProjection'
import { RevenueProgressBar } from '../components/dashboard/RevenueProgressBar'
import { SafeZoneCard } from '../components/dashboard/SafeZoneCard'
import { DASStatusCard } from '../components/dashboard/DASStatusCard'
import { ProjectionChart } from '../components/dashboard/ProjectionChart'
import { MonthlyBarChart } from '../components/dashboard/MonthlyBarChart'
import { Spinner } from '../components/ui/Spinner'
import { formatBRL } from '../utils/formatters'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const { data: revenues, isLoading: loadingRevenues } = useRevenues()
  const { data: dasPayments, isLoading: loadingDAS }   = useDAS()
  const projection = useProjection(revenues)

  if (loadingRevenues || loadingDAS) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  const pendingRevenues  = revenues?.filter(r => r.status === 'pending') ?? []
  const pendingTotal     = pendingRevenues.reduce((s, r) => s + r.value, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">
          {profile?.business_name ?? 'Seu painel financeiro MEI'}
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <p className="card-title">Receitas recebidas</p>
          <p className="card-value" style={{ fontSize: 22 }}>
            {formatBRL(projection.totalReceived)}
          </p>
        </div>
        <div className="card">
          <p className="card-title">A receber</p>
          <p className="card-value" style={{ fontSize: 22, color: 'var(--color-warning)' }}>
            {formatBRL(pendingTotal)}
          </p>
        </div>
        <div className="card">
          <p className="card-title">Lançamentos</p>
          <p className="card-value" style={{ fontSize: 22 }}>
            {revenues?.length ?? 0}
          </p>
        </div>
        <div className="card">
          <p className="card-title">Média mensal</p>
          <p className="card-value" style={{ fontSize: 22 }}>
            {formatBRL(projection.monthlyAverage)}
          </p>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <RevenueProgressBar projection={projection} />
        <SafeZoneCard projection={projection} />
        {dasPayments && dasPayments.length > 0 && (
          <DASStatusCard payments={dasPayments} onGoToDAS={() => navigate('/app/das')} />
        )}
      </div>

      {/* Gráficos */}
      <div className="dashboard-charts">
        <ProjectionChart projection={projection} />
        <MonthlyBarChart projection={projection} />
      </div>
    </div>
  )
}