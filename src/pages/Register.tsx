import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'

export default function Register() {
  const { signUp }  = useAuth()
  const navigate    = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== password2) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
      navigate('/onboarding')
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('already registered')) {
        setError('Este email já está cadastrado.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-brand">Faturei</h1>
          <p className="auth-subtitle">Crie sua conta grátis</p>
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>
          )}

          <Button type="submit" loading={loading} full>
            Criar conta
          </Button>
        </form>

        <p className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </p>
      </div>
    </div>
  )
}