import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { NumeroComponent } from '../comum/numero.component';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Periodicidade, Plano, Produto, Recurso } from '../../core/api/central.models';
import { PERIODICIDADES, data, dinheiro, rotuloPeriodicidade } from '../comum/rotulos';
import { LinhaRecursoDoPlano, limitesSemValor, montarPlanoRequest } from './catalogo.form';

/**
 * Planos e preços (26/09/2026): o preço de cada periodicidade entra no
 * próprio cadastro do plano, e os recursos são adicionados um a um a partir
 * dos que o produto tem, em vez de uma lista com todos.
 */
@Component({
  selector: 'app-planos',
  imports: [FormsModule, NumeroComponent, CabecalhoPaginaComponent],
  template: `
    <div class="space-y-6">
      <app-cabecalho-pagina titulo="Planos e preços" [exportacao]="dadosExportacao" subtitulo="Preço por periodicidade, limites e funcionalidades de cada plano.">
        <button type="button" class="bo-btn" acoes [disabled]="!produtoId || !recursosCarregados" (click)="novo()">Novo plano</button>
      </app-cabecalho-pagina>
      <select class="bo-field max-w-xs" name="produto" [(ngModel)]="produtoId" (ngModelChange)="trocarProduto()">
        <option value="" disabled>Escolha o produto</option>
        @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
      </select>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form #formulario="ngForm" class="bo-card space-y-5 p-5" (ngSubmit)="salvar()">
          @if (editandoId) { <p class="text-sm font-semibold">Plano <app-numero [numero]="numeroEdicao" /></p> }
          <div class="grid gap-3 md:grid-cols-4">
            <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo" placeholder="PROFISSIONAL" [disabled]="!!editandoId"></label>
            <label class="md:col-span-2"><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo"> Ativo</label>
          </div>

          <fieldset class="space-y-2">
            <legend class="bo-label">Preços (vazio = {{ editandoId ? 'não muda' : 'não oferece' }})</legend>
            <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              @for (p of periodicidades; track p) {
                <label><span class="text-xs text-neutral-400">{{ rotuloPeriodicidade(p) }}</span>
                  <input class="bo-field" [name]="'preco' + p" inputmode="decimal" [(ngModel)]="form.precos[p]" placeholder="R$ 0,00"></label>
              }
            </div>
            @if (editandoId) { <p class="bo-sub">Preço diferente do atual vale a partir de hoje; contratações existentes mantêm o valor delas.</p> }
          </fieldset>

          <fieldset class="space-y-3">
            <legend class="bo-label">Limites e funcionalidades</legend>
            @for (l of form.recursos; track l.recursoId; let i = $index) {
              <div class="grid items-end gap-3 sm:grid-cols-[1fr_12rem_auto]">
                <div class="text-sm"><b>{{ recurso(l.recursoId)?.nome }}</b>
                  <span class="text-neutral-500"> · {{ l.tipo === 'LIMITE' ? 'limite' : 'funcionalidade' }}</span></div>
                @if (l.tipo === 'LIMITE') {
                  <label><span class="text-xs text-neutral-400">Quantidade ({{ recurso(l.recursoId)?.unidade || recurso(l.recursoId)?.codigo }})</span>
                    <input class="bo-field" [name]="'rv' + i" inputmode="decimal" [(ngModel)]="l.valor" placeholder="obrigatório"></label>
                } @else { <span class="bo-ok text-sm">incluída</span> }
                <button type="button" class="bo-link pb-3" (click)="form.recursos.splice(i, 1)">Remover</button>
              </div>
            } @empty { <p class="bo-sub">Nenhum recurso no plano ainda.</p> }
            @if (disponiveis().length) {
              <label class="block max-w-sm"><span class="text-xs text-neutral-400">Adicionar recurso</span>
                <select class="bo-field" name="adicionarRecurso" [ngModel]="''" (ngModelChange)="adicionarRecurso($event)">
                  <option value="" disabled>Escolha um limite ou funcionalidade</option>
                  @for (r of disponiveis(); track r.id) {
                    <option [value]="r.id">{{ r.nome }} ({{ r.tipo === 'LIMITE' ? 'limite' : 'funcionalidade' }}{{ r.valorPadrao != null ? ', padrão ' + r.valorPadrao : '' }})</option>
                  }
                </select>
              </label>
            } @else if (!recursos.length) { <p class="bo-sub">Este produto ainda não tem recursos; cadastre em Recursos.</p> }
          </fieldset>

          <div class="flex justify-between gap-2 border-t border-[#262626] pt-4">
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.codigo.trim() || !form.nome.trim() || limitesSemValor(form.recursos)">Salvar plano</button>
          </div>
        </form>
      }
      @for (p of planos; track p.id) {
        <section class="bo-card space-y-3 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{{ p.nome }} <span class="text-sm text-neutral-500">{{ p.codigo }}</span></h2>
              <p class="bo-sub">
                @for (v of p.precosVigentes; track v.periodicidade) { {{ rotuloPeriodicidade(v.periodicidade) }} {{ dinheiro(v.valor) }} · }
                @if (!p.precosVigentes.length) { Sem preço · }
                <span [class]="p.ativo ? 'bo-ok' : 'bo-mute'">{{ p.ativo ? 'ativo' : 'inativo' }}</span></p>
            </div>
            <button type="button" class="bo-link" (click)="editar(p)">Editar</button>
          </div>
          <p class="text-sm text-neutral-300">
            @for (r of p.recursos; track r.recursoId; let ultimo = $last) { {{ nomeRecurso(r.recursoId, r.codigo) }}{{ r.tipo === 'LIMITE' ? ': ' + r.valor : '' }}{{ ultimo ? '' : ' · ' }} }
            @if (!p.recursos.length) { Sem recursos. }
          </p>
          @if (p.precos.length) {
            <details class="text-sm text-neutral-400"><summary class="cursor-pointer">Histórico de preços ({{ p.precos.length }})</summary>
              @for (pr of p.precos; track pr.id) { <p>{{ rotuloPeriodicidade(pr.periodicidade) }} · {{ dinheiro(pr.valor) }} desde {{ data(pr.vigenteDesde) }}</p> }
            </details>
          }
        </section>
      } @empty {
        <p class="bo-sub">{{ produtoId ? 'Nenhum plano para este produto.' : 'Escolha um produto.' }}</p>
      }
    </div>
  `
})
export class PlanosComponent implements OnInit {
  readonly dadosExportacao = () => ({ nome: 'planos', titulo: 'Central · Planos', colunas: ['Código', 'Nome', 'Situação', 'Preços vigentes'], linhas: this.planos.map(p => [p.codigo, p.nome, p.ativo ? 'Ativo' : 'Inativo', p.precosVigentes.map(v => `${v.periodicidade}: ${v.valor}`).join(' · ')]) });
  @ViewChild('formulario') formulario?: NgForm;
  hasPendingChanges(): boolean { return this.salvando || (this.editando && !!this.formulario?.dirty); }
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  recursos: Recurso[] = [];
  planos: Plano[] = [];
  produtoId = '';
  /** O formulário depende dos recursos do produto: sem eles não há o que adicionar. */
  recursosCarregados = false;
  editando = false;
  editandoId: string | null = null;
  numeroEdicao: number | null = null;
  salvando = false;
  erro = '';
  form: {
    codigo: string; nome: string; ativo: boolean; recursos: LinhaRecursoDoPlano[]; precos: Partial<Record<Periodicidade, string>>;
  } = { codigo: '', nome: '', ativo: true, recursos: [], precos: {} };

  readonly periodicidades = PERIODICIDADES;
  readonly dinheiro = dinheiro;
  readonly data = data;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;
  readonly limitesSemValor = limitesSemValor;

  ngOnInit(): void {
    this.api.produtos().subscribe({
      next: l => {
        this.produtos = l;
        if (l.length) { this.produtoId = l[0].id; this.trocarProduto(); }
      },
      error: e => this.erro = mensagemApi(e, 'Não foi possível listar os produtos.')
    });
  }

  trocarProduto(): void {
    this.editando = false;
    this.recursosCarregados = false;
    this.api.recursos(this.produtoId).subscribe({ next: l => { this.recursos = l; this.recursosCarregados = true; } });
    this.carregarPlanos();
  }

  carregarPlanos(): void {
    this.api.planos(this.produtoId).subscribe({ next: l => this.planos = l, error: e => this.erro = mensagemApi(e, 'Não foi possível listar os planos.') });
  }

  recurso(id: string): Recurso | undefined {
    return this.recursos.find(r => r.id === id);
  }

  nomeRecurso(id: string, codigo: string): string {
    return this.recurso(id)?.nome ?? codigo;
  }

  /** Recursos do produto que ainda não estão no plano. */
  disponiveis(): Recurso[] {
    const noPlano = new Set(this.form.recursos.map(l => l.recursoId));
    return this.recursos.filter(r => !noPlano.has(r.id));
  }

  adicionarRecurso(id: string): void {
    const r = this.recurso(id);
    if (!r) return;
    this.form.recursos.push({ recursoId: r.id, tipo: r.tipo, valor: r.valorPadrao != null ? String(r.valorPadrao) : '' });
  }

  novo(): void {
    this.editandoId = null;
    this.numeroEdicao = null;
    this.form = { codigo: '', nome: '', ativo: true, recursos: [], precos: {} };
    this.editando = true;
  }

  editar(p: Plano): void {
    this.editandoId = p.id;
    this.numeroEdicao = p.sequencial;
    const precos: Partial<Record<Periodicidade, string>> = {};
    for (const v of p.precosVigentes) precos[v.periodicidade] = String(v.valor);
    this.form = {
      codigo: p.codigo, nome: p.nome, ativo: p.ativo, precos,
      recursos: p.recursos.map(r => ({ recursoId: r.recursoId, tipo: r.tipo, valor: r.tipo === 'LIMITE' ? String(r.valor) : '' }))
    };
    this.editando = true;
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    const corpo = montarPlanoRequest({ ...this.form, produtoId: this.produtoId });
    const chamada = this.editandoId ? this.api.atualizarPlano(this.editandoId, corpo) : this.api.criarPlano(corpo);
    chamada.subscribe({
      next: () => { this.salvando = false; this.editando = false; this.carregarPlanos(); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o plano.'); }
    });
  }
}
