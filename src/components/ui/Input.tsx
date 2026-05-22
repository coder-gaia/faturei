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

      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          className={[
          'form-input',
          mono ? 'form-input--mono' : '',
          error ? 'form-input--error' : '',
          className,
          ].join(' ')}
          style={{
            paddingRight: suffix ? '44px' : undefined,
          }}
          {...props}
          />
        {suffix && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
        {suffix}
        </div>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  )
})

Input.displayName = 'Input'