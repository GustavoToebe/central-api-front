# Financeiro da operação SaaS

Rota protegida `/financeiro`, menu Comercial → Financeiro. Usa CentralApiService e controles existentes. Permite contas/bancos, plano de contas (aba Plano de contas, antes Categorias: grupos e contas contábeis em árvore, só a conta contábil recebe lançamento), despesas e outras receitas, filtros, paginação, baixa, estorno e cancelamento com confirmação.

O mês completo abre por padrão para incluir provisões futuras. Assinaturas aparecem automaticamente no resumo, sem lançamentos duplicados; o link Cobranças permite administrar a origem. Saldo por conta é dos lançamentos manuais, pois cobrança ainda não tem conta bancária vinculada. A receber/a pagar usam vencimento no período; realizado usa data de pagamento. Valores são sempre em reais, incluindo estimativas de serviços em dólar.

Contrato, cálculos e limitações: `central-api-back/docs/financeiro-operacional.md` no repositório irmão. Não há recorrência automática de despesas nem conciliação bancária.
