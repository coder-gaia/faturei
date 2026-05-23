import { useState } from 'react'
import { useRevenues } from '../hooks/useRevenues'
import { useDAS } from '../hooks/useDAS'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { RevenueStatusBadge } from '../components/revenues/RevenueStatusBadge'
import { formatBRL, formatDate } from '../utils/formatters'
import { MEI } from '../constants/mei'
import { Download } from 'lucide-react'

export default function Reports() {
  const { profile } = useAuth()
  const year = new Date().getFullYear()
  const { data: revenues, isLoading: loadingR } = useRevenues()
  const { data: dasPayments, isLoading: loadingD } = useDAS(year)

  const [period, setPeriod] = useState<'month' | 'year'>('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const filtered = revenues?.filter(r => {
    const d = new Date(r.issue_date + 'T00:00:00')
    if (period === 'year')  return d.getFullYear() === year
    return d.getFullYear() === year && d.getMonth() === selectedMonth
  }) ?? []

  const totalReceived = filtered.filter(r => r.status === 'received').reduce((s, r) => s + r.value, 0)
  const totalPending  = filtered.filter(r => r.status === 'pending').reduce((s, r) => s + r.value, 0)
  const dasPaid       = dasPayments?.filter(d => d.status === 'paid').reduce((s, d) => s + d.value, 0) ?? 0

  async function handleExport() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const title = period === 'year'
      ? `Relatório Anual ${year}`
      : `Relatório — ${MEI.MONTH_NAMES[selectedMonth]} ${year}`

    doc.setFontSize(20)
    doc.text('Faturei', 20, 20)
    doc.setFontSize(14)
    doc.text(title, 20, 32)
    doc.setFontSize(11)
    doc.text(`MEI: ${profile?.full_name ?? ''}`, 20, 44)
    doc.text(`CNPJ: ${profile?.cnpj ?? '—'}`, 20, 52)
    doc.line(20, 58, 190, 58)

    doc.setFontSize(12)
    doc.text('Resumo', 20, 68)
    doc.setFontSize(10)
    doc.text(`Total recebido: ${formatBRL(totalReceived)}`, 20, 78)
    doc.text(`Total pendente: ${formatBRL(totalPending)}`, 20, 86)
    doc.text(`DAS pagos: ${formatBRL(dasPaid)}`, 20, 94)
    doc.line(20, 100, 190, 100)

    doc.setFontSize(12)
    doc.text('Lançamentos', 20, 110)
    doc.setFontSize(9)

    let y = 120
    filtered.forEach(r => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(`${formatDate(r.issue_date)}  ${r.description.slice(0, 40)}  ${formatBRL(r.value)}  ${r.status === 'received' ? 'Recebido' : 'Pendente'}`, 20, y)
      y += 8
    })

    doc.save(`faturei-${period === 'year' ? year : `${selectedMonth + 1}-${year}`}.pdf`)
  }

  if (loadingR || loadingD) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="lg" /></div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Exporte seus dados para o contador.</p>
        </div>
        <Button icon={<Download size={16} />} onClick={handleExport}>Exportar PDF</Button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="mode-toggle">
          <button className={`mode-btn ${period === 'month' ? 'mode-btn--active' : ''}`} onClick={() => setPeriod('month')}>Mês</button>
          <button className={`mode-btn ${period === 'year'  ? 'mode-btn--active' : ''}`} onClick={() => setPeriod('year')}>Ano</button>
        </div>
        {period === 'month' && (
          <select className="form-input" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
            {MEI.MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m} {year}</option>)}
          </select>
        )}
      </div>

      {/* Resumo */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <p className="card-title">Recebido</p>
          <p className="card-value" style={{ color: 'var(--color-success)', fontSize: 22 }}>{formatBRL(totalReceived)}</p>
        </div>
        <div className="card">
          <p className="card-title">Pendente</p>
          <p className="card-value" style={{ color: 'var(--color-warning)', fontSize: 22 }}>{formatBRL(totalPending)}</p>
        </div>
        <div className="card">
          <p className="card-title">DAS pagos</p>
          <p className="card-value" style={{ fontSize: 22 }}>{formatBRL(dasPaid)}</p>
        </div>
      </div>

      {/* Tabela */}
      {!filtered.length ? (
        <div className="empty-state">
          <p className="empty-state-title">Nenhum lançamento nesse período</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-header-row revenues-grid">
            <span>Descrição</span><span>Cliente</span><span>Valor</span><span>Data</span><span>Status</span><span></span>
          </div>
          {filtered.map(r => (
            <div key={r.id} className="table-row revenues-grid">
              <span style={{ fontSize: 14 }}>{r.description}</span>
              <span className="text-sm text-muted">{r.client?.name ?? '—'}</span>
              <span className="text-mono text-sm" style={{ fontWeight: 600 }}>{formatBRL(r.value)}</span>
              <span className="text-sm text-muted">{formatDate(r.issue_date)}</span>
              <RevenueStatusBadge status={r.status} dueDate={r.due_date} />
              <span />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}