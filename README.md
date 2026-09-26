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
| Contratações | `/contratacoes`, `/contratacoes/nova`, `/contratacoes/:id` | grade (aplicativo, instância, plano, situação, vencimento, provisionamento) com "Tentar novamente" em ERRO; cancelada que nunca chegou ao app aparece como "Não enviada"; nova contratação com adicionais; detalhe em abas |
| Detalhe da contratação | abas Resumo, Financeiro, Histórico | direitos enviados, edição de nome/slug/admin (só se `provisionamentoEditavel`), troca de plano, adicionais, bloquear/desbloquear/cancelar, entrar em suporte; cobranças com competência `10/2026`, botão "Pagar" (modal), detalhe da cobrança ao clicar, estorno, isenção, cobranças adiantadas com competência inicial e final; histórico |
| Cobranças | `/cobrancas` | todas as cobranças com filtros (cliente/instância, produto, situação, forma, competência, vencimento); pagar várias de clientes diferentes no mesmo modal; detalhe com plano e adicionais |
| Catálogo | `/catalogo/produtos`, `/recursos`, `/planos`, `/adicionais` | produtos (código `SERVIRE` + URL de integração), recursos (limite com valor padrão), planos com preço por periodicidade no próprio cadastro e recursos adicionados um a um, adicionais |

Cadastro de cliente com máscara e validação (CPF para PF, CNPJ para PJ, inclusive alfanumérico;
CEP, UF, telefone e e-mail dos contatos) e endereço preenchido pelo CEP (ViaCEP). Mesmas regras de
`web/Formatos` da API, que grava tudo formatado (26/09/2026).

Nada de dado de negócio dos apps (só contagens e o id da instância) e nenhum
segredo de integração no front.

## Como rodar

```bash
npm ci
npm start -- --port 4201   # http://localhost:4201 (a 4200 fica com o front do Servire); API em http://localhost:8081
npm test                # Karma + Chrome headless
npm run build:prod
```

A API da Central precisa de `CORS_ALLOWED_ORIGINS` com a origem do painel
(`http://localhost:4201`). O roteiro completo no PC (banco no Docker, variáveis das duas APIs,
login do operador, comando para dar pull nos quatro repositórios, problemas já vistos) está no
README do `central-api-back`, seção "Ponta a ponta local (Windows, tudo no PC)".

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
