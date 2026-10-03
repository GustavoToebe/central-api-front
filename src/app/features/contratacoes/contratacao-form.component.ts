import { Component, OnInit, ViewChild, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Adicional, Cliente, Plano, Produto } from '../../core/api/central.models';
import { emailValido } from '../comum/formatos';
import { CampoDataComponent } from '../comum/campo-data.component';
import { PERIODICIDADES, dinheiro, hojeIso, rotuloPeriodicidade, sugerirSlug } from '../comum/rotulos';
import { precoVigente } from '../catalogo/catalogo.form';
import { ContratacaoForm, montarContratacaoRequest } from './contratacao.form';
import { SelectBuscaComponent, OpcaoSelectBusca } from '../comum/select-busca.component';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { RodapeFormComponent } from '../comum/rodape-form.component';

@Component({
  selector: 'app-contratacao-form',
  imports: [FormsModule, RouterLink, CampoDataComponent, SelectBuscaComponent, CabecalhoPaginaComponent, RodapeFormComponent],
  template: `
    <div class="w-full min-w-0 space-y-6">
      <app-cabecalho-pagina titulo="Nova contratação"
        subtitulo="Ao salvar, a Central manda o aplicativo criar a instância e convidar o administrador (em até um minuto).">
        <a [routerLink]="voltar()" class="bo-link" acoes>← Voltar</a>
      </app-cabecalho-pagina>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <form #formulario="ngForm" class="space-y-6" (ngSubmit)="salvar()">
        <section class="bo-card grid gap-4 p-5 md:grid-cols-2">
          <label class="md:col-span-2"><span class="bo-label">Cliente *</span>
            <app-select-busca name="clienteId" [(ngModel)]="form.clienteId" [opcoes]="opcoesClientes" placeholder="Escolha o cliente" />
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
              @for (p of planos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
            </select>
          </label>
          <label><span class="bo-label">Periodicidade *</span>
            <select class="bo-field" name="periodicidade" [(ngModel)]="form.periodicidade">
              @for (p of periodicidades; track p) { <option [value]="p">{{ rotuloPeriodicidade(p) }}</option> }
            </select>
          </label>
          <label><span class="bo-label">Valor (vazio = preço do plano)</span>
            <input class="bo-field" name="valor" inputmode="decimal" [(ngModel)]="form.valor" placeholder="{{ precoSugerido() }}">
          </label>
          <label><span class="bo-label">Dia de vencimento (1 a 28) *</span>
            <input class="bo-field" type="number" min="1" max="28" name="diaVencimento" [(ngModel)]="form.diaVencimento" required>
          </label>
          <label><span class="bo-label">Início *</span>
            <app-campo-data name="inicio" [(ngModel)]="form.inicio" required [limpavel]="false" />
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
            <input class="bo-field" type="email" name="adminEmail" [(ngModel)]="form.adminEmail" required #adminEmailCampo="ngModel"
              placeholder="nome@exemplo.com">
            @if (adminEmailCampo.touched && form.adminEmail.trim() && !emailValido(form.adminEmail)) {
              <span class="mt-1 block text-xs text-red-400">E-mail inválido.</span>
            }
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

        <app-rodape-form [voltarUrl]="voltar()" rotuloSalvar="Contratar" [carregando]="salvando" [desabilitado]="!completo()" />
      </form>
    </div>
  `
})
export class ContratacaoFormComponent implements OnInit {
  @ViewChild('formulario') formulario?: NgForm;
  private salvo = false;
  hasPendingChanges(): boolean { return !this.salvo && (this.salvando || !!this.formulario?.dirty); }
  readonly emailValido = emailValido;
  private api = inject(CentralApiService);
  private router = inject(Router);

  /** Vem de ?clienteId= (botão "Nova contratação" no cliente). */
  readonly clienteId = input<string>();

  clientes: Cliente[] = [];
  opcoesClientes: OpcaoSelectBusca[] = [];
  produtos: Produto[] = [];
  planos: Plano[] = [];
  adicionais: Adicional[] = [];
  erro = '';
  salvando = false;
  slugEditado = false;
  readonly dinheiro = dinheiro;
  readonly periodicidades = PERIODICIDADES;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;

  form: ContratacaoForm = {
    clienteId: '', produtoId: '', planoId: '', periodicidade: 'MENSAL', valor: '', diaVencimento: 10,
    inicio: hojeIso(), situacaoComercial: 'TRIAL', nomeInstancia: '', slugInstancia: '', adminNome: '',
    adminEmail: '', observacoes: '', adicionais: []
  };

  ngOnInit(): void {
    this.form.clienteId = this.clienteId() ?? '';
    this.api.clientes().subscribe({ next: l => { this.clientes = l; this.opcoesClientes = opcoesDeClientes(l); }, error: e => this.erro = mensagemApi(e, 'Não foi possível carregar os clientes.') });
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
    return dinheiro(precoVigente(plano.precos, this.form.periodicidade));
  }

  voltar(): string[] {
    const id = this.clienteId();
    return id ? ['/clientes', id] : ['/contratacoes'];
  }

  completo(): boolean {
    const f = this.form;
    return !!(f.clienteId && f.produtoId && f.planoId && f.inicio && f.nomeInstancia.trim()
      && f.slugInstancia.trim() && f.adminNome.trim() && emailValido(f.adminEmail));
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    this.api.criarContratacao(montarContratacaoRequest(this.form)).subscribe({
      next: c => { this.salvo = true; void this.router.navigate(['/contratacoes', c.id]); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível criar a contratação.'); }
    });
  }
}

/** Cliente no select com busca: nome, e documento + número embaixo. */
export function opcoesDeClientes(clientes: Cliente[]): OpcaoSelectBusca[] {
  return clientes.map(c => ({ valor: c.id, rotulo: c.nome, detalhe: [c.documento, c.sequencial ? `nº ${c.sequencial}` : ''].filter(Boolean).join(' · ') }));
}
