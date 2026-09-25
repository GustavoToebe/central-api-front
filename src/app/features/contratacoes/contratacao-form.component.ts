import { Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Adicional, Cliente, Plano, Produto } from '../../core/api/central.models';
import { dinheiro, hojeIso, sugerirSlug } from '../comum/rotulos';
import { ContratacaoForm, montarContratacaoRequest } from './contratacao.form';

@Component({
  selector: 'app-contratacao-form',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <div>
        <a [routerLink]="clienteId() ? ['/clientes', clienteId()] : ['/contratacoes']" class="bo-link">← Voltar</a>
        <h1 class="bo-title mt-2">Nova contratação</h1>
        <p class="bo-sub">Ao salvar, a Central manda o aplicativo criar a instância e convidar o administrador (em até um minuto).</p>
      </div>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <form class="space-y-6" (ngSubmit)="salvar()">
        <section class="bo-card grid gap-4 p-5 md:grid-cols-2">
          <label class="md:col-span-2"><span class="bo-label">Cliente *</span>
            <select class="bo-field" name="clienteId" [(ngModel)]="form.clienteId" required>
              <option value="" disabled>Escolha o cliente</option>
              @for (c of clientes; track c.id) { <option [value]="c.id">{{ c.nome }} · {{ c.documento }}</option> }
            </select>
          </label>
          <label><span class="bo-label">Aplicativo *</span>
            <select class="bo-field" name="produtoId" [(ngModel)]="form.produtoId" (ngModelChange)="trocarProduto()" required>
              <option value="" disabled>Escolha o aplicativo</option>
              @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option> }
            </select>
          </label>
          <label><span class="bo-label">Plano *</span>
            <select class="bo-field" name="planoId" [(ngModel)]="form.planoId" required [disabled]="!form.produtoId">
              <option value="" disabled>Escolha o plano</option>
              @for (p of planos; track p.id) { <option [value]="p.id">{{ p.nome }} · {{ dinheiro(p.precoMensal) }}/mês</option> }
            </select>
          </label>
          <label><span class="bo-label">Periodicidade *</span>
            <select class="bo-field" name="periodicidade" [(ngModel)]="form.periodicidade">
              <option value="MENSAL">Mensal</option><option value="ANUAL">Anual</option>
            </select>
          </label>
          <label><span class="bo-label">Valor (vazio = preço do plano)</span>
            <input class="bo-field" name="valor" inputmode="decimal" [(ngModel)]="form.valor" placeholder="{{ precoSugerido() }}">
          </label>
          <label><span class="bo-label">Dia de vencimento (1 a 28) *</span>
            <input class="bo-field" type="number" min="1" max="28" name="diaVencimento" [(ngModel)]="form.diaVencimento" required>
          </label>
          <label><span class="bo-label">Início *</span>
            <input class="bo-field" type="date" name="inicio" [(ngModel)]="form.inicio" required>
          </label>
          <label><span class="bo-label">Situação inicial</span>
            <select class="bo-field" name="situacao" [(ngModel)]="form.situacaoComercial">
              <option value="TRIAL">Teste (trial)</option><option value="ATIVA">Ativa</option>
            </select>
          </label>
        </section>

        <section class="bo-card grid gap-4 p-5 md:grid-cols-2">
          <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400 md:col-span-2">Instância no aplicativo</h2>
          <label><span class="bo-label">Nome da instância *</span>
            <input class="bo-field" name="nomeInstancia" [(ngModel)]="form.nomeInstancia" (ngModelChange)="sugerirSlugSeVazio()" placeholder="Paróquia São José" required>
          </label>
          <label><span class="bo-label">Slug *</span>
            <input class="bo-field" name="slugInstancia" [(ngModel)]="form.slugInstancia" (ngModelChange)="slugEditado = true" placeholder="sao-jose" required>
          </label>
          <label><span class="bo-label">Nome do administrador *</span>
            <input class="bo-field" name="adminNome" [(ngModel)]="form.adminNome" required>
          </label>
          <label><span class="bo-label">E-mail do administrador *</span>
            <input class="bo-field" type="email" name="adminEmail" [(ngModel)]="form.adminEmail" required>
          </label>
          <p class="bo-sub md:col-span-2">Nome, slug e administrador só podem ser corrigidos enquanto o aplicativo não tiver criado a instância.</p>
        </section>

        <section class="bo-card space-y-3 p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Adicionais</h2>
            <button type="button" class="bo-btn-line" [disabled]="!adicionais.length" (click)="form.adicionais.push({ adicionalId: '', quantidade: 1 })">+ Adicional</button>
          </div>
          @for (a of form.adicionais; track $index; let i = $index) {
            <div class="grid items-end gap-3 md:grid-cols-[1fr_8rem_auto]">
              <label><span class="bo-label">Adicional</span>
                <select class="bo-field" [name]="'ad' + i" [(ngModel)]="a.adicionalId">
                  <option value="" disabled>Escolha</option>
                  @for (ad of adicionais; track ad.id) { <option [value]="ad.id">{{ ad.nome }} (+{{ ad.quantidade }} {{ ad.recursoCodigo }}) · {{ dinheiro(ad.preco) }}</option> }
                </select>
              </label>
              <label><span class="bo-label">Quantidade</span><input class="bo-field" type="number" min="1" [name]="'adq' + i" [(ngModel)]="a.quantidade"></label>
              <button type="button" class="bo-link pb-3" (click)="form.adicionais.splice(i, 1)">Excluir</button>
            </div>
          } @empty {
            <p class="bo-sub">{{ form.produtoId ? (adicionais.length ? 'Nenhum adicional.' : 'Este aplicativo não tem adicionais.') : 'Escolha o aplicativo.' }}</p>
          }
          <label class="block"><span class="bo-label">Observações</span>
            <textarea class="bo-field" rows="2" name="observacoes" [(ngModel)]="form.observacoes"></textarea>
          </label>
        </section>

        <div class="flex justify-end gap-3">
          <button class="bo-btn" type="submit" [disabled]="salvando || !completo()">{{ salvando ? 'Salvando...' : 'Contratar' }}</button>
        </div>
      </form>
    </div>
  `
})
export class ContratacaoFormComponent implements OnInit {
  private api = inject(CentralApiService);
  private router = inject(Router);

  /** Vem de ?clienteId= (botão "Nova contratação" no cliente). */
  readonly clienteId = input<string>();

  clientes: Cliente[] = [];
  produtos: Produto[] = [];
  planos: Plano[] = [];
  adicionais: Adicional[] = [];
  erro = '';
  salvando = false;
  slugEditado = false;
  readonly dinheiro = dinheiro;

  form: ContratacaoForm = {
    clienteId: '', produtoId: '', planoId: '', periodicidade: 'MENSAL', valor: '', diaVencimento: 10,
    inicio: hojeIso(), situacaoComercial: 'TRIAL', nomeInstancia: '', slugInstancia: '', adminNome: '',
    adminEmail: '', observacoes: '', adicionais: []
  };

  ngOnInit(): void {
    this.form.clienteId = this.clienteId() ?? '';
    this.api.clientes().subscribe({ next: l => this.clientes = l, error: e => this.erro = mensagemApi(e, 'Não foi possível carregar os clientes.') });
    this.api.produtos().subscribe({
      next: l => {
        this.produtos = l.filter(p => p.ativo);
        if (this.produtos.length === 1) {
          this.form.produtoId = this.produtos[0].id;
          this.trocarProduto();
        }
      },
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar os aplicativos.')
    });
  }

  trocarProduto(): void {
    this.form.planoId = '';
    this.form.adicionais = [];
    const produtoId = this.form.produtoId;
    this.api.planos(produtoId).subscribe({ next: l => this.planos = l.filter(p => p.ativo) });
    this.api.adicionais(produtoId).subscribe({ next: l => this.adicionais = l.filter(a => a.ativo) });
  }

  sugerirSlugSeVazio(): void {
    if (!this.slugEditado) this.form.slugInstancia = sugerirSlug(this.form.nomeInstancia);
  }

  precoSugerido(): string {
    const plano = this.planos.find(p => p.id === this.form.planoId);
    if (!plano) return '';
    return dinheiro(this.form.periodicidade === 'ANUAL' ? plano.precoAnual : plano.precoMensal);
  }

  completo(): boolean {
    const f = this.form;
    return !!(f.clienteId && f.produtoId && f.planoId && f.inicio && f.nomeInstancia.trim()
      && f.slugInstancia.trim() && f.adminNome.trim() && f.adminEmail.trim());
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    this.api.criarContratacao(montarContratacaoRequest(this.form)).subscribe({
      next: c => void this.router.navigate(['/contratacoes', c.id]),
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível criar a contratação.'); }
    });
  }
}
