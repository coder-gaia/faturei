import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { Revenue, RevenueFormData } from '../types'

export function useRevenues() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['revenues', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenues')
        .select('*, client:clients(id, name)')
        .eq('user_id', user!.id)
        .order('issue_date', { ascending: false })
      if (error) throw error
      return data as Revenue[]
    },
  })

  const create = useMutation({
    mutationFn: async (form: RevenueFormData) => {
      const { error } = await supabase.from('revenues').insert({
        user_id:       user!.id,
        client_id:     form.client_id || null,
        description:   form.description,
        value:         parseFloat(form.value),
        issue_date:    form.issue_date,
        due_date:      form.due_date || null,
        nf_number:     form.nf_number || null,
        notes:         form.notes || null,
        status:        'pending',
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['revenues'] }),
  })

  const markReceived = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase
        .from('revenues')
        .update({ status: 'received', received_date: date })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['revenues'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('revenues').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['revenues'] }),
  })

  return { ...query, create, markReceived, remove }
}

export function useRevenueUpdate() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ client_id: string | null; value: number; due_date: string | null; description: string; nf_number: string | null }> }) => {
      const { error } = await supabase
        .from('revenues')
        .update(data)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['revenues'] }),
  })
}