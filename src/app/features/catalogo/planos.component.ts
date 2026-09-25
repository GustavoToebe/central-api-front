import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Periodicidade, Plano, Produto, Recurso, TipoRecurso } from '../../core/api/central.models';
import { data, dinheiro, hojeIso, rotuloPeriodicidade } from '../comum/rotulos';
import { montarPlanoRequest, montarPrecoRequest } from './catalogo.form';

interface LinhaRecurso { recursoId: string; codigo: string; nome: string; tipo: TipoRecurso; unidade: string | null; valor: string; marcado: boolean; }

@Component({
  selector: 'app-planos',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Planos e preços</h1>
          <p class="bo-sub">Limites e funcionalidades de cada plano. O preço vigente vale para contratação nova sem valor informado.</p>
        </div>
        <button type="button" class="bo-btn" [disabled]="!produtoId || !recursosCarregados" (click)="novo()">Novo plano</button>
      </div>
      <select class="bo-field max-w-xs" name="produto" [(ngModel)]="produtoId" (ngModelChange)="trocarProduto()">
        <option value="" disabled>Escolha o produto</option>
        @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
      </select>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form class="bo-card space-y-4 p-5" (ngSubmit)="salvar()">
          <div class="grid gap-3 md:grid-cols-4">
            <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo" placeholder="PROFISSIONAL"></label>
            <label class="md:col-span-2"><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo"> Ativo</label>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            @for (r of form.recursos; track r.recursoId; let i = $index) {
              @if (r.tipo === 'LIMITE') {
                <label><span class="bo-label">{{ r.nome }} ({{ r.unidade || r.codigo }})</span>
                  <input class="bo-field" [name]="'rv' + i" [(ngModel)]="r.valor" placeholder="vazio = fora do plano"></label>
              } @else {
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" [name]="'rm' + i" [(ngModel)]="r.marcado"> {{ r.nome }}</label>
              }
            } @empty { <p class="bo-sub md:col-span-3">Este produto ainda não tem recursos.</p> }
          </div>
          <div class="flex gap-2">
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.codigo.trim() || !form.nome.trim()">Salvar plano</button>
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
          </div>
        </form>
      }
      @for (p of planos; track p.id) {
        <section class="bo-card space-y-3 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{{ p.nome }} <span class="text-sm text-neutral-500">{{ p.codigo }}</span></h2>
              <p class="bo-sub">{{ dinheiro(p.precoMensal) }}/mês · {{ dinheiro(p.precoAnual) }}/ano ·
                <span [class]="p.ativo ? 'bo-ok' : 'bo-mute'">{{ p.ativo ? 'ativo' : 'inativo' }}</span></p>
            </div>
            <div class="flex gap-3">
              <button type="button" class="bo-link" (click)="editar(p)">Editar</button>
              <button type="button" class="bo-link" (click)="abrirPreco(p.id)">Novo preço</button>
            </div>
          </div>
          <p class="text-sm text-neutral-300">
            @for (r of p.recursos; track r.recursoId; let ultimo = $last) { {{ r.codigo }}{{ r.tipo === 'LIMITE' ? ': ' + r.valor : '' }}{{ ultimo ? '' : ' · ' }} }
            @if (!p.recursos.length) { Sem recursos. }
          </p>
          @if (precoDoPlano === p.id) {
            <form class="grid gap-3 md:grid-cols-4" (ngSubmit)="salvarPreco(p.id)">
              <label><span class="bo-label">Periodicidade</span>
                <select class="bo-field" name="pPer" [(ngModel)]="preco.periodicidade"><option value="MENSAL">Mensal</option><option value="ANUAL">Anual</option></select></label>
              <label><span class="bo-label">Valor</span><input class="bo-field" name="pValor" [(ngModel)]="preco.valor" placeholder="49,90"></label>
              <label><span class="bo-label">Vigente desde</span><input class="bo-field" type="date" name="pData" [(ngModel)]="preco.vigenteDesde"></label>
              <div class="flex items-end gap-2">
                <button class="bo-btn" type="submit" [disabled]="salvando || !preco.valor.trim()">Salvar preço</button>
                <button class="bo-btn-ghost" type="button" (click)="precoDoPlano = null">Cancelar</button>
              </div>
            </form>
          }
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
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  recursos: Recurso[] = [];
  planos: Plano[] = [];
  produtoId = '';
  /** O formulário é montado a partir dos recursos do produto: sem eles, nasceria vazio. */
  recursosCarregados = false;
  editando = false;
  editandoId: string | null = null;
  salvando = false;
  erro = '';
  form: { codigo: string; nome: string; ativo: boolean; recursos: LinhaRecurso[] } = { codigo: '', nome: '', ativo: true, recursos: [] };
  precoDoPlano: string | null = null;
  preco = { periodicidade: 'MENSAL' as Periodicidade, valor: '', vigenteDesde: hojeIso() };

  readonly dinheiro = dinheiro;
  readonly data = data;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;

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

  private linhas(plano?: Plano): LinhaRecurso[] {
    return this.recursos.map(r => {
      const doPlano = plano?.recursos.find(x => x.recursoId === r.id);
      return {
        recursoId: r.id, codigo: r.codigo, nome: r.nome, tipo: r.tipo, unidade: r.unidade,
        valor: doPlano && r.tipo === 'LIMITE' ? String(doPlano.valor) : '', marcado: !!doPlano
      };
    });
  }

  novo(): void {
    this.editandoId = null;
    this.form = { codigo: '', nome: '', ativo: true, recursos: this.linhas() };
    this.editando = true;
  }

  editar(p: Plano): void {
    this.editandoId = p.id;
    this.form = { codigo: p.codigo, nome: p.nome, ativo: p.ativo, recursos: this.linhas(p) };
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

  abrirPreco(planoId: string): void {
    this.precoDoPlano = planoId;
    this.preco = { periodicidade: 'MENSAL', valor: '', vigenteDesde: hojeIso() };
  }

  salvarPreco(planoId: string): void {
    this.salvando = true;
    this.erro = '';
    this.api.adicionarPreco(planoId, montarPrecoRequest(this.preco)).subscribe({
      next: () => { this.salvando = false; this.precoDoPlano = null; this.carregarPlanos(); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o preço.'); }
    });
  }
}
