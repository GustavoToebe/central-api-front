import { CelulaExportacao, exportarTabela, FormatoExportacao, TabelaExportacao } from '../comum/exportacao-tabela';
import { BancoCaixa, Demonstrativo, PorTipo } from './relatorios.models';
import { dataBr } from './relatorios-csv';
export type FormatoRelatorio = FormatoExportacao;

export function tabelaRelatorio(nome: string, titulo: string, r: PorTipo | BancoCaixa | Demonstrativo): TabelaExportacao {
  const linhas: CelulaExportacao[][] = []; let colunas: string[];
  if ('tipo' in r) {
    colunas = ['Grupo', 'Conta contábil', 'Data', 'Descrição', 'Conta/banco', 'Valor (R$)'];
    for (const g of r.grupos) for (const c of g.contas) for (const l of c.lancamentos) linhas.push([g.nome, c.nome, dataBr(l.data), l.descricao, l.contaBanco, l.valor]);
    linhas.push(['Total', '', '', '', '', r.total]);
  } else if ('contas' in r) {
    colunas = ['Conta/banco', 'Data', 'Descrição', 'Conta contábil', 'Entrada (R$)', 'Saída (R$)', 'Saldo (R$)'];
    for (const c of r.contas) {
      linhas.push([c.nome, '', 'Saldo anterior', '', null, null, c.saldoAnterior]);
      for (const m of c.movimentos) linhas.push([c.nome, dataBr(m.data), m.descricao, m.contaContabil, m.entrada, m.saida, m.saldo]);
      linhas.push([c.nome, '', 'Total da conta', '', c.entradas, c.saidas, c.saldoFinal]);
    }
    linhas.push(['Todas as contas', '', 'Total', '', r.entradas, r.saidas, r.saldoFinal]);
  } else {
    colunas = ['Seção', 'Grupo', 'Conta contábil', 'Valor (R$)'];
    for (const [secao, bloco] of [['Receitas', r.receitas], ['Despesas', r.despesas]] as const) {
      for (const g of bloco.grupos) for (const c of g.contas) linhas.push([secao, g.nome, c.nome, c.total]);
      linhas.push([`Total de ${secao.toLowerCase()}`, '', '', bloco.total]);
    }
    linhas.push(['Resultado do período', '', '', r.resultado], ['A receber (previsto)', '', '', r.aReceber], ['A pagar (previsto)', '', '', r.aPagar], ['Resultado previsto', '', '', r.resultadoPrevisto]);
    for (const s of r.saldos) linhas.push(['Saldo da conta', s.nome, '', s.saldo]);
  }
  return { nome, titulo: `Central · ${titulo}`, contexto: `Período: ${dataBr(r.de)} a ${dataBr(r.ate)}${'visao' in r ? ` · ${r.visao === 'REALIZADO' ? 'Realizado' : 'Previsto'}` : ''}`, colunas, linhas, dadosJson: r, limiteLinhas: 20000 };
}

export async function exportarRelatorio(nome: string, titulo: string, formato: FormatoRelatorio, dados: PorTipo | BancoCaixa | Demonstrativo, ativo: () => boolean): Promise<void> {
  await exportarTabela(tabelaRelatorio(nome, titulo, dados), formato, ativo);
}
