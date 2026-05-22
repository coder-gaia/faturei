import { type HTMLAttributes, type ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?:    string
  elevated?: boolean
  children:  ReactNode
}

export function Card({ title, elevated, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`card ${elevated ? 'card--elevated' : ''} ${className}`}
      {...props}
    >
      {title && <p className="card-title">{title}</p>}
      {children}
    </div>
  )
}