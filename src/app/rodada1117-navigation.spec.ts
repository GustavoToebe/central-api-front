import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterOutlet, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { CentralApiService } from './core/api/central-api.service';
import { ConsumoInstancia } from './features/consumo/consumo.models';
@Component({ imports: [RouterOutlet], template: '<router-outlet/>' })
class ShellTeste {
}
@Component({ template: 'Login' })
class LoginTeste {
}
describe('Navegação da Central com rota lazy e sessão real no guard', () => {
    let logged = true;
    let api: jasmine.SpyObj<CentralApiService>;
    let auth: {
        isLoggedIn: () => boolean;
        renovarSilencioso: jasmine.Spy;
    };
    beforeEach(() => { logged = true; api = jasmine.createSpyObj('api', ['consumoInstancia', 'historicoConsumo']); api.consumoInstancia.and.returnValue(of({ contratacaoId: 'a', funcionalidades: [], consumo: { planoNome: 'Inicial', versaoDireitos: 1, direitosConfirmadosEm: '2026-10-01T00:00:00Z', consultadoEm: '2026-10-01T00:00:00Z', itens: [] } })); auth = { isLoggedIn: () => logged, renovarSilencioso: jasmine.createSpy().and.returnValue(of(false)) }; const app = routes.find(r => r.path === '')!; TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'login', component: LoginTeste }, { ...app, loadComponent: undefined, component: ShellTeste, children: (app.children ?? []).filter(r => r.path === 'contratacoes/:id/consumo') }], withComponentInputBinding()), { provide: AuthService, useValue: auth }, { provide: CentralApiService, useValue: api }] }); });
    it('sem sessão não consulta consumo e abre login', async () => { logged = false; const h = await RouterTestingHarness.create(); await h.navigateByUrl('/contratacoes/a/consumo'); expect(TestBed.inject(Router).url).toBe('/login'); expect(api.consumoInstancia).not.toHaveBeenCalled(); });
    it('renovação silenciosa permite navegar com cookie válido', async () => { logged = false; auth.renovarSilencioso.and.returnValue(of(true)); const h = await RouterTestingHarness.create(); await h.navigateByUrl('/contratacoes/a/consumo'); expect(api.consumoInstancia).toHaveBeenCalledWith('a'); expect(TestBed.inject(Router).url).toBe('/contratacoes/a/consumo'); });
    it('trocar contratação pela rota cancela dados antigos', async () => { const antiga = new Subject<ConsumoInstancia>(); api.consumoInstancia.and.returnValue(antiga); const h = await RouterTestingHarness.create(); await h.navigateByUrl('/contratacoes/a/consumo'); api.consumoInstancia.and.returnValue(of({ contratacaoId: 'b', funcionalidades: [], consumo: { planoNome: 'Segundo', versaoDireitos: 2, direitosConfirmadosEm: '2026-10-01T00:00:00Z', consultadoEm: '2026-10-01T00:00:00Z', itens: [] } })); await h.navigateByUrl('/contratacoes/b/consumo'); expect(antiga.observed).toBeFalse(); expect(api.consumoInstancia).toHaveBeenCalledWith('b'); expect(h.routeNativeElement?.textContent).toContain('Segundo'); });
});
