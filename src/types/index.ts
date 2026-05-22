// ── Database types ──────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  cnpj: string | null
  business_name: string | null
  activity_type: 'servicos' | 'comercio' | 'ambos' | null
  das_value: number | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface Revenue {
  id: string
  user_id: string
  client_id: string | null
  description: string
  value: number
  issue_date: string
  due_date: string | null
  received_date: string | null
  status: 'pending' | 'received' | 'overdue'
  nf_number: string | null
  notes: string | null
  created_at: string
  // join
  client?: Client | null
}

export interface DASPayment {
  id: string
  user_id: string
  year: number
  month: number
  value: number
  due_date: string
  paid_date: string | null
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
}

// ── Form types ───────────────────────────────────────────────

export interface RevenueFormData {
  client_id: string
  description: string
  value: string
  issue_date: string
  due_date: string
  nf_number: string
  notes: string
}

export interface ClientFormData {
  name: string
  cnpj: string
  email: string
  phone: string
  city: string
  state: string
}

export interface OnboardingFormData {
  full_name: string
  cnpj: string
  business_name: string
  activity_type: 'servicos' | 'comercio' | 'ambos'
}