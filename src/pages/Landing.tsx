import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { calculateProjection } from '../utils/projectionEngine'
import { formatBRL, formatPercent } from '../utils/formatters'
import { DEMO_REVENUES, DEMO_DAS, DEMO_USER } from '../utils/demoData'
import { MEI } from '../constants/mei'
import type { Revenue } from '../types'
import type {
  ValueType
} from 'recharts/types/component/DefaultTooltipContent'
import { COLORS } from '../constants/colors'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

// Projeção com dados demo (referência: julho de 2025)
const DEMO_DATE    = new Date(2025, 6, 17)
const projection   = calculateProjection(DEMO_REVENUES as Revenue[], DEMO_DATE)
const chartData    = projection.monthlyData.map(m => ({
  name:       m.label,
  real:       m.cumulative       || undefined,
  projetado:  m.projectedCumulative,
}))

const tooltipFormatter = (value?: ValueType) =>
  typeof value === 'number'
    ? formatBRL(value)
    : String(value ?? '')

export default function Landing() {
  return (
    <div className="landing">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="landing-nav">
        <span className="landing-nav-brand">Faturei</span>
        <div className="landing-nav-links">
          <Link to="/login"   className="btn btn--ghost btn--sm">Entrar</Link>
          <Link to="/cadastro" className="btn btn--primary btn--sm">Criar conta grátis</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="landing-badge">Para MEIs brasileiros</span>
          <h1 className="landing-title">
            Seu faturamento<br />
            <span className="landing-title-accent">sob controle.</span>
          </h1>
          <p className="landing-subtitle">
            Acompanhe receitas, controle o DAS e saiba exatamente quanto
            ainda pode faturar no ano — sem risco de desenquadramento.
          </p>
          <div className="landing-cta-group">
            <Link to="/cadastro" className="btn btn--primary btn--lg">
              Começar grátis →
            </Link>
            <span className="landing-cta-hint">Sem cartão de crédito</span>
          </div>
        </motion.div>
      </section>

      {/* ── Demo banner ───────────────────────────────────── */}
      <div className="demo-banner">
        <span className="demo-banner-dot" />
        Demonstração ao vivo — dados fictícios de {DEMO_USER.business_name}
        <Link to="/cadastro" className="demo-banner-link">Ver os meus dados →</Link>
      </div>

      {/* ── Demo dashboard ────────────────────────────────── */}
      <section className="demo-section">
        <div className="demo-grid">

          {/* Card: progresso do limite */}
          <motion.div
            className="card demo-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="card-title">Faturamento anual 2025</p>
            <p className="card-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatBRL(projection.totalReceived)}
            </p>
            <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
              de {formatBRL(MEI.ANNUAL_LIMIT)} permitidos
            </p>
            <div className="progress-track">
              <div
                className="progress-fill progress-fill--blue"
                style={{ width: `${Math.min(projection.percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-sm" style={{ marginTop: 8, color: COLORS.blueLight }}>
              {formatPercent(projection.percentUsed)} utilizado
            </p>
          </motion.div>

          {/* Card: capacidade restante */}
          <motion.div
            className="card demo-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="card-title">Você ainda pode faturar</p>
            <p className="card-value" style={{ color: COLORS.success, fontFamily: 'var(--font-mono)' }}>
              {formatBRL(projection.remainingCapacity)}
            </p>
            <p className="text-sm text-muted" style={{ marginTop: 8 }}>
              com segurança em 2025
            </p>
            {projection.isAtRisk && (
              <div className="demo-alert demo-alert--warning">
                ⚠ Projeção indica risco de desenquadramento
              </div>
            )}
          </motion.div>

          {/* Card: DAS */}
          <motion.div
            className="card demo-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="card-title">DAS — julho 2025</p>
            <p className="card-value" style={{ fontFamily: 'var(--font-mono)' }}>
              R$ 80,90
            </p>
            <div className="demo-das-status">
              <span className="badge badge--warning">Vence em 3 dias</span>
            </div>
            <div className="demo-das-grid">
              {DEMO_DAS.map(d => (
                <div
                  key={d.month}
                  className={`demo-das-dot ${d.status === 'paid' ? 'demo-das-dot--paid' : d.month === 7 ? 'demo-das-dot--current' : ''}`}
                  title={`${MEI.MONTH_NAMES[d.month - 1]}: ${d.status === 'paid' ? 'pago' : 'pendente'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted" style={{ marginTop: 6 }}>
              6/12 meses pagos
            </p>
          </motion.div>

          {/* Gráfico de projeção */}
          <motion.div
            className="card demo-card demo-card--wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="card-title">Projeção de faturamento 2025</p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              {projection.willExceed
                ? `⚠ No ritmo atual, você ultrapassará o limite em ${formatBRL(projection.projectedExcess)}`
                : `✓ No ritmo atual, você encerrará o ano em ${formatBRL(projection.projectedTotal)}`
              }
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.blueLight} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS.blueLight} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: COLORS.gray2, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
                  formatter={tooltipFormatter}
                  labelStyle={{ color: COLORS.gray1 }}
                />
                <ReferenceLine y={MEI.ANNUAL_LIMIT} stroke={COLORS.danger} strokeDasharray="4 3" label={{ value: 'Limite', fill: COLORS.danger, fontSize: 11 }} />
                <Area type="monotone" dataKey="real"      stroke={COLORS.blue}      fill="url(#gradReal)" strokeWidth={2} dot={false} name="Realizado" />
                <Area type="monotone" dataKey="projetado" stroke={COLORS.blueLight} fill="url(#gradProj)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Projetado" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="landing-features">
        {[
          { icon: '📊', title: 'Projeção inteligente', desc: 'Saiba em tempo real quanto pode faturar sem risco de perder o MEI.' },
          { icon: '🔍', title: 'Busca de CNPJ', desc: 'Cadastre clientes automaticamente digitando só o CNPJ.' },
          { icon: '📅', title: 'Controle de DAS', desc: 'Nunca mais esqueça o boleto mensal. Acompanhe os 12 meses do ano.' },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            className="card feature-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
          >
            <span className="feature-icon">{f.icon}</span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="landing-final-cta">
        <h2 className="landing-final-title">Pronto para começar?</h2>
        <p className="landing-final-sub">Grátis, sem cartão de crédito, sem complicação.</p>
        <Link to="/cadastro" className="btn btn--primary btn--lg">
          Criar minha conta →
        </Link>
      </section>

      <footer className="landing-footer">
        <p>Faturei · Feito para MEIs brasileiros</p>
      </footer>
    </div>
  )
}