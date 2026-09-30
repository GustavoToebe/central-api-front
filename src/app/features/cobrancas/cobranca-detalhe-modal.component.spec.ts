import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
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
      providers: [provideRouter([]), { provide: CentralApiService, useValue: { cobranca: () => resposta } }]
    });
    const fixture = TestBed.createComponent(TelaOnPush);
    fixture.autoDetectChanges();

    resposta.next({
      observacao: 'Paróquia parceira',
      itens: [],
      cobranca: {
        sequencial: 1, id: 'c1', contratacaoId: 'k1', clienteId: 'cl1', clienteNome: 'Maria Toebe', produtoCodigo: 'SERVIRE',
        nomeInstancia: 'Paróquia São José Operário', planoNome: 'Servire Free', periodicidade: 'MENSAL',
        competenciaInicio: '2026-09-01', competenciaFim: '2026-09-30', vencimento: '2026-09-27', valor: 0,
        status: 'ISENTA', vencida: false, pagoEm: null, valorPago: null, formaPagamento: null
      }
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('09/2026');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Paróquia parceira');
  });
});
