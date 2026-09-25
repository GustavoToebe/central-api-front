/**
 * API da Central em produção. Com painel e API em subdomínios diferentes, a
 * API precisa de CENTRAL_CSRF_COOKIE_DOMAIN com o domínio pai, senão o painel
 * não lê o cookie XSRF-TOKEN e refresh/logout voltam 403.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api-central.servirea.com.br'
};
