import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Sidebar }        from './components/layout/Sidebar'
import { Header }         from './components/layout/Header'
import { BottomNav }      from './components/layout/BottomNav'
import { PageTransition } from './components/layout/PageTransition'
import { DashboardSkeleton } from './components/ui/Skeleton'

import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard  from './pages/Dashboard'
import Revenues   from './pages/Revenues'
import Clients    from './pages/Clients'
import DAS        from './pages/DAS'
import Calculator from './pages/Calculator'
import Reports    from './pages/Reports'
import Settings   from './pages/Settings'
import NotFound   from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
})

function ProtectedRoute() {
  const { isAuthenticated, loading, hasProfile } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><DashboardSkeleton /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasProfile)      return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="app-main"><Outlet /></main>
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/cadastro"  element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app"                element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/app/receitas"       element={<PageTransition><Revenues /></PageTransition>} />
          <Route path="/app/clientes"       element={<PageTransition><Clients /></PageTransition>} />
          <Route path="/app/das"            element={<PageTransition><DAS /></PageTransition>} />
          <Route path="/app/calculadora"    element={<PageTransition><Calculator /></PageTransition>} />
          <Route path="/app/relatorios"     element={<PageTransition><Reports /></PageTransition>} />
          <Route path="/app/configuracoes"  element={<PageTransition><Settings /></PageTransition>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}