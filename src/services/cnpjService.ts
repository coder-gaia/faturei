/**
 * Consulta dados de um CNPJ via Brasil API.
 * Gratuita, sem necessidade de autenticação.
 */
export async function fetchCNPJ(cnpj: string) {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) throw new Error('CNPJ inválido')

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
  if (!res.ok) throw new Error('CNPJ não encontrado ou inativo')

  const data = await res.json()

  // Normaliza o retorno para o formato que o app usa
  return {
    name:  data.razao_social ?? data.nome_fantasia ?? '',
    email: data.email ?? '',
    phone: data.ddd_telefone_1
      ? data.ddd_telefone_1.replace(/\D/g, '')
      : '',
    city:  data.municipio ?? '',
    state: data.uf ?? '',
  }
}

/**
 * Consulta endereço por CEP via ViaCEP.
 */
export async function fetchCEP(cep: string) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) throw new Error('CEP inválido')

  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
  const data = await res.json()
  if (data.erro) throw new Error('CEP não encontrado')

  return {
    city:  data.localidade ?? '',
    state: data.uf ?? '',
  }
}