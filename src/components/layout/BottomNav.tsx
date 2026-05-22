import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, Users, FileText, Calculator,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app',            label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/receitas',   label: 'Receitas',  icon: Receipt         },
  { to: '/app/clientes',   label: 'Clientes',  icon: Users           },
  { to: '/app/das',        label: 'DAS',       icon: FileText        },
  { to: '/app/calculadora',label: 'Calc.',     icon: Calculator      },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/app'}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
          }
        >
          <Icon size={22} className="bottom-nav-icon" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}