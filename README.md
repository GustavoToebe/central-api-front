# Central — painel do operador

Front Angular da **Central**: o painel onde o operador do SaaS cadastra
clientes, contrata aplicativos (Servire, academia, ...), gerencia planos,
adicionais e cobranças, acompanha o provisionamento e entra em suporte.

API: [`central-api-back`](https://github.com/GustavoToebe/central-api-back).
O desenho completo e o contrato com os aplicativos estão em
`central-api-back/docs/`.

## Estado atual

**Etapa 0 — desenho.** Ainda não há código. Este front é a etapa 4 do plano.

## Telas previstas

- Login do operador.
- Clientes (lista e cadastro PF/PJ).
- Contratações do cliente: grade Aplicativo / Instância / Plano / Situação /
  Vencimento, com situação do provisionamento e botão "Tentar novamente".
- Produtos, recursos, planos, preços e adicionais.
- Cobranças e pagamentos (manual, PIX), reaproveitando as telas de
  financeiro que hoje estão no `servire-api-front`.
- Entrar em suporte numa instância.
- Histórico de alterações.
