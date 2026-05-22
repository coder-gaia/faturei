import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
  hint?:     string
  required?: boolean
  mono?:     boolean
  suffix?:   ReactNode  // botão ou ícone ao lado direito
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  required,
  mono,
  suffix,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="form-group">
      {label && (
        <label className={`form-label ${required ? 'form-label--required' : ''}`}>
          {label}
        </label>
      )}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          ref={ref}
          className={[
            'form-input',
            mono ? 'form-input--mono' : '',
            error ? 'form-input--error' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {suffix}
      </div>

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  )
})

Input.displayName = 'Input'