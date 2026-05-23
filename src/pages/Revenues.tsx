import { useState } from 'react'

import { useRevenues } from '../hooks/useRevenues'
import { useClients } from '../hooks/useClients'

import { RevenueForm } from '../components/revenues/RevenueForm'
import { RevenueStatusBadge } from '../components/revenues/RevenueStatusBadge'

import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

import {
  formatBRL,
  formatDate,
} from '../utils/formatters'

import {
  Plus,
  Receipt,
  CheckCircle,
  Trash2,
} from 'lucide-react'

export default function Revenues() {
  const {
    data: revenues,
    isLoading,
    create,
    markReceived,
    remove,
  } = useRevenues()

  const { data: clients } =
    useClients()

  const [open, setOpen] =
    useState(false)

  const [filter, setFilter] =
    useState<
      'all' | 'pending' | 'received'
    >('all')

  const [markingId, setMarkingId] =
    useState<string | null>(null)

  const filtered =
    revenues?.filter(revenue =>
      filter === 'all'
        ? true
        : revenue.status === filter,
    ) ?? []

  const totalReceived =
    revenues
      ?.filter(
        revenue =>
          revenue.status ===
          'received',
      )
      .reduce(
        (sum, revenue) =>
          sum + revenue.value,
        0,
      ) ?? 0

  const totalPending =
    revenues
      ?.filter(
        revenue =>
          revenue.status ===
          'pending',
      )
      .reduce(
        (sum, revenue) =>
          sum + revenue.value,
        0,
      ) ?? 0

  async function handleMarkReceived(
    id: string,
  ) {
    setMarkingId(id)

    await markReceived.mutateAsync({
      id,
      date:
        new Date()
          .toISOString()
          .split('T')[0],
    })

    setMarkingId(null)
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
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">
            Receitas
          </h1>

          <p className="page-subtitle">
            {revenues?.length ?? 0}{' '}
            lançamentos
          </p>
        </div>

        <Button
          icon={<Plus size={16} />}
          onClick={() => setOpen(true)}
        >
          Novo lançamento
        </Button>
      </div>

      <div
        className="grid-2"
        style={{ marginBottom: 20 }}
      >
        <div className="card">
          <p className="card-title">
            Total recebido
          </p>

          <p
            className="card-value"
            style={{
              color:
                'var(--color-success)',
              fontSize: 24,
            }}
          >
            {formatBRL(totalReceived)}
          </p>
        </div>

        <div className="card">
          <p className="card-title">
            A receber
          </p>

          <p
            className="card-value"
            style={{
              color:
                'var(--color-warning)',
              fontSize: 24,
            }}
          >
            {formatBRL(totalPending)}
          </p>
        </div>
      </div>

      <div
        className="mode-toggle"
        style={{ marginBottom: 16 }}
      >
        {(
          [
            'all',
            'pending',
            'received',
          ] as const
        ).map(mode => (
          <button
            key={mode}
            className={`mode-btn ${
              filter === mode
                ? 'mode-btn--active'
                : ''
            }`}
            onClick={() =>
              setFilter(mode)
            }
          >
            {mode === 'all'
              ? 'Todos'
              : mode === 'pending'
                ? 'Pendentes'
                : 'Recebidos'}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <span className="empty-state-icon">
            <Receipt size={40} />
          </span>

          <p className="empty-state-title">
            Nenhum lançamento
            {filter !== 'all'
              ? ' nesse filtro'
              : ''}
          </p>

          <p className="empty-state-desc">
            Registre suas receitas
            para acompanhar o
            faturamento.
          </p>

          {filter === 'all' && (
            <Button
              onClick={() =>
                setOpen(true)
              }
              style={{
                marginTop: 8,
              }}
            >
              Criar primeiro
              lançamento
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

          {filtered.map(revenue => (
            <div
              key={revenue.id}
              className="table-row revenues-grid"
            >
              <div>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {revenue.description}
                </p>

                {revenue.nf_number && (
                  <p className="text-xs text-muted">
                    NF{' '}
                    {
                      revenue.nf_number
                    }
                  </p>
                )}
              </div>

              <span className="text-sm text-muted">
                {revenue.client
                  ?.name ?? '—'}
              </span>

              <span
                className="text-mono text-sm"
                style={{
                  fontWeight: 600,
                }}
              >
                {formatBRL(
                  revenue.value,
                )}
              </span>

              <span className="text-sm text-muted">
                {formatDate(
                  revenue.issue_date,
                )}
              </span>

              <RevenueStatusBadge
                status={revenue.status}
                dueDate={
                  revenue.due_date
                }
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {revenue.status ===
                  'pending' && (
                  <button
                    className="btn btn--ghost btn--icon btn--sm"
                    title="Marcar recebido"
                    onClick={() =>
                      handleMarkReceived(
                        revenue.id,
                      )
                    }
                    disabled={
                      markingId ===
                      revenue.id
                    }
                  >
                    <CheckCircle
                      size={14}
                      style={{
                        color:
                          'var(--color-success)',
                      }}
                    />
                  </button>
                )}

                <button
                  className="btn btn--ghost btn--icon btn--sm"
                  title="Remover"
                  onClick={() =>
                    remove.mutate(
                      revenue.id,
                    )
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo lançamento"
        wide
      >
        <RevenueForm
          clients={clients ?? []}
          onSubmit={async data => {
            await create.mutateAsync(
              data,
            )

            setOpen(false)
          }}
          onCancel={() =>
            setOpen(false)
          }
        />
      </Modal>
    </div>
  )
}