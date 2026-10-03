import { BancoCaixa, Demonstrativo, PorTipo } from './relatorios.models';

export type CelulaCsv = string | number | null;

/** Número no formato brasileiro (vírgula decimal, sem separador de milhar) para abrir certo no Excel/Sheets em português. */
export function numeroPtBr(n: number): string { return n.toFixed(2).replace('.', ','); }

function celula(v: CelulaCsv): string {
  const t = v === null ? '' : String(v);
  return /[;"\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

/** CSV com ponto e vírgula e BOM (o Excel brasileiro abre acentos e colunas corretamente). */
export function montarCsv(linhas: CelulaCsv[][]): string {
  return '﻿' + linhas.map(l => l.map(celula).join(';')).join('\r\n');
}

export function dataBr(iso: string): string { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; }

export function csvPorTipo(r: PorTipo): string {
  const linhas: CelulaCsv[][] = [['Grupo', 'Conta contábil', 'Data', 'Descrição', 'Conta/banco', 'Valor']];
  for (const g of r.grupos) for (const c of g.contas) for (const l of c.lancamentos) linhas.push([g.nome, c.nome, dataBr(l.data), l.descricao, l.contaBanco, numeroPtBr(l.valor)]);
  linhas.push(['Total', '', '', '', '', numeroPtBr(r.total)]);
  return montarCsv(linhas);
}

export function csvBancoCaixa(r: BancoCaixa): string {
  const linhas: CelulaCsv[][] = [['Conta/banco', 'Data', 'Descrição', 'Conta contábil', 'Entrada', 'Saída', 'Saldo']];
  for (const c of r.contas) {
    linhas.push([c.nome, '', 'Saldo anterior', '', '', '', numeroPtBr(c.saldoAnterior)]);
    for (const m of c.movimentos) linhas.push([c.nome, dataBr(m.data), m.descricao, m.contaContabil, numeroPtBr(m.entrada), numeroPtBr(m.saida), numeroPtBr(m.saldo)]);
    linhas.push([c.nome, '', 'Total da conta', '', numeroPtBr(c.entradas), numeroPtBr(c.saidas), numeroPtBr(c.saldoFinal)]);
  }
  linhas.push(['Todas as contas', '', 'Total', '', numeroPtBr(r.entradas), numeroPtBr(r.saidas), numeroPtBr(r.saldoFinal)]);
  return montarCsv(linhas);
}

export function csvDemonstrativo(d: Demonstrativo): string {
  const linhas: CelulaCsv[][] = [['Seção', 'Grupo', 'Conta contábil', 'Valor']];
  for (const [secao, bloco] of [['Receitas', d.receitas], ['Despesas', d.despesas]] as const) {
    for (const g of bloco.grupos) for (const c of g.contas) linhas.push([secao, g.nome, c.nome, numeroPtBr(c.total)]);
    linhas.push([`Total de ${secao.toLowerCase()}`, '', '', numeroPtBr(bloco.total)]);
  }
  linhas.push(['Resultado do período', '', '', numeroPtBr(d.resultado)]);
  linhas.push(['A receber (previsto)', '', '', numeroPtBr(d.aReceber)]);
  linhas.push(['A pagar (previsto)', '', '', numeroPtBr(d.aPagar)]);
  linhas.push(['Resultado previsto', '', '', numeroPtBr(d.resultadoPrevisto)]);
  for (const s of d.saldos) linhas.push(['Saldo da conta', s.nome, '', numeroPtBr(s.saldo)]);
  return montarCsv(linhas);
}

/** Baixa o texto como arquivo .csv pelo navegador. */
export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = nomeArquivo; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
