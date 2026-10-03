# Relatórios financeiros

Rota protegida `/relatorios` (menu Comercial → Relatórios): cartões por categoria com pesquisa por título e descrição. Cada cartão abre `/relatorios/:tipo` com período (`de` e `até`), **Gerar relatório**, **Imprimir** e **Baixar CSV**. Só lê dados; nada é gravado.

Relatórios: **banco/caixa** (por conta/banco: saldo anterior, entradas, saídas, saldo corrido e final), **demonstrativo do resultado do exercício** (receitas e despesas por grupo e conta contábil, resultado, previsto e saldos), **despesas** e **receitas** (por grupo e conta contábil, com os lançamentos; escolha entre realizado, pela data da baixa, e previsto, pelo vencimento).

Impressão pelo diálogo do navegador, com folha de estilo própria (fundo branco, sem menu). CSV com ponto e vírgula, vírgula decimal e BOM, para abrir certo no Excel brasileiro. Para incluir um relatório novo, acrescente o item em `CATALOGO_RELATORIOS` (`features/relatorios/relatorios.models.ts`) e o endpoint no back.

Contrato, cálculos e limites: `central-api-back/docs/financeiro-operacional.md` (seção Relatórios) no repositório irmão.
