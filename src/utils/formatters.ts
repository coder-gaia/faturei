/**
 * Formata um valor numérico como moeda BRL.
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma string de data ISO ou Date para dd/mm/yyyy.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata CNPJ: 00000000000000 → 00.000.000/0001-00
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').slice(0, 14)
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

/**
 * Remove formatação do CNPJ: 00.000.000/0001-00 → 00000000000100
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Valida CNPJ (algoritmo oficial).
 */
export function isValidCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, '')
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false

  const calc = (s: string, n: number) => {
    let sum = 0
    let pos = n - 7
    for (let i = n; i >= 1; i--) {
      sum += parseInt(s[n - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }

  return (
    calc(c, 12) === parseInt(c[12]) &&
    calc(c, 13) === parseInt(c[13])
  )
}


export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '').slice(0, 11)
  if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
}

/**
 * Retorna o ano e mês atual.
 */
export function getCurrentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/**
 * Converte percentual para exibição com 1 casa decimal.
 * Ex: 67.333... → "67,3%"
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}