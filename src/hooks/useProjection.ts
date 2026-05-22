import { useMemo } from 'react'
import { calculateProjection } from '../utils/projectionEngine'
import type { Revenue } from '../types'

export function useProjection(revenues: Revenue[] | undefined) {
  return useMemo(
    () => calculateProjection(revenues ?? []),
    [revenues]
  )
}