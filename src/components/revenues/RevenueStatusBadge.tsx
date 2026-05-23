import { Badge } from '../ui/Badge'

interface Props {
  status: string
  dueDate?: string | null
}

export function RevenueStatusBadge({
  status,
  dueDate,
}: Props) {
  if (status === 'received') {
    return (
      <Badge variant="success">
        Recebido
      </Badge>
    )
  }

  const isOverdue =
    status === 'overdue' ||
    (
      dueDate &&
      new Date(`${dueDate}T00:00:00`) <
        new Date()
    )

  if (isOverdue) {
    return (
      <Badge variant="danger">
        Vencido
      </Badge>
    )
  }

  return (
    <Badge variant="warning">
      Pendente
    </Badge>
  )
}