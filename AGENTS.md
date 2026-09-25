# AGENTS.md — central-api-front

Front Angular da **Central** (painel do operador do SaaS). A API é o irmão
**`central-api-back`** (outro git); desenho, decisões e contrato com os
aplicativos ficam em `central-api-back/docs/`. Idioma da interface, do código
e dos commits: **português**.

## Manter este arquivo atualizado
Arquivo de instruções compartilhado entre ferramentas de IA; o `CLAUDE.md`
só importa este (`@AGENTS.md`). Edite **só aqui**. Manter curto.

Commits vão direto na `main` (decisão de 25/09/2026).

## Stack
Angular 21 (standalone, control flow `@if/@for`, `input()` com
`withComponentInputBinding`), Tailwind 3, Karma + Jasmine. Mesma base do
`servire-api-front`. Visual preto e vermelho do backoffice antigo do Servire
(classes `bo-*` em `src/styles.scss`).

## Estrutura
- `core/api/` — `central.models.ts` (espelho dos DTOs do back), `CentralApiService`
  (todas as rotas), `api-error.ts` (`mensagemApi`, `codigoApi`).
- `core/auth/` — sessão, `AuthService`, `centralAuthInterceptor`, `authGuard`, `xsrf.ts`.
- `core/layout/` — moldura com menu lateral.
- `features/comum/rotulos.ts` — funções puras: rótulos, cores, formatação e as regras
  de botão (`podeTentarNovamente`, `podeEditarProvisionamento`...).
- `features/*/*.form.ts` — montagem das requisições (funções puras, com spec).

## Regras
- O painel nunca exibe dado de negócio dos apps (nomes de pessoas etc.), só contagens.
- Nada de segredo de integração no front.
- Regra de negócio fica no back; o front decide só o que mostrar. Ex.: o formulário de
  nome/slug/admin segue `provisionamentoEditavel` da API e trata `409 PROVISIONAMENTO_NAO_EDITAVEL`.
- Rota nova da API: método no `CentralApiService` + caso no spec (URL, método, corpo).
- `[name]` com `ngModel` não vira atributo HTML; em teste de navegador, ache o campo pelo rótulo.
- Antes de commitar: `npm test` e `npm run build:prod` verdes.
