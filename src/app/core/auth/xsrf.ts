import { HttpRequest } from '@angular/common/http';

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Header CSRF lido do cookie `XSRF-TOKEN` que a API grava (`csrf.spa()`).
 *
 * O `withXsrfConfiguration` do Angular não serve aqui: ele ignora URL
 * absoluta, e a API fica em outra origem. A Central só exige o token nas
 * rotas do cookie de refresh (`/auth/refresh` e `/auth/logout`); o resto usa
 * `Authorization: Bearer`. Em produção o cookie precisa ser do domínio pai
 * (`CENTRAL_CSRF_COOKIE_DOMAIN` na API) para este `document.cookie` enxergá-lo.
 * Mesma solução do `servire-api-front` (`core/auth/xsrf.ts`).
 */
export function cabecalhoXsrf(): Record<string, string> {
  const cookie = document.cookie.split('; ').find(parte => parte.startsWith('XSRF-TOKEN='));
  if (!cookie) return {};
  return { 'X-XSRF-TOKEN': decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) };
}

/** Acrescenta o header CSRF em métodos que alteram estado. */
export function comXsrf<T>(req: HttpRequest<T>): HttpRequest<T> {
  if (METODOS_SEGUROS.has(req.method.toUpperCase())) return req;
  const headers = cabecalhoXsrf();
  return Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req;
}
