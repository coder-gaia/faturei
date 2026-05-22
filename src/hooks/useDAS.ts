import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { DASPayment } from '../types'

export function useDAS(year = new Date().getFullYear()) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['das', user?.id, year],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('das_payments')
        .select('*')
        .eq('user_id', user!.id)
        .eq('year', year)
        .order('month')
      if (error) throw error
      return data as DASPayment[]
    },
  })

  const markPaid = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase
        .from('das_payments')
        .update({ status: 'paid', paid_date: date })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['das'] }),
  })

  const markUnpaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('das_payments')
        .update({ status: 'pending', paid_date: null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['das'] }),
  })

  return { ...query, markPaid, markUnpaid }
}