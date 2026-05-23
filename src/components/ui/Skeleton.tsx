import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?:  string | number
  height?: string | number
  radius?: string
  style?:  CSSProperties
}

export function Skeleton({ width = '100%', height = 16, radius = '6px', style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

// Card skeleton — imita um card com título + valor + linha
export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton width="40%" height={12} style={{ marginBottom: 14 }} />
      <Skeleton width="65%" height={28} style={{ marginBottom: 10 }} />
      <Skeleton width="50%" height={10} />
    </div>
  )
}

// Skeleton de linha de tabela
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  const widths = ['40%', '25%', '20%', '15%', '10%']
  return (
    <div className="table-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} width={widths[i] ?? '20%'} height={14} />
      ))}
    </div>
  )
}

// Dashboard skeleton completo
export function DashboardSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Skeleton width="200px" height={30} style={{ marginBottom: 8 }} />
        <Skeleton width="260px" height={16} />
      </div>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="card">
        <Skeleton width="180px" height={14} style={{ marginBottom: 16 }} />
        <Skeleton height={220} radius="8px" />
      </div>
    </div>
  )
}