import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { LayoutComponent } from './layout.component';
import { SECOES, TODAS_AS_TELAS, agruparPorSecao, buscarTelas, normalizar, telaDoEndereco } from './navegacao';

describe('Navegação por seções (Central)', () => {
  it('o menu lateral e o catálogo de telas têm exatamente as mesmas telas', () => {
    TestBed.configureTestingModule({ imports: [LayoutComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { operador: () => ({ nome: 'Op', email: 'op@x' }) } }] });
    const layout = TestBed.createComponent(LayoutComponent).componentInstance;
    const doMenu = layout.grupos.flatMap(g => g.itens.map(i => `${g.id}|${i.url}`)).sort();
    const doCatalogo = TODAS_AS_TELAS.filter(t => t.noMenu).map(t => `${t.secao}|${t.url}`).sort();
    expect(doMenu).toEqual(doCatalogo);
  });

  it('as telas têm ids únicos, seção válida e as abas do financeiro têm consulta', () => {
    const ids = TODAS_AS_TELAS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TODAS_AS_TELAS.every(t => SECOES.some(s => s.id === t.secao))).toBeTrue();
    expect(TODAS_AS_TELAS.filter(t => t.consulta).every(t => t.url === '/financeiro')).toBeTrue();
  });

  it('agrupa por seção na ordem do menu', () => {
    expect(agruparPorSecao(TODAS_AS_TELAS).map(g => g.secao.id)).toEqual(['comercial', 'financeiro', 'operacao', 'catalogo', 'orientacoes', 'conta']);
    expect(agruparPorSecao(TODAS_AS_TELAS)[1].telas.map(t => t.rotulo)).toContain('Plano de contas');
  });

  it('a busca ignora acento e caixa, exige todas as palavras e usa sinônimos', () => {
    expect(normalizar('  Contratação ')).toBe('contratacao');
    expect(buscarTelas(TODAS_AS_TELAS, 'PLANO conta')[0].rotulo).toBe('Plano de contas');
    expect(buscarTelas(TODAS_AS_TELAS, 'dre').map(t => t.rotulo)).toContain('Demonstrativo do resultado do exercício');
    expect(buscarTelas(TODAS_AS_TELAS, 'assinatura').map(t => t.rotulo)).toContain('Contratações');
    expect(buscarTelas(TODAS_AS_TELAS, 'zzzz')).toEqual([]);
    expect(buscarTelas(TODAS_AS_TELAS, '  ')).toEqual([]);
  });

  it('quem começa com o termo vem antes de quem só contém', () => {
    expect(buscarTelas(TODAS_AS_TELAS, 'relatorio')[0].rotulo.toLowerCase()).toContain('relatório');
    expect(buscarTelas(TODAS_AS_TELAS, 'bancária')[0].rotulo).toBe('Contas bancárias');
  });

  it('acha a tela pelo endereço, com aba, subcaminho e sem correspondência', () => {
    expect(telaDoEndereco(TODAS_AS_TELAS, '/financeiro?aba=plano-de-contas')?.rotulo).toBe('Plano de contas');
    expect(telaDoEndereco(TODAS_AS_TELAS, '/financeiro')?.rotulo).toBe('Financeiro');
    expect(telaDoEndereco(TODAS_AS_TELAS, '/relatorios/despesas')?.rotulo).toBe('Relatório de despesas');
    expect(telaDoEndereco(TODAS_AS_TELAS, '/clientes/abc/editar')?.rotulo).toBe('Clientes');
    expect(telaDoEndereco(TODAS_AS_TELAS, '/rota-inexistente')).toBeNull();
  });
});
