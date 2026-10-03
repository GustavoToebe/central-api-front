import { BancoCaixa, Demonstrativo, PorTipo } from './relatorios.models';
import { csvBancoCaixa, csvDemonstrativo, csvPorTipo, dataBr, montarCsv, numeroPtBr } from './relatorios-csv';

const porTipo: PorTipo = {
  de: '2026-10-01', ate: '2026-10-31', visao: 'REALIZADO', tipo: 'DESPESA', total: 55.5,
  grupos: [{ id: 'g', nome: 'Infraestrutura', comercial: false, total: 55.5, contas: [{
    id: 'c', nome: 'VPS', total: 55.5, lancamentos: [{ id: 'l', data: '2026-10-05', descricao: 'VPS; "outubro"', contaBanco: 'Banco Inter', valor: 55.5 }] }] }],
};

describe('CSV dos relatórios', () => {
  it('usa ponto e vírgula, vírgula decimal, BOM e aspas escapadas', () => {
    const csv = csvPorTipo(porTipo);
    expect(csv.startsWith('﻿')).toBeTrue();
    const linhas = csv.slice(1).split('\r\n');
    expect(linhas[0]).toBe('Grupo;Conta contábil;Data;Descrição;Conta/banco;Valor');
    expect(linhas[1]).toBe('Infraestrutura;VPS;05/10/2026;"VPS; ""outubro""";Banco Inter;55,50');
    expect(linhas[2]).toBe('Total;;;;;55,50');
  });

  it('formata número e data no padrão brasileiro e aceita nulos', () => {
    expect(numeroPtBr(1234.5)).toBe('1234,50');
    expect(numeroPtBr(-3)).toBe('-3,00');
    expect(dataBr('2026-01-09')).toBe('09/01/2026');
    expect(montarCsv([['a', null, 2]])).toBe('﻿a;;2');
  });

  it('banco/caixa traz saldo anterior, movimentos e totais por conta', () => {
    const b: BancoCaixa = {
      de: '2026-10-01', ate: '2026-10-31', saldoAnterior: 100, entradas: 30, saidas: 20, saldoFinal: 110, observacao: '', contas: [{
        id: 'c', nome: 'Caixa', ativo: true, saldoAnterior: 100, entradas: 30, saidas: 20, saldoFinal: 110,
        movimentos: [{ id: 'm', data: '2026-10-02', descricao: 'Doação', contaContabil: 'Doações', entrada: 30, saida: 0, saldo: 130 }] }],
    };
    const linhas = csvBancoCaixa(b).slice(1).split('\r\n');
    expect(linhas[1]).toBe('Caixa;;Saldo anterior;;;;100,00');
    expect(linhas[2]).toBe('Caixa;02/10/2026;Doação;Doações;30,00;0,00;130,00');
    expect(linhas.at(-1)).toBe('Todas as contas;;Total;;30,00;20,00;110,00');
  });

  it('demonstrativo lista receitas, despesas, resultado, previsto e saldos', () => {
    const receitas: PorTipo = { ...porTipo, tipo: 'RECEITA', total: 100, grupos: [{ id: 'r', nome: 'Serviços', comercial: false, total: 100, contas: [{ id: 'x', nome: 'Consultoria', total: 100, lancamentos: [] }] }] };
    const d: Demonstrativo = { de: '2026-10-01', ate: '2026-10-31', receitas, despesas: porTipo, totalReceitas: 100, totalDespesas: 55.5, resultado: 44.5,
      aReceber: 10, aPagar: 5, resultadoPrevisto: 49.5, saldos: [{ id: 'c', nome: 'Caixa', saldo: 144.5 }] };
    const csv = csvDemonstrativo(d);
    expect(csv).toContain('Receitas;Serviços;Consultoria;100,00');
    expect(csv).toContain('Total de despesas;;;55,50');
    expect(csv).toContain('Resultado do período;;;44,50');
    expect(csv).toContain('Resultado previsto;;;49,50');
    expect(csv).toContain('Saldo da conta;Caixa;;144,50');
  });
});
