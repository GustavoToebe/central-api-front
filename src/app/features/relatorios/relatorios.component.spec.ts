import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { RelatoriosComponent } from './relatorios.component';
import { RelatorioFinanceiroComponent } from './relatorio-financeiro.component';
import { BancoCaixa, CATALOGO_RELATORIOS, Demonstrativo, PorTipo } from './relatorios.models';

describe('Relatórios — central', () => {
  let fixture: ComponentFixture<RelatoriosComponent>;
  const texto = () => fixture.nativeElement.textContent as string;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RelatoriosComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(RelatoriosComponent);
    fixture.detectChanges();
  });

  it('lista os quatro relatórios financeiros em cartões', () => {
    expect(CATALOGO_RELATORIOS.map(r => r.id).sort()).toEqual(['banco-caixa', 'demonstrativo', 'despesas', 'receitas']);
    expect(texto()).toContain('Relatório de banco/caixa');
    expect(texto()).toContain('Demonstrativo do resultado do exercício');
    expect(texto()).toContain('Relatório de despesas');
    expect(texto()).toContain('Relatório de receitas');
    expect(fixture.nativeElement.querySelectorAll('[data-relatorio]').length).toBe(4);
  });

  it('pesquisa ignorando acento e caixa; sem resultado mostra a mensagem', () => {
    fixture.componentInstance.busca.set('RESULTADO');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-relatorio]').length).toBe(1);
    expect(texto()).toContain('Demonstrativo');
    fixture.componentInstance.busca.set('zzz');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-sem-resultado]')).not.toBeNull();
  });

  it('a categoria recolhe e expande', () => {
    (fixture.nativeElement.querySelector('[data-categoria] button') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-relatorio]').length).toBe(0);
    (fixture.nativeElement.querySelector('[data-categoria] button') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-relatorio]').length).toBe(4);
  });
});

describe('Relatório financeiro — tela', () => {
  let api: jasmine.SpyObj<CentralApiService>;
  const porTipo: PorTipo = {
    de: '2026-10-01', ate: '2026-10-31', visao: 'REALIZADO', tipo: 'DESPESA', total: 50,
    grupos: [{ id: 'g', nome: 'Infraestrutura', comercial: false, total: 50, contas: [{ id: 'c', nome: 'VPS', total: 50, lancamentos: [{ id: 'l', data: '2026-10-05', descricao: 'VPS de outubro', contaBanco: 'Caixa', valor: 50 }] }] }],
  };
  const banco: BancoCaixa = {
    de: '2026-10-01', ate: '2026-10-31', saldoAnterior: 100, entradas: 0, saidas: 50, saldoFinal: 50, observacao: 'Cobranças de assinaturas não têm vínculo bancário.',
    contas: [{ id: 'cx', nome: 'Caixa', ativo: true, saldoAnterior: 100, entradas: 0, saidas: 50, saldoFinal: 50,
      movimentos: [{ id: 'm', data: '2026-10-05', descricao: 'VPS de outubro', contaContabil: 'VPS', entrada: 0, saida: 50, saldo: 50 }] }],
  };
  const demo: Demonstrativo = {
    de: '2026-10-01', ate: '2026-10-31', receitas: { ...porTipo, tipo: 'RECEITA', total: 0, grupos: [] }, despesas: porTipo, totalReceitas: 0, totalDespesas: 50,
    resultado: -50, aReceber: 0, aPagar: 0, resultadoPrevisto: -50, saldos: [{ id: 'cx', nome: 'Caixa', saldo: 50 }],
  };

  async function montar(tipo: string) {
    api = jasmine.createSpyObj('CentralApiService', ['relatorioPorTipo', 'relatorioBancoCaixa', 'relatorioDemonstrativo', 'contasFinanceiras']);
    api.relatorioPorTipo.and.returnValue(of(porTipo));
    api.relatorioBancoCaixa.and.returnValue(of(banco));
    api.relatorioDemonstrativo.and.returnValue(of(demo));
    api.contasFinanceiras.and.returnValue(of([{ id: 'cx', nome: 'Caixa', saldoInicial: 100, dataSaldoInicial: '2026-01-01', ativo: true }]));
    await TestBed.configureTestingModule({
      imports: [RelatorioFinanceiroComponent],
      providers: [provideRouter([]), { provide: CentralApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ tipo })), snapshot: {} } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(RelatorioFinanceiroComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('despesas: gera na abertura, mostra grupo, conta e lançamento, e pede a visão realizada', async () => {
    const fixture = await montar('despesas');
    const t = fixture.nativeElement.textContent as string;
    expect(api.relatorioPorTipo).toHaveBeenCalledWith('despesas', jasmine.any(String), jasmine.any(String), 'REALIZADO');
    expect(t).toContain('Infraestrutura');
    expect(t).toContain('VPS de outubro');
    expect(t).toContain('R$50.00');
    expect((fixture.nativeElement.querySelector('[data-csv]') as HTMLButtonElement).disabled).toBeFalse();
  });

  it('banco/caixa: carrega as contas para o filtro e mostra saldo anterior e a observação', async () => {
    const fixture = await montar('banco-caixa');
    const t = fixture.nativeElement.textContent as string;
    expect(api.contasFinanceiras).toHaveBeenCalled();
    expect(api.relatorioBancoCaixa).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), undefined);
    expect(t).toContain('Saldo anterior');
    expect(t).toContain('não têm vínculo bancário');
    expect(fixture.nativeElement.querySelectorAll('[data-conta-banco]').length).toBe(1);
  });

  it('período invertido não chama a API e mostra o erro', async () => {
    const fixture = await montar('demonstrativo');
    expect(fixture.nativeElement.textContent).toContain('Resultado do período');
    api.relatorioDemonstrativo.calls.reset();
    fixture.componentInstance.de = '2026-10-31';
    fixture.componentInstance.ate = '2026-10-01';
    await fixture.componentInstance.gerar();
    fixture.detectChanges();
    expect(api.relatorioDemonstrativo).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-erro]').textContent).toContain('período válido');
    expect(fixture.componentInstance.temDados()).toBeFalse();
  });

  it('relatório desconhecido mostra o aviso e nada é consultado', async () => {
    const fixture = await montar('inexistente');
    expect(fixture.nativeElement.textContent).toContain('Relatório não encontrado');
    expect(api.relatorioPorTipo).not.toHaveBeenCalled();
    expect(api.relatorioDemonstrativo).not.toHaveBeenCalled();
  });
});
