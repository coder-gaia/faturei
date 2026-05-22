import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { fetchCNPJ } from '../services/cnpjService'
import { generateYearlyDAS } from '../utils/dasCalculator'
import { formatCNPJ, cleanCNPJ, isValidCNPJ } from '../utils/formatters'
import { MEI, type ActivityType } from '../constants/mei'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'

interface StepData {
  full_name:     string
  business_name: string
  cnpj:          string
  activity_type: ActivityType
}

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [data, setData] = useState<StepData>({
    full_name:     '',
    business_name: '',
    cnpj:          '',
    activity_type: 'servicos',
  })

  function update(field: keyof StepData, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function next() {
    setError('')
    if (step === 1 && !data.full_name.trim()) {
      setError('Informe seu nome completo.')
      return
    }
    setStep(s => s + 1)
  }

  async function finish() {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const cnpjClean = cleanCNPJ(data.cnpj)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id:            user.id,
          full_name:     data.full_name.trim(),
          business_name: data.business_name.trim() || null,
          cnpj:          cnpjClean || null,
          activity_type: data.activity_type,
          das_value:     MEI.ACTIVITY_TYPES[data.activity_type].das,
        })

      if (profileError) throw profileError

      const dasRecords = generateYearlyDAS(user.id, data.activity_type)
      const { error: dasError } = await supabase
        .from('das_payments')
        .upsert(dasRecords, { onConflict: 'user_id,year,month', ignoreDuplicates: true })

      if (dasError) throw dasError

      await refreshProfile()
      navigate('/app')
    } catch (err: unknown) {
      setError('Erro ao salvar. Tente novamente.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-progress">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`onboarding-dot ${i + 1 <= step ? 'onboarding-dot--active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1 value={data.full_name} onChange={v => update('full_name', v)} error={error} onNext={next} />}
            {step === 2 && <Step2 cnpj={data.cnpj} businessName={data.business_name} onCnpjChange={v => update('cnpj', v)} onBusinessNameChange={v => update('business_name', v)} error={error} onNext={next} onBack={() => setStep(1)} />}
            {step === 3 && <Step3 value={data.activity_type} onChange={v => update('activity_type', v)} onNext={next} onBack={() => setStep(2)} />}
            {step === 4 && <Step4 data={data} saving={saving} error={error} onFinish={finish} onBack={() => setStep(3)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Step1({ value, onChange, error, onNext }: { value: string; onChange: (v: string) => void; error: string; onNext: () => void }) {
  function handleSubmit(e: FormEvent) { e.preventDefault(); onNext() }
  return (
    <form onSubmit={handleSubmit} className="onboarding-step">
      <p className="onboarding-step-number">Passo 1 de 4</p>
      <h2 className="onboarding-step-title">Como você se chama?</h2>
      <p className="onboarding-step-desc">Vamos personalizar sua conta.</p>
      <Input label="Nome completo" placeholder="Maria Souza" value={value} onChange={e => onChange(e.target.value)} error={error} required autoFocus />
      <Button type="submit" full>Continuar →</Button>
    </form>
  )
}

function Step2({ cnpj, businessName, onCnpjChange, onBusinessNameChange, error, onNext, onBack }: { cnpj: string; businessName: string; onCnpjChange: (v: string) => void; onBusinessNameChange: (v: string) => void; error: string; onNext: () => void; onBack: () => void }) {
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  async function handleCNPJLookup() {
    const clean = cleanCNPJ(cnpj)
    if (!isValidCNPJ(clean)) { setFetchError('CNPJ inválido.'); return }
    setFetching(true); setFetchError('')
    try {
      const result = await fetchCNPJ(cnpj)
      if (result.name) onBusinessNameChange(result.name)
    } catch { setFetchError('CNPJ não encontrado.') }
    finally { setFetching(false) }
  }

  return (
    <div className="onboarding-step">
      <p className="onboarding-step-number">Passo 2 de 4</p>
      <h2 className="onboarding-step-title">Qual é o seu CNPJ?</h2>
      <p className="onboarding-step-desc">Opcional. Se informar, preenchemos seu nome empresarial automaticamente.</p>
      <Input label="CNPJ" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => onCnpjChange(formatCNPJ(e.target.value))} mono maxLength={18}
        suffix={<Button type="button" variant="secondary" size="sm" loading={fetching} onClick={handleCNPJLookup} disabled={cleanCNPJ(cnpj).length !== 14}>Buscar</Button>}
      />
      {fetchError && <p className="form-error">{fetchError}</p>}
      <Input label="Nome do negócio (nome fantasia)" placeholder="Maria Souza Design" value={businessName} onChange={e => onBusinessNameChange(e.target.value)} />
      {error && <p className="form-error">{error}</p>}
      <div className="onboarding-actions">
        <Button variant="ghost" onClick={onBack}>← Voltar</Button>
        <Button onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  )
}

function Step3({ value, onChange, onNext, onBack }: { value: ActivityType; onChange: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="onboarding-step">
      <p className="onboarding-step-number">Passo 3 de 4</p>
      <h2 className="onboarding-step-title">Qual é sua atividade principal?</h2>
      <p className="onboarding-step-desc">Isso define o valor do seu DAS mensal.</p>
      <div className="activity-options">
        {(Object.entries(MEI.ACTIVITY_TYPES) as [ActivityType, { label: string; das: number }][]).map(([key, info]) => (
          <button key={key} type="button" className={`activity-option ${value === key ? 'activity-option--active' : ''}`} onClick={() => onChange(key)}>
            <div className="activity-option-label">{info.label}</div>
            <div className="activity-option-das">DAS mensal: <span>R$ {info.das.toFixed(2).replace('.', ',')}</span></div>
          </button>
        ))}
      </div>
      <div className="onboarding-actions">
        <Button variant="ghost" onClick={onBack}>← Voltar</Button>
        <Button onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  )
}

function Step4({ data, saving, error, onFinish, onBack }: { data: StepData; saving: boolean; error: string; onFinish: () => void; onBack: () => void }) {
  return (
    <div className="onboarding-step">
      <p className="onboarding-step-number">Passo 4 de 4</p>
      <h2 className="onboarding-step-title">Tudo certo!</h2>
      <p className="onboarding-step-desc">Confirme seus dados antes de entrar.</p>
      <div className="onboarding-summary">
        <SummaryRow label="Nome"      value={data.full_name} />
        <SummaryRow label="Negócio"   value={data.business_name || '—'} />
        <SummaryRow label="CNPJ"      value={data.cnpj || '—'} />
        <SummaryRow label="Atividade" value={MEI.ACTIVITY_TYPES[data.activity_type].label} />
        <SummaryRow label="DAS mensal" value={`R$ ${MEI.ACTIVITY_TYPES[data.activity_type].das.toFixed(2).replace('.', ',')}`} highlight />
      </div>
      <p className="onboarding-das-note">Os 12 DAS de {new Date().getFullYear()} serão gerados automaticamente.</p>
      {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}
      <div className="onboarding-actions">
        <Button variant="ghost" onClick={onBack} disabled={saving}>← Voltar</Button>
        <Button onClick={onFinish} loading={saving}>Entrar no Faturei →</Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className={`summary-value ${highlight ? 'summary-value--highlight' : ''}`}>{value}</span>
    </div>
  )
}