import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { InstanciasComponent } from './instancias.component';
import { PaginaInstancias } from './instancias.models';

describe('Painel de instâncias', () => {
  let api: jasmine.SpyObj<CentralApiService>;
  const pagina: PaginaInstancias = {
    total: 2, pagina: 0, tamanho: 30, defasadas: 1,
    porNivel: { CRITICO: 1, ATENCAO: 0, OK: 0, SEM_DADOS: 1 },
    itens: [
      { contratacaoId: 'a', sequencial: 1, cliente: 'Paróquia A', instancia: 'A', plano: 'Básico', situacaoComercial: 'ATIVA', nivel: 'CRITICO',
        defasado: true, consultadoEm: '2026-09-20T10:00:00Z', alertas: [{ codigo: 'pessoas', nome: 'Pessoas', estado: 'EXCEDIDO', usado: 12, limite: 10 }] },
      { contratacaoId: 'b', sequencial: 2, cliente: 'Paróquia B', instancia: 'B', plano: 'Básico', situacaoComercial: 'TRIAL', nivel: 'SEM_DADOS',
        defasado: true, consultadoEm: null, alertas: [] }
    ]
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['instancias', 'atualizarInstancias']);
    api.instancias.and.returnValue(of(pagina));
    TestBed.configureTestingModule({ imports: [InstanciasComponent], providers: [provideRouter([]), { provide: CentralApiService, useValue: api }] });
  });

  it('mostra gravidade, alerta e "sem consulta" sem fabricar consumo zero', () => {
    const f = TestBed.createComponent(InstanciasComponent);
    f.detectChanges();
    const texto = f.nativeElement.textContent as string;
    expect(texto).toContain('Crítico');
    expect(texto).toContain('Pessoas: EXCEDIDO');
    expect(texto).toContain('sem consulta');
    expect(texto).toContain('defasado');
  });

  it('filtrar por nível recarrega na primeira página e clicar de novo limpa', () => {
    const f = TestBed.createComponent(InstanciasComponent);
    f.detectChanges();
    f.componentInstance.pagina = 3;
    f.componentInstance.filtrar('CRITICO');
    expect(api.instancias).toHaveBeenCalledWith('CRITICO', 0);
    f.componentInstance.filtrar('CRITICO');
    expect(api.instancias).toHaveBeenCalledWith(null, 0);
  });

  it('atualizar mostra o resumo e recarrega a lista', () => {
    api.atualizarInstancias.and.returnValue(of({ consultadas: 3, falhas: 1, restantesSemDadosOuDefasadas: 4 }));
    const f = TestBed.createComponent(InstanciasComponent);
    f.detectChanges();
    f.componentInstance.atualizar();
    f.detectChanges();
    expect(f.componentInstance.mensagem()).toContain('3 consultadas, 1 com falha');
    expect(api.instancias).toHaveBeenCalledTimes(2);
  });

  it('falha ao atualizar mostra erro e libera o botão', () => {
    api.atualizarInstancias.and.returnValue(throwError(() => new Error('x')));
    const f = TestBed.createComponent(InstanciasComponent);
    f.detectChanges();
    f.componentInstance.atualizar();
    expect(f.componentInstance.erro()).not.toBe('');
    expect(f.componentInstance.atualizando()).toBeFalse();
  });
});
