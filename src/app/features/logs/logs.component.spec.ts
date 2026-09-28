import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { LogsComponent } from './logs.component';

describe('LogsComponent', () => {
  it('clicar na linha abre e fecha o detalhe do erro', () => {
    const api = jasmine.createSpyObj<CentralApiService>('CentralApiService', ['produtos', 'erros']);
    api.produtos.and.returnValue(of([]));
    api.erros.and.returnValue(of([{
      id: 'e1', ocorridoEm: '2026-09-28T10:00:00Z', clienteNome: 'Paróquia A', contratacaoId: 'k1', status: 500,
      metodo: 'GET', rota: '/x', mensagem: 'falhou', usuarioId: null, tipoExcecao: 'X'
    } as any]));
    TestBed.configureTestingModule({
      imports: [LogsComponent],
      providers: [provideRouter([]), { provide: CentralApiService, useValue: api }]
    });
    const fixture = TestBed.createComponent(LogsComponent);
    fixture.detectChanges();
    const linha = fixture.nativeElement.querySelector('tr.clicavel') as HTMLElement;
    linha.click();
    expect(fixture.componentInstance.aberto).toBe('e1');
    linha.click();
    expect(fixture.componentInstance.aberto).toBeNull();
  });
});
