import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, guardarSessao, limparSessao, tokenAtual } from './sessao';
import { cabecalhoXsrf, comXsrf } from './xsrf';

/**
 * Refresh em andamento, compartilhado: vários 401 ao mesmo tempo esperam o
 * mesmo POST /auth/refresh em vez de cada um disparar o seu (o refresh gira o
 * cookie; o segundo chegaria com o token já revogado).
 */
let refreshEmAndamento: Observable<string> | null = null;

/**
 * Para toda chamada à API da Central: `withCredentials` (cookie de refresh),
 * X-XSRF-TOKEN nas escritas e Bearer fora de `/auth/`. Um 401 fora de
 * `/auth/` tenta um refresh e repete a requisição uma vez; se o refresh
 * falhar, limpa a sessão e volta para o login. Mesmo desenho do
 * `servire-api-front`.
 */
export const centralAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const api = environment.apiUrl;
  if (!req.url.startsWith(api)) return next(req);

  // inject() só na parte síncrona: dentro do catchError lança NG0203.
  const backend = inject(HttpBackend);
  const router = inject(Router);

  const rotaDeAuth = req.url.startsWith(`${api}/auth/`);
  const token = tokenAtual();
  let autenticada = comXsrf(req.clone({ withCredentials: true }));
  if (!rotaDeAuth && token) {
    autenticada = autenticada.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(autenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status !== 401 || rotaDeAuth) return throwError(() => erro);
      return renovar(backend, api).pipe(
        catchError(erroRefresh => {
          limparSessao();
          void router.navigate(['/login']);
          return throwError(() => erroRefresh);
        }),
        switchMap(novoToken => next(comXsrf(req.clone({
          withCredentials: true,
          setHeaders: { Authorization: `Bearer ${novoToken}` }
        }))))
      );
    })
  );
};

function renovar(backend: HttpBackend, api: string): Observable<string> {
  if (!refreshEmAndamento) {
    refreshEmAndamento = new HttpClient(backend).post<LoginResponse>(`${api}/auth/refresh`, {}, {
      withCredentials: true,
      headers: cabecalhoXsrf()
    }).pipe(
      map(resposta => {
        guardarSessao(resposta);
        return resposta.accessToken;
      }),
      finalize(() => { refreshEmAndamento = null; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }
  return refreshEmAndamento;
}

/** Zera o refresh compartilhado entre os testes do interceptor. */
export function resetCentralAuthRefresh(): void {
  refreshEmAndamento = null;
}
