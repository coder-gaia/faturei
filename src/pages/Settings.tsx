import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatCNPJ, cleanCNPJ } from '../utils/formatters'
import { MEI, type ActivityType } from '../constants/mei'

export default function Settings() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name:     profile?.full_name     ?? '',
    business_name: profile?.business_name ?? '',
    cnpj:          profile?.cnpj ? formatCNPJ(profile.cnpj) : '',
    activity_type: (profile?.activity_type ?? 'servicos') as ActivityType,
  })
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true); setError('')
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          full_name:     form.full_name.trim(),
          business_name: form.business_name.trim() || null,
          cnpj:          cleanCNPJ(form.cnpj) || null,
          activity_type: form.activity_type,
          das_value:     MEI.ACTIVITY_TYPES[form.activity_type].das,
        })
        .eq('id', user!.id)
      if (err) throw err
      await refreshProfile()
      setSuccess(true)
    } catch { setError('Erro ao salvar. Tente novamente.') }
    finally { setSaving(false) }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie seu perfil e preferências.</p>
      </div>

      <div className="settings-layout">
        {/* Perfil */}
        <form onSubmit={handleSubmit} className="card">
          <p className="card-title" style={{ marginBottom: 20 }}>Dados do MEI</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome completo" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            <Input label="Nome do negócio" placeholder="Nome fantasia" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
            <Input label="CNPJ" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => set('cnpj', formatCNPJ(e.target.value))} mono maxLength={18} />

            <div className="form-group">
              <label className="form-label">Tipo de atividade</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.entries(MEI.ACTIVITY_TYPES) as [ActivityType, { label: string; das: number }][]).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`activity-option ${form.activity_type === key ? 'activity-option--active' : ''}`}
                    onClick={() => set('activity_type', key)}
                  >
                    <div className="activity-option-label">{info.label}</div>
                    <div className="activity-option-das">DAS: <span>R$ {info.das.toFixed(2).replace('.', ',')}</span></div>
                  </button>
                ))}
              </div>
            </div>

            {error   && <p className="form-error">{error}</p>}
            {success && <p style={{ color: 'var(--color-success)', fontSize: 14, textAlign: 'center' }}>✓ Perfil atualizado com sucesso!</p>}

            <Button type="submit" loading={saving} full>Salvar alterações</Button>
          </div>
        </form>

        {/* Conta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="card-title" style={{ marginBottom: 12 }}>Conta</p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              Logado como <span style={{ color: 'var(--color-white)' }}>{user?.email}</span>
            </p>
            <Button variant="ghost" full onClick={handleSignOut}>Sair da conta</Button>
          </div>

          <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <p className="card-title" style={{ marginBottom: 8, color: 'var(--color-danger)' }}>Zona de perigo</p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              Ao sair, seus dados permanecem salvos na nuvem. Você pode entrar novamente a qualquer momento.
            </p>
            <Button variant="danger" full onClick={handleSignOut}>Sair e encerrar sessão</Button>
          </div>
        </div>
      </div>
    </div>
  )
}