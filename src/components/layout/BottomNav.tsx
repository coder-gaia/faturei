import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, Users, FileText, BarChart2 } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app',            label: 'Início',    icon: LayoutDashboard, end: true },
  { to: '/app/receitas',   label: 'Receitas',  icon: Receipt         },
  { to: '/app/clientes',   label: 'Clientes',  icon: Users           },
  { to: '/app/das',        label: 'DAS',       icon: FileText        },
  { to: '/app/relatorios', label: 'Relatórios',icon: BarChart2       },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`}>
          <Icon size={22} className="bottom-nav-icon" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}