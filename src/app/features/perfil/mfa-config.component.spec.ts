import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { MfaConfigComponent } from './mfa-config.component';

describe('MfaConfigComponent', () => {
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>; let router: jasmine.SpyObj<Router>;
  const api = `${environment.apiUrl}/operadores/eu/mfa`;
  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['logout']); auth.logout.and.resolveTo();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']); router.navigate.and.resolveTo(true);
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting(), {provide: AuthService, useValue: auth}, {provide: Router, useValue: router}]});
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('mostra códigos uma vez após confirmar e só sai quando o operador concluir', async () => {
    const fixture = TestBed.createComponent(MfaConfigComponent); const tela = fixture.componentInstance;
    const carga = tela.carregar(); http.expectOne(api).flush({ativo: false, configurado: true, codigosRestantes: 0}); await carga;
    tela.senha = 'senha'; const preparo = tela.preparar();
    http.expectOne(`${api}/preparar`).flush({segredo: 'CHAVE', expiraEm: '2026-10-01T12:00:00Z'}); await preparo;
    tela.codigo = '123456'; const ativacao = tela.ativar();
    const req = http.expectOne(`${api}/ativar`); expect(req.request.body).toEqual({senha: 'senha', codigo: '123456'});
    req.flush({codigos: ['recuperacao1', 'recuperacao2']}); await ativacao;
    expect(tela.codigos.length).toBe(2); expect(tela.senha).toBe(''); expect(tela.preparacao).toBeNull();
    expect(auth.logout).not.toHaveBeenCalled();
    await tela.sair(); expect(tela.codigos).toEqual([]); expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('apaga uma resposta com segredo que chega após destruir a tela', async () => {
    const fixture = TestBed.createComponent(MfaConfigComponent); const tela = fixture.componentInstance;
    tela.senha = 'senha'; const preparo = tela.preparar(); const req = http.expectOne(`${api}/preparar`);
    fixture.destroy(); req.flush({segredo: 'CHAVE', expiraEm: '2026-10-01T12:00:00Z'}); await preparo;
    expect(tela.preparacao).toBeNull(); expect(tela.senha).toBe(''); expect(tela.codigos).toEqual([]);
  });
  it('erro de carga não é tratado como MFA inativo', async () => {
    const tela = TestBed.createComponent(MfaConfigComponent).componentInstance;
    const carga = tela.carregar(); http.expectOne(api).flush({message: 'Indisponível'}, {status: 503, statusText: 'Unavailable'}); await carga;
    expect(tela.estado).toBeNull(); expect(tela.erro).toBe('Indisponível');
  });
  it('não encerra a sessão se a desativação for recusada', async () => {
    const tela = TestBed.createComponent(MfaConfigComponent).componentInstance;
    tela.senha = 'senha'; tela.codigo = 'incorreto'; const acao = tela.desativar();
    http.expectOne(`${api}/desativar`).flush({message: 'Código inválido'}, {status: 401, statusText: 'Unauthorized'}); await acao;
    expect(auth.logout).not.toHaveBeenCalled(); expect(tela.erro).toBe('Código inválido');
  });
});
