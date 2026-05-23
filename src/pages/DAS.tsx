import { useState } from 'react'
import { useDAS } from '../hooks/useDAS'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { getDASStatus } from '../utils/dasCalculator'
import { MEI } from '../constants/mei'
import { formatDate } from '../utils/formatters'
import type { DASPayment } from '../types'

export default function DAS() {
  const { profile } = useAuth()

  const {
    data: payments,
    isLoading,
    markPaid,
    markUnpaid,
  } = useDAS()

  const [selected, setSelected] = useState<DASPayment | null>(null)
  const [paidDate, setPaidDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [saving, setSaving] = useState(false)

  const paidCount =
    payments?.filter(p => p.status === 'paid').length ?? 0

  const overdueCount =
    payments?.filter(p => p.status === 'overdue').length ?? 0

  const totalPaid =
    payments
      ?.filter(p => p.status === 'paid')
      .reduce((s, p) => s + p.value, 0) ?? 0

  async function handleMarkPaid() {
    if (!selected) return

    setSaving(true)

    await markPaid.mutateAsync({
      id: selected.id,
      date: paidDate,
    })

    setSaving(false)
    setSelected(null)
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 80,
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">DAS</h1>

        <p className="page-subtitle">
          Documento de Arrecadação do Simples Nacional —
          vence todo dia {MEI.DAS_DUE_DAY}
        </p>
      </div>

      {/* Resumo */}
      <div
        className="grid-3"
        style={{ marginBottom: 28 }}
      >
        <div className="card">
          <p className="card-title">Meses pagos</p>

          <p className="card-value">
            {paidCount}
            <span
              className="text-muted"
              style={{ fontSize: 18 }}
            >
              /12
            </span>
          </p>
        </div>

        <div className="card">
          <p className="card-title">Valor por mês</p>

          <p
            className="card-value"
            style={{
              fontFamily: 'var(--font-mono)',
            }}
          >
            R${' '}
            {profile?.das_value
              ?.toFixed(2)
              .replace('.', ',') ?? '—'}
          </p>
        </div>

        <div className="card">
          <p className="card-title">
            Total pago no ano
          </p>

          <p
            className="card-value"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-success)',
            }}
          >
            R$ {totalPaid.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="das-alert">
          ⚠ Você tem {overdueCount} DAS vencido
          {overdueCount > 1 ? 's' : ''}.
          Regularize para evitar multas.
        </div>
      )}

      {/* Grid 12 meses */}
      <div className="das-calendar">
        {payments?.map(payment => {
          const { label, color } = getDASStatus(
            payment.status,
            payment.due_date,
          )

          const badgeVariant =
            color === 'success'
              ? 'success'
              : color === 'warning'
                ? 'warning'
                : color === 'danger'
                  ? 'danger'
                  : 'gray'

          const currentMonth =
            new Date().getMonth() + 1

          const isCurrent =
            payment.month === currentMonth

          return (
            <div
              key={payment.month}
              className={`das-month-card ${
                isCurrent
                  ? 'das-month-card--current'
                  : ''
              }`}
              onClick={() => {
                setSelected(payment)

                setPaidDate(
                  new Date()
                    .toISOString()
                    .split('T')[0],
                )
              }}
            >
              <p className="das-month-name">
                {MEI.MONTH_NAMES[
                  payment.month - 1
                ]}
              </p>

              <p className="das-month-value">
                R${' '}
                {payment.value
                  .toFixed(2)
                  .replace('.', ',')}
              </p>

              <Badge variant={badgeVariant as never}>
                {label}
              </Badge>

              {payment.paid_date && (
                <p className="das-month-paiddate">
                  Pago em{' '}
                  {formatDate(payment.paid_date)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `DAS — ${
                MEI.MONTH_NAMES[
                  selected.month - 1
                ]
              }`
            : ''
        }
      >
        {selected && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div className="onboarding-summary">
              <div className="summary-row">
                <span className="summary-label">
                  Valor
                </span>

                <span className="summary-value summary-value--highlight">
                  R${' '}
                  {selected.value
                    .toFixed(2)
                    .replace('.', ',')}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">
                  Vencimento
                </span>

                <span className="summary-value">
                  {formatDate(selected.due_date)}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">
                  Status
                </span>

                <span className="summary-value">
                  {selected.status === 'paid'
                    ? 'Pago'
                    : 'Pendente'}
                </span>
              </div>
            </div>

            {selected.status !== 'paid' ? (
              <>
                <Input
                  label="Data do pagamento"
                  type="date"
                  value={paidDate}
                  onChange={e =>
                    setPaidDate(e.target.value)
                  }
                />

                <Button
                  loading={saving}
                  full
                  onClick={handleMarkPaid}
                >
                  Confirmar pagamento
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                full
                onClick={async () => {
                  await markUnpaid.mutateAsync(
                    selected.id,
                  )

                  setSelected(null)
                }}
              >
                Desfazer pagamento
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}