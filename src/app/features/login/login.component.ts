import { OlhoSenhaComponent } from '../comum/olho-senha.component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { codigoApi, mensagemApi } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, OlhoSenhaComponent],
  template: `
    <div class="bo relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div class="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" [style.background]="'var(--brand-glow)'"></div>
      <div class="relative w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#111] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md" [style.border-top]="'3px solid var(--brand)'">
        <div class="mb-8">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white shadow-md" [style.background]="'var(--brand)'">C</div>
          <h1 class="text-2xl font-extrabold tracking-tight text-white">Central</h1>
          <p class="mt-2 text-sm text-neutral-400">Acesso do operador. Clientes dos aplicativos entram pelo próprio aplicativo.</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="entrar()" class="space-y-4">
          <div>
            <label class="bo-label" for="email">E-mail</label>
            <input id="email" class="bo-field" type="email" formControlName="email" autocomplete="username">
          </div>
          <div>
            <label class="bo-label" for="senha">Senha</label>
            <div class="relative"><input #campoSenha id="senha" class="bo-field pr-11" type="password" formControlName="senha" autocomplete="current-password"><app-olho-senha [campo]="campoSenha" /></div>
          </div>
          @if (mfaNecessario) {
            <div>
              <label class="bo-label" for="codigoMfa">Código do autenticador ou de recuperação</label>
              <input id="codigoMfa" class="bo-field" type="text" formControlName="codigoMfa" autocomplete="one-time-code" maxlength="64">
              <p class="mt-2 text-sm text-neutral-400">Use os seis dígitos do aplicativo ou um dos códigos de recuperação guardados na ativação. Cada código pode ser usado uma vez.</p>
            </div>
          }
          @if (erro) {
            <div class="bo-erro">{{ erro }}</div>
          }
          <button class="bo-btn w-full" type="submit" [disabled]="carregando || form.invalid">{{ carregando ? 'Entrando...' : 'Entrar' }}</button>
          @if (mfaNecessario) { <button class="bo-btn-ghost w-full" type="button" [disabled]="carregando" (click)="reiniciar()">Voltar ao início</button> }
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  carregando = false;
  erro = '';
  mfaNecessario = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    codigoMfa: ['', Validators.maxLength(64)]
  });

  constructor() {
    if (this.auth.isLoggedIn()) void this.router.navigate(['/clientes']);
  }

  async entrar(): Promise<void> {
    if (this.form.invalid || this.carregando) return;
    this.carregando = true;
    this.erro = '';
    try {
      if (this.mfaNecessario) await this.auth.login(this.form.controls.email.value, this.form.controls.senha.value, this.form.controls.codigoMfa.value);
      else await this.auth.login(this.form.controls.email.value, this.form.controls.senha.value);
      this.form.controls.senha.reset(); this.form.controls.codigoMfa.reset();
      await this.router.navigate(['/clientes']);
    } catch (e) {
      if (codigoApi(e) === 'MFA_NECESSARIO') {
        this.mfaNecessario = true;
        this.form.controls.codigoMfa.addValidators(Validators.required);
        this.form.controls.codigoMfa.updateValueAndValidity();
      }
      this.erro = mensagemApi(e, 'Não foi possível entrar.');
    } finally {
      this.carregando = false;
      this.cdr.markForCheck();
    }
  }

  reiniciar(): void {
    this.mfaNecessario = false; this.erro = '';
    this.form.controls.codigoMfa.setValidators(Validators.maxLength(64));
    this.form.controls.codigoMfa.reset(); this.form.controls.senha.reset();
  }
  ngOnDestroy(): void {this.form.controls.senha.reset(); this.form.controls.codigoMfa.reset();}
}
