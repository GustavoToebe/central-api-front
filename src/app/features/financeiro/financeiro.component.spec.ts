import { provideRouter } from '@angular/router';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FinanceiroComponent } from './financeiro.component';
import { FinanceiroApiService } from './financeiro-api.service';
import { Movimento, Pagina } from './financeiro.models';

describe('Financeiro operacional da Central', () => {
  let fixture: ComponentFixture<FinanceiroComponent>;
  let api: jasmine.SpyObj<FinanceiroApiService>;
  beforeEach(async () => {
    api = jasmine.createSpyObj('FinanceiroApiService', ['contas','categorias','listar','resumo','salvarConta','salvarCategoria','salvarMovimento','baixar','acao']);
    api.contas.and.resolveTo([{ id:'c',nome:'Caixa',saldoInicial:100,dataSaldoInicial:'2026-01-01',ativo:true }]);
    api.categorias.and.resolveTo([{ id:'g',nome:'Doações',ativo:true }]);
    api.listar.and.resolveTo({ itens:[],total:0,pagina:0,tamanho:30 });
    api.resumo.and.resolveTo({ de:'2026-01-01',ate:'2026-01-31',receitas:50,despesas:20,resultado:30,saldoTotal:130,receitasCobrancas:30,receitasManuais:20,receberPrevisto:200,pagarPrevisto:89.9,resultadoPrevisto:140.1,contas:[{ id:'c',nome:'Caixa',saldo:130 }] });
    await TestBed.configureTestingModule({ imports:[FinanceiroComponent], providers:[provideRouter([]),
      { provide:FinanceiroApiService,useValue:api }
    ] }).compileComponents();
    fixture = TestBed.createComponent(FinanceiroComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
  });
  it('mostra provisões, assinaturas automáticas e limitação do saldo por conta', () => {
    expect(fixture.nativeElement.textContent).toContain('Provisões do período');
    expect(fixture.nativeElement.textContent).toContain('não as cadastre novamente');
    expect(fixture.nativeElement.textContent).toContain('não têm conta bancária vinculada');
    fixture.componentInstance.abrirMovimento(); expect(fixture.componentInstance.movimentoForm.tipo).toBe('DESPESA');
  });
  it('cancelamento exige confirmação e voltar não envia operação', async () => {
    const promessa=fixture.componentInstance.acao({id:'m',versao:0} as Movimento,'cancelar');
    expect(api.acao).not.toHaveBeenCalled(); expect(fixture.componentInstance.confirmacao).not.toBeNull();
    fixture.componentInstance.responderConfirmacao(false); await promessa;
    expect(api.acao).not.toHaveBeenCalled();
  });
  it('falha de carga limpa saldo antigo e expõe erro com opção de tentar novamente', async () => {
    api.resumo.and.rejectWith(new Error('Sem conexão'));
    await fixture.componentInstance.carregar(); fixture.detectChanges();
    expect(fixture.componentInstance.resumo).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Sem conexão');
  });
  it('resposta atrasada não sobrescreve a busca mais nova', async () => {
    let entregar!: (pagina: Pagina) => void;
    api.listar.and.returnValue(new Promise<Pagina>(resolve => entregar = resolve));
    const antiga = fixture.componentInstance.carregar();
    const m = { id:'novo',descricao:'Resultado novo' } as Movimento;
    api.listar.and.resolveTo({ itens:[m],total:1,pagina:0,tamanho:30 });
    await fixture.componentInstance.carregar();
    entregar({ itens:[],total:0,pagina:0,tamanho:30 }); await antiga;
    expect(fixture.componentInstance.movimentos[0].id).toBe('novo');
  });
});
