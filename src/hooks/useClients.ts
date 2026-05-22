import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { Client, ClientFormData } from '../types'

export function useClients() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['clients', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name')
      if (error) throw error
      return data as Client[]
    },
  })

  const create = useMutation({
    mutationFn: async (form: ClientFormData) => {
      const { error } = await supabase.from('clients').insert({
        user_id: user!.id,
        name:    form.name,
        cnpj:    form.cnpj  || null,
        email:   form.email || null,
        phone:   form.phone || null,
        city:    form.city  || null,
        state:   form.state || null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  return { ...query, create, remove }
}