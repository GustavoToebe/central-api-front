# AGENTS.md — central-api-front

Front Angular da **Central** (painel do operador do SaaS). A API é o irmão
**`central-api-back`** (outro git); desenho, decisões e contrato com os
aplicativos ficam em `central-api-back/docs/`. Idioma da interface, do código
e dos commits: **português**.

## Manter este arquivo atualizado
Arquivo de instruções compartilhado entre ferramentas de IA; o `CLAUDE.md`
só importa este (`@AGENTS.md`). Edite **só aqui**. Manter curto.

Commits vão direto na `main` (decisão de 25/09/2026).

## Regras
- O painel é só do operador do SaaS; nunca exibe dado de negócio dos apps
  (nomes de pessoas etc.), só contagens.
- Nada de segredo de integração no front.
- Stack e convenções seguem o `servire-api-front` (reaproveitar as telas de
  financeiro/planos que hoje estão lá).
