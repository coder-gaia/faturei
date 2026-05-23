import {
  useState,
  type FormEvent,
} from 'react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

import type {
  RevenueFormData,
  Client,
} from '../../types'

interface Props {
  clients: Client[]
  onSubmit: (
    data: RevenueFormData,
  ) => Promise<void>
  onCancel: () => void
}

export function RevenueForm({
  clients,
  onSubmit,
  onCancel,
}: Props) {
  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const [form, setForm] =
    useState<RevenueFormData>({
      client_id: '',
      description: '',
      value: '',
      issue_date: today,
      due_date: '',
      nf_number: '',
      notes: '',
    })

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  function set(
    field: keyof RevenueFormData,
    value: string,
  ) {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(
    e: FormEvent,
  ) {
    e.preventDefault()

    if (!form.description.trim()) {
      setError(
        'Descrição é obrigatória.',
      )
      return
    }

    if (
      !form.value ||
      isNaN(parseFloat(form.value))
    ) {
      setError(
        'Informe um valor válido.',
      )
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(form)
    } catch {
      setError(
        'Erro ao salvar lançamento.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div className="form-group">
        <label className="form-label">
          Cliente
        </label>

        <select
          className="form-input"
          value={form.client_id}
          onChange={e =>
            set(
              'client_id',
              e.target.value,
            )
          }
        >
          <option value="">
            Sem cliente vinculado
          </option>

          {clients.map(client => (
            <option
              key={client.id}
              value={client.id}
            >
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Descrição do serviço"
        placeholder="Ex: Desenvolvimento de landing page"
        value={form.description}
        onChange={e =>
          set(
            'description',
            e.target.value,
          )
        }
        required
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: 12,
        }}
      >
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          placeholder="0,00"
          value={form.value}
          onChange={e =>
            set('value', e.target.value)
          }
          required
          mono
        />

        <Input
          label="Nº da NF"
          placeholder="000123"
          value={form.nf_number}
          onChange={e =>
            set(
              'nf_number',
              e.target.value,
            )
          }
          mono
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: 12,
        }}
      >
        <Input
          label="Data de emissão"
          type="date"
          value={form.issue_date}
          onChange={e =>
            set(
              'issue_date',
              e.target.value,
            )
          }
          required
        />

        <Input
          label="Data de vencimento"
          type="date"
          value={form.due_date}
          onChange={e =>
            set(
              'due_date',
              e.target.value,
            )
          }
        />
      </div>

      <Input
        label="Observações"
        placeholder="Opcional..."
        value={form.notes}
        onChange={e =>
          set('notes', e.target.value)
        }
      />

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          loading={loading}
        >
          Salvar lançamento
        </Button>
      </div>
    </form>
  )
}