/**
 * Dados fictícios para a Landing Page.
 * Simula a conta da "Maria Souza", MEI de design gráfico.
 */

export const DEMO_USER = {
  full_name: 'Maria Souza',
  business_name: 'Maria Souza Design',
  cnpj: '12.345.678/0001-99',
  activity_type: 'servicos' as const,
}

export const DEMO_CLIENTS = [
  { id: '1', name: 'Agência Criativa Ltda',   cnpj: '11.222.333/0001-44' },
  { id: '2', name: 'Tech Solutions S.A.',      cnpj: '55.666.777/0001-88' },
  { id: '3', name: 'Boutique Rosa Moda',       cnpj: '99.888.777/0001-66' },
]

// Simula um ano onde Maria está em julho, com bom faturamento
export const DEMO_REVENUES = [
  { id: 'r1',  client_id: '1', description: 'Identidade Visual',    value: 4_200, status: 'received', received_date: '2025-01-15', issue_date: '2025-01-10' },
  { id: 'r2',  client_id: '2', description: 'UI Design - App',       value: 6_800, status: 'received', received_date: '2025-01-28', issue_date: '2025-01-20' },
  { id: 'r3',  client_id: '1', description: 'Posts Instagram',       value: 1_500, status: 'received', received_date: '2025-02-10', issue_date: '2025-02-05' },
  { id: 'r4',  client_id: '3', description: 'Catálogo de Produtos',  value: 3_200, status: 'received', received_date: '2025-02-22', issue_date: '2025-02-18' },
  { id: 'r5',  client_id: '2', description: 'Landing Page',          value: 5_500, status: 'received', received_date: '2025-03-14', issue_date: '2025-03-10' },
  { id: 'r6',  client_id: '1', description: 'Redesign Logo',         value: 2_800, status: 'received', received_date: '2025-03-30', issue_date: '2025-03-25' },
  { id: 'r7',  client_id: '3', description: 'Embalagens Produto',    value: 4_100, status: 'received', received_date: '2025-04-18', issue_date: '2025-04-12' },
  { id: 'r8',  client_id: '2', description: 'Design System',         value: 8_900, status: 'received', received_date: '2025-04-29', issue_date: '2025-04-20' },
  { id: 'r9',  client_id: '1', description: 'Material Impresso',     value: 1_900, status: 'received', received_date: '2025-05-16', issue_date: '2025-05-10' },
  { id: 'r10', client_id: '3', description: 'Lookbook Verão',        value: 3_600, status: 'received', received_date: '2025-05-28', issue_date: '2025-05-22' },
  { id: 'r11', client_id: '2', description: 'Ícones Customizados',   value: 2_400, status: 'received', received_date: '2025-06-12', issue_date: '2025-06-08' },
  { id: 'r12', client_id: '1', description: 'Apresentação Pitch',    value: 4_700, status: 'received', received_date: '2025-06-25', issue_date: '2025-06-20' },
  // Julho: uma recebida, uma pendente
  { id: 'r13', client_id: '3', description: 'Campanha Inverno',      value: 5_200, status: 'received', received_date: '2025-07-10', issue_date: '2025-07-05' },
  { id: 'r14', client_id: '2', description: 'Consultoria UX',        value: 3_800, status: 'pending',  received_date: null,         issue_date: '2025-07-18', due_date: '2025-07-31' },
]

export const DEMO_DAS = [
  { month: 1,  status: 'paid',    paid_date: '2025-01-18', value: 80.90 },
  { month: 2,  status: 'paid',    paid_date: '2025-02-15', value: 80.90 },
  { month: 3,  status: 'paid',    paid_date: '2025-03-19', value: 80.90 },
  { month: 4,  status: 'paid',    paid_date: '2025-04-17', value: 80.90 },
  { month: 5,  status: 'paid',    paid_date: '2025-05-16', value: 80.90 },
  { month: 6,  status: 'paid',    paid_date: '2025-06-18', value: 80.90 },
  { month: 7,  status: 'pending', paid_date: null,         value: 80.90 }, // vence em 3 dias
  { month: 8,  status: 'pending', paid_date: null,         value: 80.90 },
  { month: 9,  status: 'pending', paid_date: null,         value: 80.90 },
  { month: 10, status: 'pending', paid_date: null,         value: 80.90 },
  { month: 11, status: 'pending', paid_date: null,         value: 80.90 },
  { month: 12, status: 'pending', paid_date: null,         value: 80.90 },
]