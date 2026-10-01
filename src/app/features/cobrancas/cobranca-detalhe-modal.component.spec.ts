import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaDetalhe } from '../../core/api/central.models';
import { CobrancaDetalheModalComponent } from './cobranca-detalhe-modal.component';

/** Igual à lista de Cobranças: o modal fica dentro de uma tela OnPush. */
@Component({
  imports: [CobrancaDetalheModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-cobranca-detalhe-modal cobrancaId="c1" />`
})
class TelaOnPush {}

describe('CobrancaDetalheModalComponent', () => {
  it('mostra o detalhe assim que a resposta chega, dentro de uma tela OnPush', () => {
    const resposta = new Subject<CobrancaDetalhe>();
    TestBed.configureTestingModule({
      imports: [TelaOnPush],
      providers: [provideRouter([]), { provide: CentralApiService, useValue: { cobranca: () => resposta, pagamentosOnline: () => of([]) } }]
    });
    const fixture = TestBed.createComponent(TelaOnPush);
    fixture.autoDetectChanges();

    resposta.next({
      observacao: 'Paróquia parceira',
      itens: [],
      cobranca: {
        sequencial: 1, id: 'c1', contratacaoId: 'k1', clienteId: 'cl1', clienteNome: 'Maria Toebe', produtoCodigo: 'SERVIREA',
        nomeInstancia: 'Paróquia São José Operário', planoNome: 'Servirea Free', periodicidade: 'MENSAL',
        competenciaInicio: '2026-09-01', competenciaFim: '2026-09-30', vencimento: '2026-09-27', valor: 0,
        status: 'ISENTA', vencida: false, pagoEm: null, valorPago: null, formaPagamento: null
      }
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('09/2026');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Paróquia parceira');
  });

  function checkoutFixture(url: string) {
    const api={ checkoutCobranca:jasmine.createSpy().and.returnValue(of({url, situacao:'PRONTO'})) };
    TestBed.configureTestingModule({imports:[CobrancaDetalheModalComponent],providers:[provideRouter([]),{provide:CentralApiService,useValue:api}]});
    const fixture=TestBed.createComponent(CobrancaDetalheModalComponent);
    fixture.componentRef.setInput('cobrancaId','c1');
    fixture.componentInstance.d={cobranca:{id:'c1',status:'ABERTA',valor:100}} as CobrancaDetalhe;
    return {fixture,api};
  }
  it('não aceita link de checkout fora do Mercado Pago', () => {
    const {fixture}=checkoutFixture('https://fraude.test/checkout');
    fixture.componentInstance.gerarCheckout();
    expect(fixture.componentInstance.linkCheckout).toBe('');
    expect(fixture.componentInstance.erroAcao).toBe('Link de pagamento inválido.');
  });
  it('nova tentativa após falha reutiliza a chave da mesma cobrança', () => {
    const {fixture,api}=checkoutFixture('https://www.mercadopago.com.br/checkout');
    api.checkoutCobranca.and.returnValue(throwError(() => new Error('Indisponível')));
    fixture.componentInstance.gerarCheckout();
    const primeira=api.checkoutCobranca.calls.mostRecent().args[1];
    api.checkoutCobranca.and.returnValue(of({url:'https://www.mercadopago.com.br/checkout',situacao:'PRONTO'}));
    fixture.componentInstance.gerarCheckout();
    expect(api.checkoutCobranca.calls.mostRecent().args[1]).toBe(primeira);
    expect(fixture.componentInstance.linkCheckout).toBe('https://www.mercadopago.com.br/checkout');
  });
});
