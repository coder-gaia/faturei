import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { formatBRL } from '../utils/formatters'
import { MEI } from '../constants/mei'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export default function Calculator() {
  const { profile } = useAuth()
  const dasValue = profile?.das_value ?? MEI.ACTIVITY_TYPES.servicos.das

  const [desiredNet, setDesiredNet] = useState('')
  const [hoursPerMonth, setHoursPerMonth] = useState('')
  const [expenses, setExpenses] = useState('')

  const net      = parseFloat(desiredNet)   || 0
  const hours    = parseFloat(hoursPerMonth) || 0
  const exp      = parseFloat(expenses)      || 0

  // Cálculo: quanto precisa faturar bruto pra ter 'net' líquido
  // Bruto = líquido desejado + DAS + despesas operacionais
  const grossNeeded    = net + dasValue + exp
  const hourlyRate     = hours > 0 ? grossNeeded / hours : 0
  const dailyRate      = hourlyRate * 8
  const projectRate    = hourlyRate * 40 // projeto médio de 1 semana

  // Verifica se não ultrapassa o limite anual
  const annualProjection = grossNeeded * 12
  const exceedsLimit     = annualProjection > MEI.ANNUAL_LIMIT

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Calculadora de Precificação</h1>
        <p className="page-subtitle">
          Descubra quanto cobrar para atingir sua meta de renda líquida.
        </p>
      </div>

      <div className="calc-layout">
        {/* Inputs */}
        <div className="card">
          <p className="card-title" style={{ marginBottom: 20 }}>Seus parâmetros</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Renda líquida desejada por mês (R$)"
              type="number"
              placeholder="5000"
              value={desiredNet}
              onChange={e => setDesiredNet(e.target.value)}
              mono
              hint="O que você quer receber 'no bolso' todo mês"
            />
            <Input
              label="Horas trabalhadas por mês"
              type="number"
              placeholder="160"
              value={hoursPerMonth}
              onChange={e => setHoursPerMonth(e.target.value)}
              mono
              hint="Considere apenas horas faturáveis (ex: 160h = 40h/sem × 4 sem)"
            />
            <Input
              label="Despesas operacionais por mês (R$)"
              type="number"
              placeholder="0"
              value={expenses}
              onChange={e => setExpenses(e.target.value)}
              mono
              hint="Internet, software, material, etc."
            />

            <div className="calc-das-info">
              <span>DAS mensal já incluído automaticamente</span>
              <span className="text-mono" style={{ color: 'var(--color-blue-light)' }}>
                R$ {dasValue.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="card-title">Faturamento bruto necessário</p>
            <p className="card-value">{net > 0 ? formatBRL(grossNeeded) : '—'}</p>
            <p className="text-sm text-muted" style={{ marginTop: 6 }}>por mês</p>
            {exceedsLimit && net > 0 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--color-danger-dim)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                  ⚠ Projeção anual de {formatBRL(annualProjection)} ultrapassa o limite de {formatBRL(MEI.ANNUAL_LIMIT)}. Considere revisar sua estrutura jurídica.
                </p>
              </div>
            )}
          </div>

          <div className="grid-2">
            <Card title="Valor por hora">
              <p className="card-value" style={{ fontSize: 22 }}>
                {hourlyRate > 0 ? formatBRL(hourlyRate) : '—'}
              </p>
              <p className="text-xs text-muted" style={{ marginTop: 4 }}>/ hora</p>
            </Card>
            <Card title="Valor por dia">
              <p className="card-value" style={{ fontSize: 22 }}>
                {dailyRate > 0 ? formatBRL(dailyRate) : '—'}
              </p>
              <p className="text-xs text-muted" style={{ marginTop: 4 }}>8 horas</p>
            </Card>
          </div>

          <Card title="Projeto médio (40h)">
            <p className="card-value" style={{ color: 'var(--color-blue-light)' }}>
              {projectRate > 0 ? formatBRL(projectRate) : '—'}
            </p>
            <p className="text-xs text-muted" style={{ marginTop: 4 }}>
              Equivalente a ~1 semana de trabalho
            </p>
          </Card>

          {net > 0 && (
            <div className="card">
              <p className="card-title">Breakdown mensal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <BreakdownRow label="Renda líquida"     value={net}      color="var(--color-success)" />
                <BreakdownRow label="DAS"               value={dasValue} color="var(--color-warning)" />
                <BreakdownRow label="Despesas"          value={exp}      color="var(--color-danger)"  />
                <div className="divider" style={{ margin: '4px 0' }} />
                <BreakdownRow label="Total a faturar"   value={grossNeeded} color="var(--color-blue-light)" bold />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="text-sm" style={{ color: bold ? 'var(--color-white)' : 'var(--color-gray-2)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span className="text-mono text-sm" style={{ color, fontWeight: bold ? 700 : 600 }}>{formatBRL(value)}</span>
    </div>
  )
}