import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { MfaPreparacao, MfaStatus } from '../../core/api/central.models';
import { mensagemApi } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { OlhoSenhaComponent } from '../comum/olho-senha.component';

/** Dados de configuração ficam apenas na memória desta tela, nunca no armazenamento do navegador. */
@Component({
  selector: 'app-mfa-config', imports: [FormsModule, OlhoSenhaComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bo-card space-y-4 p-5" aria-labelledby="mfa-titulo">
      <h2 id="mfa-titulo" class="text-sm font-extrabold uppercase tracking-widest text-neutral-400">Autenticação em duas etapas</h2>
      <p class="text-sm text-neutral-400">Proteja seu acesso com um aplicativo autenticador. Ativar ou desativar encerra todas as sessões e exige um novo login.</p>
      @if (erro) { <div class="bo-erro" role="alert">{{ erro }}</div> }
      @if (codigos.length) {
        <p class="bo-warn">Guarde estes códigos em um local seguro antes de sair. Eles serão exibidos somente agora e cada um funciona uma vez. Para entrar novamente, aguarde o próximo código do autenticador.</p>
        <ul class="space-y-1 font-mono text-sm">@for (codigo of codigos; track codigo) { <li>{{ codigo }}</li> }</ul>
        <label class="flex gap-2 text-sm"><input type="checkbox" [(ngModel)]="guardados">Guardei os códigos em um local seguro.</label>
        <button type="button" class="bo-btn" [disabled]="!guardados || ocupado" (click)="sair()">Concluir e entrar novamente</button>
      } @else if (estado) {
        <span class="bo-badge" [class.bo-ok]="estado.ativo" [class.bo-mute]="!estado.ativo">{{ estado.ativo ? 'Ativo' : 'Inativo' }}</span>
        @if (!estado.configurado && !estado.ativo) {
          <p class="text-sm text-neutral-400">O responsável pelo servidor precisa configurar o MFA antes da ativação.</p>
        } @else {
          @if (estado.ativo) { <p class="text-sm text-neutral-400">Códigos de recuperação disponíveis: {{ estado.codigosRestantes }}.</p> }
          <label class="block"><span class="bo-label">Senha atual para confirmar</span>
            <div class="relative"><input #senhaCampo type="password" class="bo-field pr-11" [(ngModel)]="senha" autocomplete="current-password" maxlength="72"><app-olho-senha [campo]="senhaCampo" /></div>
          </label>
          @if (preparacao) {
            <p class="text-sm text-neutral-400">No aplicativo autenticador, adicione uma conta manualmente: nome Central, chave abaixo, baseada em tempo, seis dígitos, intervalo de 30 segundos.</p>
            <label class="block"><span class="bo-label">Chave para o autenticador</span><input class="bo-field font-mono" readonly [value]="preparacao.segredo" autocomplete="off"></label>
            <p class="text-sm text-neutral-400">Confirme em até dez minutos. A chave ainda não está ativa.</p>
          }
          @if (preparacao || estado.ativo) {
            <label class="block"><span class="bo-label">{{ estado.ativo ? 'Código do autenticador ou de recuperação' : 'Código de seis dígitos do autenticador' }}</span>
              <input type="text" class="bo-field" [(ngModel)]="codigo" maxlength="64" autocomplete="one-time-code">
            </label>
          }
          @if (estado.ativo) {
            @if (confirmarDesativacao) {
              <div class="space-y-3 rounded-xl border border-rose-700 p-3">
                <p class="text-sm">Desativar removerá a proteção em duas etapas e invalidará os códigos guardados. Confirme sua decisão.</p>
                <button type="button" class="bo-btn-danger" [disabled]="ocupado || !senha || !codigo" (click)="desativar()">Confirmar desativação</button>
                <button type="button" class="bo-btn-ghost" [disabled]="ocupado" (click)="confirmarDesativacao = false">Cancelar</button>
              </div>
            } @else { <button type="button" class="bo-btn-danger" [disabled]="ocupado" (click)="confirmarDesativacao = true">Desativar proteção</button> }
          } @else if (preparacao) {
            <button type="button" class="bo-btn" [disabled]="ocupado || !senha || !codigo" (click)="ativar()">Confirmar e ativar</button>
            <button type="button" class="bo-btn-ghost" [disabled]="ocupado" (click)="cancelar()">Cancelar configuração</button>
          } @else { <button type="button" class="bo-btn" [disabled]="ocupado || !senha" (click)="preparar()">Configurar autenticador</button> }
        }
      } @else if (!ocupado) { <button type="button" class="bo-btn-ghost" (click)="carregar()">Tentar novamente</button> }
    </section>
  `
})
export class MfaConfigComponent implements OnInit, OnDestroy {
  private api = inject(CentralApiService); private auth = inject(AuthService);
  private router = inject(Router); private cdr = inject(ChangeDetectorRef);
  private destruido = false;
  estado: MfaStatus | null = null; preparacao: MfaPreparacao | null = null;
  codigos: string[] = []; senha = ''; codigo = ''; erro = ''; ocupado = false;
  guardados = false; confirmarDesativacao = false;
  ngOnInit(): void {void this.carregar();}
  async carregar(): Promise<void> {await this.executar(async () => {this.estado = await firstValueFrom(this.api.mfaStatus());});}
  async preparar(): Promise<void> {await this.executar(async () => {this.preparacao = await firstValueFrom(this.api.mfaPreparar(this.senha));});}
  async ativar(): Promise<void> {
    await this.executar(async () => {
      const resposta = await firstValueFrom(this.api.mfaAtivar(this.senha, this.codigo.trim()));
      if (!this.destruido) this.codigos = resposta.codigos;
      this.senha = this.codigo = ''; this.preparacao = null;
    });
  }
  async desativar(): Promise<void> {
    await this.executar(async () => {await firstValueFrom(this.api.mfaDesativar(this.senha, this.codigo.trim())); await this.sair();});
  }
  async sair(): Promise<void> {this.cancelar(); this.codigos = []; await this.auth.logout(); await this.router.navigate(['/login']);}
  cancelar(): void {this.senha = this.codigo = ''; this.preparacao = null; this.erro = '';}
  private async executar(acao: () => Promise<void>): Promise<void> {
    if (this.ocupado || this.destruido) return;
    this.ocupado = true; this.erro = '';
    try {await acao();} catch (e) {if (!this.destruido) this.erro = mensagemApi(e, 'Não foi possível configurar o MFA.');}
    finally {
      if (this.destruido) this.limpar();
      else {this.ocupado = false; this.cdr.markForCheck();}
    }
  }
  private limpar(): void {this.cancelar(); this.codigos = []; this.guardados = false;}
  ngOnDestroy(): void {this.destruido = true; this.limpar();}
}
