export const MEI = {
  ANNUAL_LIMIT: 81_000,
  WARNING_THRESHOLD: 0.8,
  CRITICAL_THRESHOLD: 0.95,

  DAS: {
    INSS: 75.90,
    ISS: 5.00,
    ICMS: 1.00,
  },

  ACTIVITY_TYPES: {
    servicos: { label: 'Prestação de Serviços', das: 80.90 },
    comercio: { label: 'Comércio / Indústria',  das: 76.90 },
    ambos:    { label: 'Serviços + Comércio',   das: 81.90 },
  },

  DAS_DUE_DAY: 20,

  MONTH_NAMES: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
} as const

export type ActivityType = keyof typeof MEI.ACTIVITY_TYPES