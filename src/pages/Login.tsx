import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setError('Email ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-brand">Faturei</h1>
          <p className="auth-subtitle">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>
          )}

          <Button type="submit" loading={loading} full>
            Entrar
          </Button>
        </form>

        <p className="auth-footer">
          Não tem conta?{' '}
          <Link to="/cadastro" className="auth-link">Criar conta grátis</Link>
        </p>

        <div className="auth-divider"><span>ou</span></div>

        <Link to="/" className="auth-demo-link">
          Ver demonstração sem cadastro →
        </Link>
      </div>
    </div>
  )
}