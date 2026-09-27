import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MeuPerfilComponent } from './meu-perfil.component';

describe('MeuPerfilComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));

  it('confere a confirmação antes de chamar a API e troca a senha', () => {
    const fixture = TestBed.createComponent(MeuPerfilComponent);
    const tela = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);

    tela.senhaAtual = 'antiga-123';
    tela.novaSenha = 'nova-senha-456';
    tela.confirmacao = 'outra';
    tela.salvar();
    expect(tela.erro).toContain('confirmação');
    http.expectNone(`${environment.apiUrl}/operadores/eu/senha`);

    tela.confirmacao = 'nova-senha-456';
    tela.salvar();
    const req = http.expectOne(`${environment.apiUrl}/operadores/eu/senha`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ senhaAtual: 'antiga-123', novaSenha: 'nova-senha-456' });
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(tela.ok).toContain('Senha trocada');
    expect(tela.novaSenha).toBe('');
  });

  it('mostra o erro da API (senha atual errada)', () => {
    const fixture = TestBed.createComponent(MeuPerfilComponent);
    const tela = fixture.componentInstance;
    tela.senhaAtual = 'errada';
    tela.novaSenha = tela.confirmacao = 'nova-senha-456';
    tela.salvar();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/operadores/eu/senha`)
      .flush({ message: 'A senha atual não confere.' }, { status: 400, statusText: 'Bad Request' });
    expect(tela.erro).toBe('A senha atual não confere.');
  });
});
