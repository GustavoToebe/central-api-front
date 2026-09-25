import { routes } from './app.routes';
import { authGuard } from './core/auth/auth.guard';

describe('rotas', () => {
  it('só o login fica fora do guard', () => {
    const publicas = routes.filter(r => r.path !== '**' && !r.canActivate?.includes(authGuard)).map(r => r.path);
    expect(publicas).toEqual(['login']);
  });

  it('tem as telas do painel dentro da área protegida', () => {
    const filhas = routes.find(r => r.path === '')?.children?.map(r => r.path) ?? [];
    for (const tela of ['clientes', 'clientes/:id', 'contratacoes', 'contratacoes/nova', 'contratacoes/:id',
      'catalogo/produtos', 'catalogo/recursos', 'catalogo/planos', 'catalogo/adicionais']) {
      expect(filhas).toContain(tela);
    }
  });
});
