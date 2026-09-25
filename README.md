# Central — painel do operador

Front Angular da **Central**: o painel onde o operador do SaaS cadastra
clientes, contrata aplicativos (Servire, academia, ...), gerencia planos,
adicionais e cobranças, acompanha o provisionamento e entra em suporte.

API: [`central-api-back`](https://github.com/GustavoToebe/central-api-back).
O desenho completo e o contrato com os aplicativos estão em
`central-api-back/docs/`.

## Estado atual

**Etapa 4 pronta (26/09/2026).** Todas as telas do painel sobre a API da
Central, com testes. Validado de ponta a ponta com Central + Servire rodando
juntos: contratação criada no painel vira paróquia no Servire, bloqueio chega
ao Servire pelo webhook, suporte abre a paróquia com código de uso único,
sessão renova pelo cookie com CSRF.

| Tela | Rota | O que faz |
|---|---|---|
| Login | `/login` | e-mail e senha do operador |
| Clientes | `/clientes`, `/clientes/novo`, `/clientes/:id`, `/clientes/:id/editar` | lista com busca; cadastro PF/PJ com endereço e contatos; detalhe com a grade de contratações |
| Contratações | `/contratacoes`, `/contratacoes/nova`, `/contratacoes/:id` | grade (aplicativo, instância, plano, situação, vencimento, provisionamento) com "Tentar novamente" em ERRO; nova contratação com adicionais; detalhe em abas |
| Detalhe da contratação | abas Resumo, Financeiro, Histórico | direitos enviados, edição de nome/slug/admin (só se `provisionamentoEditavel`), troca de plano, adicionais, bloquear/desbloquear/cancelar, entrar em suporte; cobranças, pagamento, estorno, isenção, cobranças adiantadas; histórico |
| Catálogo | `/catalogo/produtos`, `/recursos`, `/planos`, `/adicionais` | produtos (código `SERVIRE` + URL de integração), recursos, planos com limites e preços, adicionais |

Nada de dado de negócio dos apps (só contagens e o id da instância) e nenhum
segredo de integração no front.

## Como rodar

```bash
npm ci
npm start               # http://localhost:4200, API em http://localhost:8081
npm test                # Karma + Chrome headless
npm run build:prod
```

A API da Central precisa de `CORS_ALLOWED_ORIGINS` com a origem do painel.
O roteiro das duas APIs juntas está no README do `central-api-back`.

## Autenticação

- Access token (15 min) no `sessionStorage`; refresh só no cookie httpOnly
  `central_refresh_token` (path `/auth`), que o JS não lê.
- `centralAuthInterceptor`: `withCredentials`, Bearer fora de `/auth/`,
  `X-XSRF-TOKEN` nas escritas (lido do cookie `XSRF-TOKEN`, `core/auth/xsrf.ts`);
  um 401 faz **um** refresh compartilhado e repete a requisição; refresh que
  falha limpa a sessão e volta ao login.
- `authGuard`: sem token, tenta renovar pelo cookie antes de mandar ao login.
- Produção com painel e API em subdomínios: a API precisa de
  `CENTRAL_CSRF_COOKIE_DOMAIN` com o domínio pai, senão o painel não lê o
  `XSRF-TOKEN` e refresh/logout voltam 403. A URL da API de produção fica em
  `src/environments/environment.prod.ts`.
