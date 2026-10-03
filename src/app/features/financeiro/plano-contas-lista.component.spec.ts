import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanoContasListaComponent } from './plano-contas-lista.component';
import { Categoria } from './financeiro.models';

const g = (id: string, nome: string, tipo: 'RECEITA' | 'DESPESA', ativo = true): Categoria => ({ id, nome, ativo, tipo, grupoId: null, ehGrupo: true });
const c = (id: string, nome: string, grupo: Categoria, ativo = true): Categoria => ({ id, nome, ativo, tipo: grupo.tipo, grupoId: grupo.id, ehGrupo: false });

describe('Plano de contas em árvore (Central)', () => {
  let fixture: ComponentFixture<PlanoContasListaComponent>;
  const infra = g('1', 'Infraestrutura', 'DESPESA');
  const servicos = g('2', 'Receitas de serviços', 'RECEITA');
  const lista = [infra, servicos, c('a', 'VPS', infra), c('b', 'Banco de dados', infra), c('d', 'Antiga', infra, false), c('r', 'Consultoria', servicos)];
  const texto = () => fixture.nativeElement.textContent as string;
  const clicar = (seletor: string) => { (fixture.nativeElement.querySelector(seletor) as HTMLElement).click(); fixture.detectChanges(); };
  const contas = () => Array.from(fixture.nativeElement.querySelectorAll('[data-conta]') as NodeListOf<HTMLElement>);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PlanoContasListaComponent] }).compileComponents();
    fixture = TestBed.createComponent(PlanoContasListaComponent);
    fixture.componentRef.setInput('categorias', lista);
    fixture.detectChanges();
  });

  it('separa despesas e receitas, e os grupos começam recolhidos', () => {
    expect(texto()).toContain('Despesas (débito)');
    expect(texto()).toContain('Receitas (crédito)');
    expect(texto()).toContain('Infraestrutura');
    expect(texto()).toContain('2 conta(s) contábil(is)');
    expect(contas().length).toBe(0);
  });

  it('expandir um grupo mostra só as contas ativas; "Todos" inclui as inativas', () => {
    clicar('[data-grupo] button');
    expect(contas().map(e => e.querySelector('td')!.textContent!.trim())).toEqual(['Banco de dados', 'VPS']);
    fixture.componentInstance.situacao.set('TODOS');
    fixture.detectChanges();
    expect(contas().length).toBe(3);
    fixture.componentInstance.situacao.set('INATIVO');
    fixture.detectChanges();
    expect(texto()).toContain('Antiga');
    expect(texto()).not.toContain('VPS');
  });

  it('a busca ignora acento e caixa e abre o grupo da conta encontrada', () => {
    fixture.componentInstance.busca.set('CONSULTORIA');
    fixture.detectChanges();
    expect(texto()).toContain('Consultoria');
    expect(texto()).not.toContain('VPS');
    fixture.componentInstance.busca.set('zzz');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-secao-vazia]').length).toBe(2);
  });

  it('emite as ações de grupo, conta e novo grupo', () => {
    const emitidos: string[] = [];
    fixture.componentInstance.editarGrupo.subscribe(x => emitidos.push('grupo:' + x.nome));
    fixture.componentInstance.novaConta.subscribe(x => emitidos.push('nova:' + x.nome));
    fixture.componentInstance.novoGrupo.subscribe(t => emitidos.push('novo:' + t));
    const botoes = fixture.nativeElement.querySelectorAll('[data-grupo] .bo-btn-ghost') as NodeListOf<HTMLElement>;
    botoes[0].click();
    botoes[1].click();
    fixture.componentRef.setInput('categorias', []);
    fixture.detectChanges();
    (fixture.nativeElement.querySelectorAll('[data-secao-vazia] button')[0] as HTMLElement).click();
    expect(emitidos).toEqual(['grupo:Infraestrutura', 'nova:Infraestrutura', 'novo:DESPESA']);
  });
});
