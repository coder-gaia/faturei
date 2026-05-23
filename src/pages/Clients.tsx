import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { useRevenues } from '../hooks/useRevenues'
import { ClientForm } from '../components/clients/ClientForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import {
  formatBRL,
  formatCNPJ,
} from '../utils/formatters'
import {
  Trash2,
  Plus,
  Building2,
} from 'lucide-react'

export default function Clients() {
  const {
    data: clients,
    isLoading,
    create,
    remove,
  } = useClients()

  const { data: revenues } = useRevenues()

  const [open, setOpen] = useState(false)

  function totalByClient(clientId: string) {
    return (
      revenues
        ?.filter(
          r =>
            r.client_id === clientId &&
            r.status === 'received',
        )
        .reduce((s, r) => s + r.value, 0) ?? 0
    )
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
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">
            Clientes
          </h1>

          <p className="page-subtitle">
            {clients?.length ?? 0} clientes cadastrados
          </p>
        </div>

        <Button
          icon={<Plus size={16} />}
          onClick={() => setOpen(true)}
        >
          Novo cliente
        </Button>
      </div>

      {!clients?.length ? (
        <div className="empty-state">
          <span className="empty-state-icon">
            <Building2 size={40} />
          </span>

          <p className="empty-state-title">
            Nenhum cliente ainda
          </p>

          <p className="empty-state-desc">
            Adicione seus clientes para vinculá-los às receitas.
          </p>

          <Button
            onClick={() => setOpen(true)}
            style={{ marginTop: 8 }}
          >
            Adicionar primeiro cliente
          </Button>
        </div>
      ) : (
        <div className="table-wrapper">
          <div
            className="table-header-row"
            style={{
              gridTemplateColumns:
                '2fr 1.5fr 1fr 1fr auto',
            }}
          >
            <span>Nome</span>
            <span>CNPJ</span>
            <span>Cidade</span>
            <span>Total recebido</span>
            <span></span>
          </div>

          {clients.map(client => (
            <div
              key={client.id}
              className="table-row"
              style={{
                gridTemplateColumns:
                  '2fr 1.5fr 1fr 1fr auto',
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {client.name}
                </p>

                {client.email && (
                  <p className="text-xs text-muted">
                    {client.email}
                  </p>
                )}
              </div>

              <span className="text-mono text-sm">
                {client.cnpj
                  ? formatCNPJ(client.cnpj)
                  : '—'}
              </span>

              <span className="text-sm text-muted">
                {client.city
                  ? `${client.city}/${client.state}`
                  : '—'}
              </span>

              <span
                className="text-mono text-sm"
                style={{
                  color: 'var(--color-success)',
                }}
              >
                {formatBRL(
                  totalByClient(client.id),
                )}
              </span>

              <button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={() =>
                  remove.mutate(client.id)
                }
                title="Remover"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo cliente"
      >
        <ClientForm
          onSubmit={async data => {
            await create.mutateAsync(data)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  )
}