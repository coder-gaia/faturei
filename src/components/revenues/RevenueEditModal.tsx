import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RevenueStatusBadge } from './RevenueStatusBadge'
import { formatDate } from '../../utils/formatters'
import type { Revenue, Client } from '../../types'

interface Props {
  revenue:  Revenue | null
  clients:  Client[]
  onClose:  () => void
  onSave:   (id: string, data: { client_id: string | null; value: number; due_date: string | null; description: string }) => Promise<void>
  onMarkReceived: (id: string) => Promise<void>
  onDelete: (id: string) => void
}

export function RevenueEditModal({ revenue, clients, onClose, onSave, onMarkReceived, onDelete }: Props) {
  const [clientId,    setClientId]    = useState(revenue?.client_id ?? '')
  const [value,       setValue]       = useState(revenue?.value.toString() ?? '')
  const [dueDate,     setDueDate]     = useState(revenue?.due_date ?? '')
  const [description, setDescription] = useState(revenue?.description ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  if (!revenue) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!revenue) return
    if (!description.trim()) { setError('Descrição é obrigatória.'); return }
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed <= 0) { setError('Informe um valor válido.'); return }
    setSaving(true)
    try {
      await onSave(revenue.id, {
        client_id:   clientId || null,
        value:       parsed,
        due_date:    dueDate || null,
        description: description.trim(),
      })
      onClose()
    } catch { setError('Erro ao salvar. Tente novamente.') }
    finally { setSaving(false) }
  }

  return (
    <Modal open={!!revenue} onClose={onClose} title="Editar lançamento">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Info imutável */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div>
            <p className="text-xs text-muted">Emitido em</p>
            <p className="text-sm" style={{ color: 'var(--color-white)', marginTop: 2 }}>{formatDate(revenue.issue_date)}</p>
          </div>
          {revenue.nf_number && (
            <div style={{ textAlign: 'right' }}>
              <p className="text-xs text-muted">Nota Fiscal</p>
              <p className="text-mono text-sm" style={{ color: 'var(--color-white)', marginTop: 2 }}>#{revenue.nf_number}</p>
            </div>
          )}
          <RevenueStatusBadge status={revenue.status} dueDate={revenue.due_date} />
        </div>

        {/* Campos editáveis */}
        <Input
          label="Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <div className="form-group">
          <label className="form-label">Cliente</label>
          <select
            className="form-input"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            <option value="">Sem cliente vinculado</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            required
            mono
          />
          <Input
            label="Vencimento"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {revenue.status === 'pending' && (
            <Button
              type="button"
              variant="secondary"
              style={{ color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.3)' }}
              onClick={async () => { await onMarkReceived(revenue.id); onClose() }}
            >
              ✓ Marcar recebido
            </Button>
          )}
          <Button
            type="button"
            variant="danger"
            onClick={() => { onDelete(revenue.id); onClose() }}
          >
            Excluir
          </Button>
          <div style={{ flex: 1 }} />
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}