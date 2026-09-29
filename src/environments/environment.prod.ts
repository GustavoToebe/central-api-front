/**
 * API no mesmo domínio do painel (`/api`), para o navegador não fazer
 * preflight. O cookie XSRF continua com domínio pai se a VPS ainda
 * definir CENTRAL_CSRF_COOKIE_DOMAIN.
 */
export const environment = {
  production: true,
  apiUrl: 'https://central.servirea.com.br/api'
};
