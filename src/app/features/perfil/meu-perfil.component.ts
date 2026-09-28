import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { OlhoSenhaComponent } from '../comum/olho-senha.component';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { RodapeFormComponent } from '../comum/rodape-form.component';

/**
 * Meu perfil (27/09/2026): dados do operador e troca da própria senha. A API confere a senha atual,
 * derruba as outras sessões e mantém esta aberta.
 */
@Component({
  selector: 'app-meu-perfil',
  imports: [FormsModule, OlhoSenhaComponent, CabecalhoPaginaComponent, RodapeFormComponent],
  template: `
    <div class="max-w-xl space-y-6">
      <app-cabecalho-pagina titulo="Meu perfil" [subtitulo]="nome + ' · ' + email" />
      <form class="bo-card space-y-4 p-5" (ngSubmit)="salvar()">
        <h2 class="border-b border-[#262626] pb-2 text-sm font-extrabold uppercase tracking-widest text-neutral-400">Trocar senha</h2>
        <label class="block"><span class="bo-label">Senha atual</span>
          <div class="relative"><input #atual class="bo-field pr-11" type="password" name="senhaAtual" [(ngModel)]="senhaAtual"
            required autocomplete="current-password"><app-olho-senha [campo]="atual" /></div></label>
        <label class="block"><span class="bo-label">Nova senha</span>
          <div class="relative"><input #nova class="bo-field pr-11" type="password" name="novaSenha" [(ngModel)]="novaSenha"
            required minlength="8" maxlength="72" autocomplete="new-password"><app-olho-senha [campo]="nova" /></div>
          <span class="mt-1 block text-xs text-neutral-500">Mínimo de 8 caracteres.</span></label>
        <label class="block"><span class="bo-label">Repita a nova senha</span>
          <div class="relative"><input #repete class="bo-field pr-11" type="password" name="confirmacao" [(ngModel)]="confirmacao"
            required autocomplete="new-password"><app-olho-senha [campo]="repete" /></div></label>
        @if (erro) { <div class="bo-erro">{{ erro }}</div> }
        @if (ok) { <div class="rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">{{ ok }}</div> }
        <app-rodape-form voltarUrl="/" rotuloSalvar="Trocar senha" [carregando]="salvando" />
      </form>
    </div>
  `
})
export class MeuPerfilComponent {
  private api = inject(CentralApiService);
  private auth = inject(AuthService);

  readonly nome = this.auth.operador()?.nome ?? '';
  readonly email = this.auth.operador()?.email ?? '';
  senhaAtual = '';
  novaSenha = '';
  confirmacao = '';
  salvando = false;
  erro = '';
  ok = '';

  salvar(): void {
    this.erro = '';
    this.ok = '';
    if (!this.senhaAtual || !this.novaSenha) return void (this.erro = 'Preencha a senha atual e a nova.');
    if (this.novaSenha.length < 8) return void (this.erro = 'A nova senha precisa ter pelo menos 8 caracteres.');
    if (this.novaSenha !== this.confirmacao) return void (this.erro = 'A confirmação não é igual à nova senha.');
    this.salvando = true;
    this.api.trocarSenha({ senhaAtual: this.senhaAtual, novaSenha: this.novaSenha }).subscribe({
      next: () => {
        this.salvando = false;
        this.senhaAtual = this.novaSenha = this.confirmacao = '';
        this.ok = 'Senha trocada. As outras sessões abertas foram encerradas.';
      },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível trocar a senha.'); }
    });
  }
}
