import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Users, FileText, Calculator, BarChart2, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/app',              label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/app/receitas',     label: 'Receitas',    icon: Receipt         },
  { to: '/app/clientes',     label: 'Clientes',    icon: Users           },
  { to: '/app/das',          label: 'DAS',         icon: FileText        },
  { to: '/app/calculadora',  label: 'Calculadora', icon: Calculator      },
  { to: '/app/relatorios',   label: 'Relatórios',  icon: BarChart2       },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-brand-name">Faturei</p>
        <p className="sidebar-brand-sub">{profile?.business_name ?? profile?.full_name ?? '—'}</p>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
            <Icon size={18} className="sidebar-link-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/app/configuracoes"
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}>
          <Settings size={18} className="sidebar-link-icon" />
          Configurações
        </NavLink>
        <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', marginTop: 4 }} onClick={handleSignOut}>
          <LogOut size={18} className="sidebar-link-icon" />
          Sair
        </button>
      </div>
    </aside>
  )
}