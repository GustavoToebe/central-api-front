import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent com MFA', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'isLoggedIn']);
    auth.isLoggedIn.and.returnValue(false);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']); router.navigate.and.resolveTo(true);
    TestBed.configureTestingModule({providers: [{provide: AuthService, useValue: auth}, {provide: Router, useValue: router}]});
  });
  it('só navega após a senha e o segundo fator serem aceitos; limpa os campos', async () => {
    const fixture = TestBed.createComponent(LoginComponent); const tela = fixture.componentInstance;
    tela.form.patchValue({email: 'ana@central.test', senha: 'senha'});
    auth.login.and.rejectWith(new HttpErrorResponse({status: 401, error: {codigo: 'MFA_NECESSARIO', message: 'Informe o código.'}}));
    await tela.entrar(); fixture.detectChanges();
    expect(tela.mfaNecessario).toBeTrue(); expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#codigoMfa')).not.toBeNull();
    expect(tela.form.invalid).toBeTrue();
    tela.form.controls.codigoMfa.setValue('123456'); auth.login.and.resolveTo();
    await tela.entrar();
    expect(auth.login).toHaveBeenCalledWith('ana@central.test', 'senha', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
    expect(tela.form.controls.senha.value).toBe(''); expect(tela.form.controls.codigoMfa.value).toBe('');
  });
  it('voltar e destruir apagam senha e código e removem a exigência local de MFA', async () => {
    const fixture = TestBed.createComponent(LoginComponent); const tela = fixture.componentInstance;
    tela.form.patchValue({email: 'ana@central.test', senha: 'senha'});
    auth.login.and.rejectWith(new HttpErrorResponse({status: 401, error: {codigo: 'MFA_NECESSARIO'}}));
    await tela.entrar(); tela.form.controls.codigoMfa.setValue('123456'); tela.reiniciar();
    expect(tela.mfaNecessario).toBeFalse(); expect(tela.form.controls.senha.value).toBe('');
    tela.form.patchValue({senha: 'senha', codigoMfa: '123456'}); fixture.destroy();
    expect(tela.form.controls.senha.value).toBe(''); expect(tela.form.controls.codigoMfa.value).toBe('');
  });
});
