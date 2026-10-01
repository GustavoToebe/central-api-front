import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { centralAuthInterceptor, resetCentralAuthRefresh } from './auth.interceptor';

describe('centralAuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  const api = environment.apiUrl;
  const cookieOriginal = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  const sessao = (token: string) => ({
    accessToken: token, expiresInSeconds: 900, operador: { id: 'op-1', nome: 'Ana', email: 'ana@central.test' }
  });

  function cookieComo(valor: string): void {
    Object.defineProperty(document, 'cookie', { configurable: true, get: () => valor });
  }

  beforeEach(() => {
    sessionStorage.clear();
    resetCentralAuthRefresh();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([centralAuthInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    resetCentralAuthRefresh();
    if (cookieOriginal) Object.defineProperty(document, 'cookie', cookieOriginal);
  });

  it('não mexe em URL que não é da API', () => {
    sessionStorage.setItem('central_access', 'jwt');
    http.get('/assets/logo.svg').subscribe();
    const req = httpMock.expectOne('/assets/logo.svg');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.withCredentials).toBeFalse();
    req.flush({});
  });

  it('manda Bearer e withCredentials fora de /auth/', () => {
    sessionStorage.setItem('central_access', 'jwt');
    http.get(`${api}/clientes`).subscribe();
    const req = httpMock.expectOne(`${api}/clientes`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt');
    expect(req.request.withCredentials).toBeTrue();
    req.flush([]);
  });

  it('não manda Bearer no login, mas manda o cookie', () => {
    sessionStorage.setItem('central_access', 'jwt');
    http.post(`${api}/auth/login`, {}).subscribe();
    const req = httpMock.expectOne(`${api}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});
  });

  it('manda X-XSRF-TOKEN no logout e no refresh, lido do cookie', () => {
    cookieComo('CENTRAL-XSRF-TOKEN=tok%2F1');
    http.post(`${api}/auth/logout`, {}).subscribe();
    const logout = httpMock.expectOne(`${api}/auth/logout`);
    expect(logout.request.headers.get('X-XSRF-TOKEN')).toBe('tok/1');
    logout.flush(null, { status: 204, statusText: 'No Content' });

    http.post(`${api}/auth/refresh`, {}).subscribe();
    const refresh = httpMock.expectOne(`${api}/auth/refresh`);
    expect(refresh.request.headers.get('X-XSRF-TOKEN')).toBe('tok/1');
    refresh.flush(sessao('x'));
  });

  it('não manda X-XSRF-TOKEN em GET', () => {
    cookieComo('CENTRAL-XSRF-TOKEN=tok');
    http.get(`${api}/clientes`).subscribe();
    const req = httpMock.expectOne(`${api}/clientes`);
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    req.flush([]);
  });

  it('renova uma vez só para vários 401 simultâneos, com X-XSRF-TOKEN, e repete com o token novo', async () => {
    cookieComo('CENTRAL-XSRF-TOKEN=tok');
    sessionStorage.setItem('central_access', 'velho');
    const a = firstValueFrom(http.get(`${api}/clientes`));
    const b = firstValueFrom(http.get(`${api}/contratacoes`));
    httpMock.expectOne(`${api}/clientes`).flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(`${api}/contratacoes`).flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshes = httpMock.match(`${api}/auth/refresh`);
    expect(refreshes.length).toBe(1);
    expect(refreshes[0].request.withCredentials).toBeTrue();
    expect(refreshes[0].request.headers.get('X-XSRF-TOKEN')).toBe('tok');
    refreshes[0].flush(sessao('novo'));

    const c = httpMock.expectOne(`${api}/clientes`);
    expect(c.request.headers.get('Authorization')).toBe('Bearer novo');
    c.flush([]);
    const d = httpMock.expectOne(`${api}/contratacoes`);
    expect(d.request.headers.get('Authorization')).toBe('Bearer novo');
    d.flush([]);
    await Promise.all([a, b]);
    expect(sessionStorage.getItem('central_access')).toBe('novo');
    expect(JSON.parse(sessionStorage.getItem('central_operador') ?? '{}').nome).toBe('Ana');
  });

  it('não entra em laço: 401 na repetição volta como erro, sem segundo refresh', async () => {
    sessionStorage.setItem('central_access', 'velho');
    const p = firstValueFrom(http.get(`${api}/clientes`));
    httpMock.expectOne(`${api}/clientes`).flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(`${api}/auth/refresh`).flush(sessao('novo'));
    httpMock.expectOne(`${api}/clientes`).flush({}, { status: 401, statusText: 'Unauthorized' });
    await expectAsync(p).toBeRejected();
    httpMock.expectNone(`${api}/auth/refresh`);
  });

  it('401 em /auth/ não tenta refresh', async () => {
    const p = firstValueFrom(http.post(`${api}/auth/login`, {}));
    httpMock.expectOne(`${api}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
    await expectAsync(p).toBeRejected();
    httpMock.expectNone(`${api}/auth/refresh`);
  });

  it('limpa a sessão e vai para /login se o refresh falhar', async () => {
    sessionStorage.setItem('central_access', 'velho');
    sessionStorage.setItem('central_operador', '{"id":"op-1","nome":"Ana","email":"a@b"}');
    const p = firstValueFrom(http.get(`${api}/clientes`));
    httpMock.expectOne(`${api}/clientes`).flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(`${api}/auth/refresh`).flush({}, { status: 403, statusText: 'Forbidden' });
    await expectAsync(p).toBeRejected();
    expect(sessionStorage.getItem('central_access')).toBeNull();
    expect(sessionStorage.getItem('central_operador')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('outros erros passam direto', async () => {
    sessionStorage.setItem('central_access', 'jwt');
    const p = firstValueFrom(http.get(`${api}/clientes`));
    httpMock.expectOne(`${api}/clientes`).flush({}, { status: 500, statusText: 'Erro' });
    await expectAsync(p).toBeRejected();
    httpMock.expectNone(`${api}/auth/refresh`);
  });

  it('não envia credenciais para um host parecido com o da API', () => {
    sessionStorage.setItem('central_access', 'segredo');
    const externa = new URL(api);
    externa.hostname += '.externo.test';
    externa.pathname += '/pessoas';
    http.post(externa.href, {}).subscribe();
    const req = httpMock.expectOne(externa.href);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    expect(req.request.withCredentials).toBeFalse();
    req.flush({});
  });
});
