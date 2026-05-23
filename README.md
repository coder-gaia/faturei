# Faturei

Plataforma de gestão financeira para MEIs brasileiros. Controle de faturamento, DAS e projeção de desenquadramento — tudo em um dashboard limpo e intuitivo.

🔗 **[Demo ao vivo](https://faturei.vercel.app)** — substitua pela URL real após o deploy

---

## Por que esse projeto existe

O Brasil tem mais de 15 milhões de MEIs. A maioria controla as finanças no caderninho, no Excel, ou simplesmente não controla. O maior risco de um MEI em crescimento é o **desenquadramento involuntário** — ultrapassar o limite anual de faturamento (R$ 81.000) sem perceber, perdendo os benefícios do Simples Nacional.

O Faturei resolve isso com uma abordagem direta: um dashboard que mostra em tempo real quanto você faturou, quanto ainda pode faturar com segurança, e quando o DAS vence. Sem complexidade desnecessária.

---

## Funcionalidades

### Landing Page

- Dashboard de demonstração com dados fictícios — o usuário entende o produto antes de criar conta
- CTA de cadastro integrado à experiência de demo

### Dashboard `/app`

- Barra de progresso do faturamento anual vs. limite de R$ 81.000
- **Engine de projeção**: calcula a tendência do ano e avisa se o ritmo atual vai ultrapassar o limite
- Card "Você ainda pode faturar" com estimativa de meses restantes
- Status do DAS do mês corrente com indicador visual
- Gráfico de área: faturamento real + projeção + linha do limite anual
- Gráfico de barras: faturamento mês a mês
- **SmartAlerts**: notificações automáticas para DAS vencendo, receitas em atraso e proximidade do limite

### Receitas `/app/receitas`

- Listagem com filtros por status (todos / pendentes / recebidos)
- Criação de lançamentos com ou sem cliente vinculado
- **Edição inline**: clique em qualquer receita para editar valor, cliente, data de vencimento e descrição
- Marcar como recebido direto do modal de edição
- Resumo de total recebido e a receber

### Clientes `/app/clientes`

- Cadastro com **busca automática por CNPJ** via Brasil API
- Total faturado por cliente calculado automaticamente
- Remoção com confirmação

### DAS `/app/das`

- Grid visual dos 12 meses do ano
- Marcar mês como pago com data de pagamento
- Desfazer pagamento quando necessário
- Alertas de vencimento e inadimplência
- Resumo: meses pagos, valor mensal, total pago no ano

### Calculadora `/app/calculadora`

- Calcula o valor/hora, valor/dia e valor por projeto
- Considera DAS automaticamente baseado no tipo de atividade do usuário
- Avisa se a renda desejada implica em risco de desenquadramento
- Breakdown visual do faturamento bruto necessário

### Relatórios `/app/relatorios`

- Filtro por mês ou ano inteiro
- Resumo de recebido, pendente e DAS pagos
- **Exportação em PDF** formatada para entrega ao contador

### Configurações `/app/configuracoes`

- Edição de nome, nome fantasia, CNPJ e tipo de atividade
- Troca de atividade recalcula o DAS automaticamente

---

## Decisões de arquitetura

### Supabase como backend completo

Autenticação, banco de dados PostgreSQL e Row Level Security — cada usuário só acessa seus próprios dados, garantido no nível do banco, não só no frontend.

```sql
-- Exemplo de RLS: cada usuário só vê seus próprios dados
CREATE POLICY "users_own_data" ON revenues
  USING (auth.uid() = user_id);
```

**Zero cold start.** O Supabase é always-on, sem o problema do Render/Railway no plano gratuito.

### React Query para cache e sincronização

Todas as operações de dados passam pelo TanStack Query. O cache é invalidado automaticamente após cada mutação — criar uma receita atualiza o dashboard em tempo real sem reload.

```ts
const create = useMutation({
  mutationFn: async (form) => {
    /* insert no Supabase */
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ["revenues"] }),
});
```

### Engine de projeção

O coração diferencial do produto. Calcula a tendência de faturamento baseada na média dos meses já passados e projeta os meses restantes — sem depender de nenhuma API externa.

```ts
const monthlyAverage = totalReceived / monthsElapsed;
const projectedTotal = totalReceived + monthlyAverage * monthsRemaining;
const willExceed = projectedTotal > MEI.ANNUAL_LIMIT;
```

Essa projeção alimenta o gráfico, o card de capacidade disponível e os SmartAlerts — tudo a partir de um único cálculo memoizado.

### SmartAlerts baseados nos dados já carregados

Os alertas são gerados com `useMemo` a partir dos dados já em cache — nenhuma requisição adicional. A lógica avalia três condições: DAS vencendo em 5 dias ou menos, receitas com `due_date` passado sem `status === 'received'`, e projeção acima de 80% do limite.

### Skeleton screens

Substituem spinners em todas as páginas. Gerados no formato exato do conteúdo real, com animação de shimmer via CSS puro — sem biblioteca adicional.

### Onboarding de 4 passos

Primeira experiência após o cadastro: nome → CNPJ (com busca automática) → tipo de atividade → confirmação. Ao finalizar, gera automaticamente os 12 registros de DAS do ano corrente.

---

## Stack

| Tecnologia            | Uso                                           |
| --------------------- | --------------------------------------------- |
| React 18 + TypeScript | UI e tipagem                                  |
| Vite                  | Build e dev server                            |
| React Router DOM v6   | Roteamento e rotas protegidas                 |
| Supabase              | Auth + PostgreSQL + RLS                       |
| TanStack Query        | Cache, sincronização e mutações               |
| Recharts              | Gráficos do dashboard                         |
| Framer Motion         | Animações e transições de página              |
| jsPDF                 | Exportação de relatório em PDF                |
| Lucide React          | Ícones                                        |
| Brasil API            | Consulta de CNPJ (gratuita, sem autenticação) |

**Zero backend próprio. Zero cold start. Deploy estático no frontend, dados no Supabase.**

---

## Estrutura do projeto

```
src/
├── components/
│   ├── ui/              # Button, Input, Card, Badge, Modal, Spinner, Skeleton
│   ├── layout/          # Sidebar, Header, BottomNav, PageTransition
│   ├── dashboard/       # RevenueProgressBar, SafeZoneCard, DASStatusCard,
│   │                    # ProjectionChart, MonthlyBarChart, SmartAlerts
│   ├── revenues/        # RevenueForm, RevenueEditModal, RevenueStatusBadge
│   └── clients/         # ClientForm
├── hooks/
│   ├── useAuth.tsx      # Contexto de autenticação + Supabase session
│   ├── useRevenues.ts   # CRUD de receitas + React Query
│   ├── useClients.ts    # CRUD de clientes
│   ├── useDAS.ts        # Controle de DAS mensal
│   └── useProjection.ts # Memoização da engine de projeção
├── pages/               # Landing, Login, Register, Onboarding,
│                        # Dashboard, Revenues, Clients, DAS,
│                        # Calculator, Reports, Settings, NotFound
├── services/
│   ├── supabase.ts      # Client configurado
│   └── cnpjService.ts   # Brasil API
├── utils/
│   ├── projectionEngine.ts  # Cálculo de tendência e projeção anual
│   ├── dasCalculator.ts     # Geração de DAS e cálculo de status
│   ├── formatters.ts        # formatBRL, formatDate, formatCNPJ...
│   └── demoData.ts          # Dados fictícios da Landing
└── constants/
    ├── mei.ts           # Limite anual, valores DAS, nomes dos meses
    └── colors.ts        # Tokens de cor espelhados em JS
```

---

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/faturei.git
cd faturei

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Rode o schema SQL no Supabase SQL Editor (arquivo schema.sql na raiz)

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## Deploy

**Frontend:** Vercel — conecte o repositório GitHub e clique em Deploy. A Vercel detecta o Vite automaticamente.

**Backend:** Supabase — já está hospedado. Apenas configure as variáveis de ambiente na Vercel com as mesmas credenciais do `.env`.

---

## Constantes MEI (2025)

```ts
ANNUAL_LIMIT: R$ 81.000,00
DAS_DUE_DAY: 20 (todo mês)

Atividade de Serviços:  R$ 80,90/mês
Atividade de Comércio:  R$ 76,90/mês
Ambas as atividades:    R$ 81,90/mês
```

---

## Autor

Desenvolvido por **Alexandre Gaia** — desenvolvedor Full Stack.

📧 alexandregaia.dev@gmail.com · 🔗 [alexandregaia.netlify.app](https://alexandregaia.netlify.app) · 💼 [linkedin.com/in/alexandre-gaia](https://linkedin.com/in/alexandre-gaia)
