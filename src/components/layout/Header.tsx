import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/app':               'Dashboard',
  '/app/receitas':      'Receitas',
  '/app/clientes':      'Clientes',
  '/app/das':           'DAS',
  '/app/calculadora':   'Calculadora',
  '/app/relatorios':    'Relatórios',
  '/app/configuracoes': 'Configurações',
}

export function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Faturei'

  return (
    <header className="mobile-header">
      <span className="mobile-header-brand">Faturei</span>
      <span style={{ fontSize: 14, color: 'var(--color-gray-2)' }}>{title}</span>
    </header>
  )
}