import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { signUp }  = useAuth()
  const navigate    = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
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
        console.error(err)

        if (err instanceof Error) {
          setError(err.message)
      } else {
          setError('Erro desconhecido')
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
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
              }}
              >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            }
          />

          <Input
            label="Confirmar senha"
            type={showPassword2 ? 'text' : 'password'}
            placeholder="Repita a senha"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword2(prev => !prev)}
                style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
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