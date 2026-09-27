import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let httpMock: HttpTestingController;
  const api = environment.apiUrl;
  const resposta = { accessToken: 'jwt', expiresInSeconds: 900, operador: { id: 'op-1', nome: 'Ana', email: 'ana@central.test' } };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    if (cookieOriginal) Object.defineProperty(document, 'cookie', cookieOriginal);
  });

  const cookieOriginal = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  function cookieComo(valor: string): void {
    Object.defineProperty(document, 'cookie', { configurable: true, get: () => valor });
  }

  it('login manda e-mail aparado, senha e withCredentials e guarda token e operador', async () => {
    const p = auth.login('  ana@central.test ', 's3nha');
    const req = httpMock.expectOne(`${api}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ana@central.test', senha: 's3nha' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush(resposta);
    await p;
    expect(auth.isLoggedIn()).toBeTrue();
    expect(auth.operador()?.nome).toBe('Ana');
  });

  it('logout chama a API e limpa a sessão mesmo se a API falhar', async () => {
    sessionStorage.setItem('central_access', 'jwt');
    sessionStorage.setItem('central_operador', JSON.stringify(resposta.operador));
    const p = auth.logout();
    const req = httpMock.expectOne(`${api}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({}, { status: 403, statusText: 'Forbidden' });
    await p;
    expect(auth.isLoggedIn()).toBeFalse();
    expect(auth.operador()).toBeNull();
  });

  it('renovarSilencioso sem cookie CENTRAL-XSRF-TOKEN nem chama a API', async () => {
    cookieComo('outro=1');
    expect(await firstValueFrom(auth.renovarSilencioso())).toBeFalse();
    httpMock.expectNone(`${api}/auth/refresh`);
  });

  it('renovarSilencioso guarda a sessão e devolve true', async () => {
    cookieComo('CENTRAL-XSRF-TOKEN=tok');
    const p = firstValueFrom(auth.renovarSilencioso());
    const req = httpMock.expectOne(`${api}/auth/refresh`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(resposta);
    expect(await p).toBeTrue();
    expect(auth.isLoggedIn()).toBeTrue();
  });

  it('renovarSilencioso devolve false sem cookie de refresh válido', async () => {
    cookieComo('CENTRAL-XSRF-TOKEN=tok');
    const p = firstValueFrom(auth.renovarSilencioso());
    httpMock.expectOne(`${api}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await p).toBeFalse();
    expect(auth.isLoggedIn()).toBeFalse();
  });

  it('operador corrompido no storage vira null', () => {
    sessionStorage.setItem('central_operador', '{quebrado');
    expect(auth.operador()).toBeNull();
  });
});
