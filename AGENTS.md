# AGENTS.md — central-api-front

Front Angular da **Central** (painel do operador do SaaS). A API é o irmão
**`central-api-back`** (outro git); desenho, decisões e contrato com os
aplicativos ficam em `central-api-back/docs/`. Idioma da interface, do código
e dos commits: **português**.

## Manter este arquivo atualizado
Arquivo de instruções compartilhado entre ferramentas de IA; o `CLAUDE.md`
só importa este (`@AGENTS.md`). Edite **só aqui**. Manter curto.

Nesta tarefa, commits usam `melhoria/ecossistema-sem-ia`, conforme solicitação do usuário.

## Stack
Angular 21 (standalone, control flow `@if/@for`, `input()` com
`withComponentInputBinding`), Tailwind 3, Karma + Jasmine. Mesma base do
`servire-api-front`. Visual preto e vermelho do backoffice antigo do Servirea
(classes `bo-*` em `src/styles.scss`).

## Estrutura
- `core/api/` — `central.models.ts` (espelho dos DTOs do back), `CentralApiService`
  (todas as rotas), `api-error.ts` (`mensagemApi`, `codigoApi`).
- `core/auth/` — sessão, `AuthService`, `centralAuthInterceptor`, `authGuard`, `xsrf.ts`.
- `core/layout/` — moldura com menu lateral.
- `features/comum/rotulos.ts` — funções puras: rótulos, cores, formatação e as regras
  de botão (`podeTentarNovamente`, `podeEditarProvisionamento`...).
- `features/*/*.form.ts` — montagem das requisições (funções puras, com spec).
- `features/perfil/` — "Meu perfil" (link no nome, no topo): troca da própria senha.
- `features/comum/numero.component.ts` — `<app-numero [numero]="x.sequencial" />`: número curto "(2108)" que copia ao
  clicar. Só no detalhe (ou no título do formulário de edição, quando a edição é na mesma página). A lista mostra só o nome.
- Datas: nunca `type="date"`/`type="month"` nativo. `app-campo-data` (ngModel ISO, tela `DD/MM/AAAA`),
  `app-campo-competencia` (ngModel `AAAA-MM`, tela `MM/AAAA`, sem nome de mês) e, em filtro, `app-periodo`
  (`[(de)]`/`[(ate)]` + `(aplicado)`, com períodos prontos). Painéis abrem no `body` (`painel-flutuante.ts`).
  Filtro por competência já vem com o mês atual.
- Campo de senha sempre com o olho: `<div class="relative"><input #s type="password" class="bo-field pr-11"><app-olho-senha [campo]="s" /></div>`.
- `features/cobrancas/` — tela Cobranças e os modais `app-pagamento-modal` e `app-cobranca-detalhe-modal`,
  usados também na aba Financeiro da contratação.
- `features/comum/` do padrão de telas: `app-cabecalho-pagina`, `app-barra-filtros`, `Selecao` (`selecao.ts`),
  `app-estado-lista`, `app-select-busca`, `app-rodape-form` e `app-modal`. Menu lateral recolhível no desktop
  (`localStorage` `central.menuRecolhido`). `CentralApiService.produtos()` fica em cache; salvar produto invalida.
- `features/comum/formatos.ts` (+ `mascara.directive.ts`, `cep.service.ts`) — máscara e validação de
  CPF/CNPJ (inclusive alfanumérico), CEP, UF, telefone e e-mail; CEP pelo ViaCEP via `fetch` (nunca
  pelo HttpClient: o interceptor mandaria token e cookies para fora). Mesmas regras do `web/Formatos`
  da API; mudou uma, muda a outra.

## Padrão de telas (estrutura do SIN+, cores da Central)
- Lista = `app-cabecalho-pagina` (ação principal em `[acoes]`) + `app-barra-filtros` (busca, Opções com as ações sobre os
  marcados, Buscar e a seta ▾ que abre o painel de filtros) + `.bo-table-wrap > .bo-table-rolagem > table.bo-table` +
  `app-estado-lista`. Linha com `clicavel`, `tabindex="0"`, clique/Enter abre o registro; checkbox, link e botão da linha
  usam `$event.stopPropagation()`.
- Formulário = seções com título e linha fina + `app-rodape-form` (Cancelar à esquerda, Salvar à direita).
- Opção longa (cliente, por exemplo) = `app-select-busca`; lista curta continua `<select>`.
- Modal = `app-modal` (Esc, foco preso, rodapé `[rodape]`).
- Desempenho: `OnPush` + `markForCheck()` depois de cada carga, `track` por id, nada que crie array no template,
  debounce de 300 ms em busca que vai à API.

## Design: os 3 pilares (todos os apps)
Detalhe, tabelas e valores em `docs/design-system.md`. Leia antes de mexer em tela. A cor da marca muda por app; o resto não.
- **Cor com significado:** verde = positivo (ativo, PAGA, criada no app); âmbar = atenção (TRIAL, pendente, ABERTA); vermelho = problema ou destrutivo (BLOQUEADA, VENCIDA, erro, excluir); cinza = encerrado (cancelada, inativo, isenta). Marca (`var(--brand)`) nunca diz status. Status sempre em micro-badge **com texto**.
- **Blocos:** tudo em cartão (16px, borda fina, `blur(12px)`); a ficha é feita de blocos pequenos, cada um com seus botões.
- **SaaS limpo:** micro-badge 11px caixa-alta com fundo translúcido e borda fina; tabela com cabeçalho de 45px, linha de 55px ou mais e hover realçado.
- Marca só por variável (`--brand`...), nunca hex. Ação destrutiva: botão de perigo + diálogo do sistema.

## Regras
- O painel nunca exibe dado de negócio dos apps (nomes de pessoas etc.), só contagens.
- Nada de segredo de integração no front.
- Regra de negócio fica no back; o front decide só o que mostrar. Ex.: o formulário de
  nome/slug/admin segue `provisionamentoEditavel` da API e trata `409 PROVISIONAMENTO_NAO_EDITAVEL`.
- Rota nova da API: método no `CentralApiService` + caso no spec (URL, método, corpo).
- `[name]` com `ngModel` não vira atributo HTML; em teste de navegador, ache o campo pelo rótulo.
- Confirmação é painel na própria tela, nunca `confirm()`/`alert()` do navegador.
- Antes de commitar: `npm test` e `npm run build:prod` verdes.

## Segurança e CI

- `core/auth/destino-api.ts` compara origem e fronteira do caminho antes de anexar Bearer, cookies e XSRF. Não substituir por `startsWith` na URL completa.
- Pull requests executam testes e build; publicação só na `main`. Testes Angular antes do build de produção.
- Depois de mexer em `CentralApiService`, rode `python scripts/verificar-contrato-api.py` ([contrato da API](docs/contrato-api.md)).

## Fontes e estado verificável

- [Estado local](docs/estado-projeto.json) e [índice](docs/README.md). Histórico e plano não definem a versão implantada; precedência em [fontes e retomada](docs/desenvolvimento/fontes-e-retomada.md).
- Rode `python scripts/verificar-docs.py` ao mudar docs, schema ou migrations e atualize o estado junto.
- Trabalhar na branch autorizada pelo usuário (`melhoria/ecossistema-sem-ia` nesta etapa). Publicação depende do fluxo e da autorização vigentes; commit e push não são implantação.

## Regras por funcionalidade

| Área | Documento | Regra que não pode ser quebrada |
|---|---|---|
| MFA do operador | [mfa](docs/mfa.md) | Segredo e códigos só em memória e limpos ao destruir; sem QR por serviço externo; erro de confirmação não renova nem repete a requisição |
| Financeiro operacional | [financeiro](docs/financeiro.md) | Provisões por vencimento, realizado por baixa; saldo por conta só manual |
| Consumo e instâncias | [consumo-instancias](docs/consumo-instancias.md), [historico-consumo](docs/historico-consumo.md), [painel-instancias](docs/painel-instancias.md) | Consulta sob demanda; sem dado de pessoas; ausência nunca é zero; atualização manual limitada |
| Ajuda | [ajuda](docs/ajuda.md) | Conteúdo estático; `tema` só com IDs do catálogo |
| Navegação | [testes-navegacao](docs/testes-navegacao.md) | Rotas e guards cobertos por teste |
