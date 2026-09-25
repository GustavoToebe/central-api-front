import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'renovarSilencioso']);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });

  const rodar = () => TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  it('deixa passar com token', () => {
    auth.isLoggedIn.and.returnValue(true);
    expect(rodar()).toBeTrue();
    expect(auth.renovarSilencioso).not.toHaveBeenCalled();
  });

  it('sem token, renova pelo cookie e deixa passar', async () => {
    auth.isLoggedIn.and.returnValue(false);
    auth.renovarSilencioso.and.returnValue(of(true));
    expect(await firstValueFrom(rodar() as Observable<boolean | UrlTree>)).toBeTrue();
  });

  it('sem token e sem cookie, manda para /login', async () => {
    auth.isLoggedIn.and.returnValue(false);
    auth.renovarSilencioso.and.returnValue(of(false));
    const resultado = await firstValueFrom(rodar() as Observable<boolean | UrlTree>);
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login');
  });
});
