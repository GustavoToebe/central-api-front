import { OlhoSenhaComponent } from '../comum/olho-senha.component';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, OlhoSenhaComponent],
  template: `
    <div class="bo relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div class="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[#e10600]/20 blur-3xl"></div>
      <div class="relative w-full max-w-md rounded-2xl border border-[#2a2a2a] border-t-[3px] border-t-[#e10600] bg-[#111] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div class="mb-8">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e10600] text-lg font-black">C</div>
          <h1 class="text-2xl font-extrabold tracking-tight">Central</h1>
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
          @if (erro) {
            <div class="bo-erro">{{ erro }}</div>
          }
          <button class="bo-btn w-full" type="submit" [disabled]="carregando || form.invalid">{{ carregando ? 'Entrando...' : 'Entrar' }}</button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  carregando = false;
  erro = '';
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  constructor() {
    if (this.auth.isLoggedIn()) void this.router.navigate(['/clientes']);
  }

  async entrar(): Promise<void> {
    if (this.form.invalid) return;
    this.carregando = true;
    this.erro = '';
    try {
      await this.auth.login(this.form.controls.email.value, this.form.controls.senha.value);
      await this.router.navigate(['/clientes']);
    } catch (e) {
      this.erro = mensagemApi(e, 'Não foi possível entrar.');
    } finally {
      this.carregando = false;
    }
  }
}
