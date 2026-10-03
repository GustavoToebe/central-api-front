import { TestBed } from '@angular/core/testing';
import { pendingChangesGuard } from './pending-changes.guard';
import { ConfirmacaoNavegacaoService } from './confirmacao-navegacao.service';

describe('saída com alterações não salvas na Central', () => {
  const executar = (pendente: boolean) => TestBed.runInInjectionContext(() => pendingChangesGuard(
    { hasPendingChanges: () => pendente }, {} as never, {} as never, {} as never
  ));

  beforeEach(() => TestBed.configureTestingModule({}));

  it('permite sair quando o formulário está limpo', () => {
    expect(executar(false)).toBeTrue();
  });

  it('só deixa abandonar dados depois de confirmar no painel', async () => {
    const servico = TestBed.inject(ConfirmacaoNavegacaoService);
    const primeira = executar(true) as Promise<boolean>;
    expect(servico.aberto()).toBeTrue();
    servico.responder(false);
    expect(await primeira).toBeFalse();
    const segunda = executar(true) as Promise<boolean>;
    servico.responder(true);
    expect(await segunda).toBeTrue();
  });

  it('avisa o navegador ao fechar a aba com formulário pendente', () => {
    const servico = TestBed.inject(ConfirmacaoNavegacaoService);
    servico.registrar({ hasPendingChanges: () => true });
    const evento = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    servico.antesDeFechar(evento);
    expect(evento.defaultPrevented).toBeTrue();
  });
});
