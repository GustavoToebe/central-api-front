import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaLinha } from '../../core/api/central.models';
import { CobrancasComponent } from './cobrancas.component';

const ABERTA = {
  id: 'cb1', sequencial: 7, status: 'ABERTA', vencida: false, clienteNome: 'Paróquia A', nomeInstancia: 'A',
  produtoCodigo: 'SERVIREA', planoNome: 'Pro', competenciaInicio: '2026-09-01', competenciaFim: '2026-09-30',
  vencimento: '2026-09-10', valor: 100, pagoEm: null, formaPagamento: null
} as unknown as CobrancaLinha;

describe('CobrancasComponent', () => {
  let api: jasmine.SpyObj<CentralApiService>;

  function montar() {
    api = jasmine.createSpyObj<CentralApiService>('CentralApiService', ['produtos', 'cobrancas', 'cobranca']);
    api.produtos.and.returnValue(of([]));
    api.cobrancas.and.returnValue(of([ABERTA]));
    api.cobranca.and.returnValue(of());
    TestBed.configureTestingModule({
      imports: [CobrancasComponent],
      providers: [provideRouter([]), { provide: CentralApiService, useValue: api }]
    });
    const fixture = TestBed.createComponent(CobrancasComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('clicar na linha abre o detalhe', () => {
    const fixture = montar();
    (fixture.nativeElement.querySelector('tr.clicavel') as HTMLElement).click();
    expect(fixture.componentInstance.detalheId).toBe('cb1');
  });

  it('clicar no checkbox marca e não abre o detalhe', () => {
    const fixture = montar();
    (fixture.nativeElement.querySelector('tr.clicavel input[type="checkbox"]') as HTMLInputElement).click();
    expect(fixture.componentInstance.detalheId).toBeNull();
    expect(fixture.componentInstance.selecao.marcado('cb1')).toBeTrue();
    expect(fixture.componentInstance.menuOpcoes()[0].desabilitada).toBeFalse();
  });

  it('mudar a situação no painel e buscar chama a API com o filtro', () => {
    const fixture = montar();
    const el: HTMLElement = fixture.nativeElement;
    (el.querySelector('[data-alternar-filtros]') as HTMLButtonElement).click();
    fixture.detectChanges();
    fixture.componentInstance.filtro.situacao = 'VENCIDA';
    (el.querySelector('[data-buscar-painel]') as HTMLButtonElement).click();
    expect(api.cobrancas).toHaveBeenCalledTimes(2);
    expect(api.cobrancas.calls.mostRecent().args[0].situacao).toBe('VENCIDA');
  });
});
