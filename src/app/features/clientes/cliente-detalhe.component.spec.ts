import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { ContratacaoResumo } from '../../core/api/central.models';
import { ClienteDetalheComponent } from './cliente-detalhe.component';

function contratacao(extra: Partial<ContratacaoResumo> = {}): ContratacaoResumo {
  return {
    id: 'k1', clienteId: 'c1', produtoCodigo: 'SERVIREA', nomeInstancia: 'Paróquia de Teste', slugInstancia: 'paroquia-teste',
    situacaoComercial: 'ATIVA', situacaoProvisionamento: 'ATIVA', ...extra
  } as ContratacaoResumo;
}

describe('ClienteDetalheComponent: acessar aplicativo', () => {
  let fixture: ComponentFixture<ClienteDetalheComponent>;
  let component: ClienteDetalheComponent;
  let api: { cliente: jasmine.Spy; contratacoes: jasmine.Spy; suporte: jasmine.Spy };

  function montar(lista: ContratacaoResumo[]): void {
    api = {
      cliente: jasmine.createSpy('cliente').and.returnValue(of({
        id: 'c1', sequencial: 1, tipo: 'PJ', documento: '00000000000191', nome: 'Paróquia de Teste', contatos: []
      })),
      contratacoes: jasmine.createSpy('contratacoes').and.returnValue(of(lista)),
      suporte: jasmine.createSpy('suporte').and.returnValue(of({
        codigo: 'abc', urlAcesso: 'https://app.exemplo.test/suporte?codigo=abc', expiraEm: '2026-09-30T12:00:00Z'
      }))
    };
    TestBed.configureTestingModule({
      imports: [ClienteDetalheComponent],
      providers: [provideRouter([]), { provide: CentralApiService, useValue: api }]
    });
    fixture = TestBed.createComponent(ClienteDetalheComponent);
    fixture.componentRef.setInput('id', 'c1');
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const botao = (): HTMLButtonElement | undefined =>
    Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.includes('Acessar aplicativo'));

  it('mostra o botão só com contratação ativa e já provisionada', () => {
    montar([contratacao()]);
    expect(botao()).toBeTruthy();
  });

  it('não mostra o botão se a contratação está cancelada ou ainda pendente de provisionamento', () => {
    montar([contratacao({ situacaoComercial: 'CANCELADA' }), contratacao({ id: 'k2', situacaoProvisionamento: 'PENDENTE' })]);
    expect(component.elegiveis.length).toBe(0);
    expect(botao()).toBeUndefined();
  });

  it('abre a aba no clique e leva à URL de acesso, sem deixar a aba ver a Central', () => {
    montar([contratacao()]);
    const aba = { location: { href: '' }, opener: 'central', close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(aba as unknown as Window);
    component.contratacaoEscolhida = 'k1';
    component.motivo = '  cliente ligou pedindo ajuda  ';
    component.entrar();
    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(api.suporte).toHaveBeenCalledWith('k1', 'cliente ligou pedindo ajuda');
    expect(aba.location.href).toBe('https://app.exemplo.test/suporte?codigo=abc');
    expect(aba.opener).toBeNull();
    expect(component.motivo).toBe('');
  });

  it('sem motivo não chama a API nem abre aba', () => {
    montar([contratacao()]);
    spyOn(window, 'open');
    component.contratacaoEscolhida = 'k1';
    component.motivo = '   ';
    component.entrar();
    expect(window.open).not.toHaveBeenCalled();
    expect(api.suporte).not.toHaveBeenCalled();
  });

  it('se a API recusar, fecha a aba e mostra o erro', () => {
    montar([contratacao()]);
    const aba = { location: { href: '' }, opener: null, close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(aba as unknown as Window);
    api.suporte.and.returnValue(throwError(() => new Error('falhou')));
    component.contratacaoEscolhida = 'k1';
    component.motivo = 'teste';
    component.entrar();
    expect(aba.close).toHaveBeenCalled();
    expect(component.erro).not.toBe('');
    expect(component.ocupado).toBeFalse();
  });
});
