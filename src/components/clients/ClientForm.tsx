import { useState, type FormEvent } from 'react'
import { fetchCNPJ } from '../../services/cnpjService'
import {
  formatCNPJ,
  cleanCNPJ,
  isValidCNPJ,
  formatPhone,
} from '../../utils/formatters'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

import type { ClientFormData } from '../../types'

interface Props {
  onSubmit: (data: ClientFormData) => Promise<void>
  onCancel: () => void
}

export function ClientForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ClientFormData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    city: '',
    state: '',
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: keyof ClientFormData, value: string) {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleCNPJLookup() {
    const cleaned = cleanCNPJ(form.cnpj)

    if (!isValidCNPJ(cleaned)) {
      setError('CNPJ inválido.')
      return
    }

    setFetching(true)
    setError('')

    try {
      const result = await fetchCNPJ(cleaned)

      setForm(prev => ({
        ...prev,
        name: result.name || prev.name,
        email: result.email || prev.email,
        phone: result.phone || prev.phone,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    } catch {
      setError('CNPJ não encontrado.')
    } finally {
      setFetching(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Nome é obrigatório.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        ...form,
        cnpj: cleanCNPJ(form.cnpj),
      })
    } catch {
      setError('Erro ao salvar cliente.')
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 10,
          alignItems: 'end',
        }}
      >
        <Input
          label="CNPJ"
          placeholder="00.000.000/0001-00"
          value={form.cnpj}
          mono
          maxLength={18}
          onChange={e =>
            updateField('cnpj', formatCNPJ(e.target.value))
          }
        />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={fetching}
          onClick={handleCNPJLookup}
          disabled={cleanCNPJ(form.cnpj).length !== 14}
        >
          Buscar
        </Button>
      </div>

      <Input
        label="Nome / Razão social"
        placeholder="Empresa XYZ Ltda"
        value={form.name}
        onChange={e => updateField('name', e.target.value)}
        required
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <Input
          label="Email"
          type="email"
          placeholder="contato@empresa.com"
          value={form.email}
          onChange={e => updateField('email', e.target.value)}
        />

        <Input
          label="Telefone"
          placeholder="(42) 99999-9999"
          value={form.phone}
          onChange={e =>
            updateField('phone', formatPhone(e.target.value))
          }
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px',
          gap: 12,
        }}
      >
        <Input
          label="Cidade"
          placeholder="Curitiba"
          value={form.city}
          onChange={e => updateField('city', e.target.value)}
        />

        <Input
          label="UF"
          placeholder="PR"
          value={form.state}
          maxLength={2}
          onChange={e =>
            updateField('state', e.target.value.toUpperCase())
          }
        />
      </div>

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
          marginTop: 4,
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
          Salvar cliente
        </Button>
      </div>
    </form>
  )
}