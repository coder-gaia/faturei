import { useState } from 'react'
import { useRevenues, useRevenueUpdate } from '../hooks/useRevenues'
import { useClients } from '../hooks/useClients'
import { RevenueForm } from '../components/revenues/RevenueForm'
import { RevenueEditModal } from '../components/revenues/RevenueEditModal'
import { RevenueStatusBadge } from '../components/revenues/RevenueStatusBadge'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { formatBRL, formatDate } from '../utils/formatters'
import { Plus, Receipt } from 'lucide-react'
import type { Revenue } from '../types'

export default function Revenues() {
  const { data: revenues, isLoading, create, markReceived, remove } = useRevenues()
  const { data: clients } = useClients()
  const update = useRevenueUpdate()

  const [openNew,  setOpenNew]  = useState(false)
  const [editing,  setEditing]  = useState<Revenue | null>(null)
  const [filter,   setFilter]   = useState<'all' | 'pending' | 'received'>('all')

  const filtered = revenues?.filter(r =>
    filter === 'all' ? true : r.status === filter
  ) ?? []

  const totalReceived = revenues?.filter(r => r.status === 'received').reduce((s, r) => s + r.value, 0) ?? 0
  const totalPending  = revenues?.filter(r => r.status === 'pending').reduce((s, r) => s + r.value, 0) ?? 0

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spinner size="lg" />
    </div>
  )

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Receitas</h1>
          <p className="page-subtitle">{revenues?.length ?? 0} lançamentos</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setOpenNew(true)}>Novo lançamento</Button>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <p className="card-title">Total recebido</p>
          <p className="card-value" style={{ color: 'var(--color-success)', fontSize: 24 }}>{formatBRL(totalReceived)}</p>
        </div>
        <div className="card">
          <p className="card-title">A receber</p>
          <p className="card-value" style={{ color: 'var(--color-warning)', fontSize: 24 }}>{formatBRL(totalPending)}</p>
        </div>
      </div>

      <div className="mode-toggle" style={{ marginBottom: 16 }}>
        {(['all', 'pending', 'received'] as const).map(f => (
          <button
            key={f}
            className={`mode-btn ${filter === f ? 'mode-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Recebidos'}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <span className="empty-state-icon"><Receipt size={40} /></span>
          <p className="empty-state-title">Nenhum lançamento{filter !== 'all' ? ' nesse filtro' : ''}</p>
          <p className="empty-state-desc">Registre suas receitas para acompanhar o faturamento.</p>
          {filter === 'all' && (
            <Button onClick={() => setOpenNew(true)} style={{ marginTop: 8 }}>
              Criar primeiro lançamento
            </Button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-header-row revenues-grid">
            <span>Descrição</span>
            <span>Cliente</span>
            <span>Valor</span>
            <span>Emissão</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map(r => (
            <div
              key={r.id}
              className="table-row revenues-grid"
              style={{ cursor: 'pointer' }}
              onClick={() => setEditing(r)}
            >
              <div>
                <p style={{ fontWeight: 500, fontSize: 14 }}>{r.description}</p>
                {r.nf_number && <p className="text-xs text-muted">NF {r.nf_number}</p>}
              </div>
              <span className="text-sm text-muted">{r.client?.name ?? '—'}</span>
              <span className="text-mono text-sm" style={{ fontWeight: 600 }}>{formatBRL(r.value)}</span>
              <span className="text-sm text-muted">{formatDate(r.issue_date)}</span>
              <RevenueStatusBadge status={r.status} dueDate={r.due_date} />
              <span className="text-xs text-muted" style={{ textAlign: 'right' }}>Editar →</span>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo lançamento */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo lançamento" wide>
        <RevenueForm
          clients={clients ?? []}
          onSubmit={async data => { await create.mutateAsync(data); setOpenNew(false) }}
          onCancel={() => setOpenNew(false)}
        />
      </Modal>

      {/* Modal de edição */}
      <RevenueEditModal
        key={editing?.id}
        revenue={editing}
        clients={clients ?? []}
        onClose={() => setEditing(null)}
        onSave={async (id, data) => { await update.mutateAsync({ id, data }) }}
        onMarkReceived={async id => {
          await markReceived.mutateAsync({ id, date: new Date().toISOString().split('T')[0] })
        }}
        onDelete={id => remove.mutate(id)}
      />
    </div>
  )
}