import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import { NumeroComponent } from '../comum/numero.component';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Produto, Recurso, RecursoDoApp, TipoRecurso } from '../../core/api/central.models';
import { montarRecursoRequest } from './catalogo.form';

/**
 * Recursos do produto. No cadastro, o aplicativo sugere os limites e
 * funcionalidades que entende (contrato 5.5, 26/09/2026): escolher a sugestão
 * preenche o código exato que o app lê nos direitos.
 */
@Component({
  selector: 'app-recursos',
  imports: [FormsModule, NumeroComponent, CabecalhoPaginaComponent, EstadoListaComponent],
  template: `
    <div class="space-y-6">
      <app-cabecalho-pagina titulo="Recursos" subtitulo="O que um plano limita (voluntários, usuários, armazenamento) ou libera (funcionalidades).">
        <button type="button" class="bo-btn" acoes [disabled]="!produtos.length" (click)="novo()">Novo recurso</button>
      </app-cabecalho-pagina>
      <select class="bo-field max-w-xs" name="filtro" [(ngModel)]="produtoId" (ngModelChange)="carregar()">
        <option value="">Todos os produtos</option>
        @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
      </select>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form class="bo-card grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-6" (ngSubmit)="salvar()">
          @if (editandoId) { <p class="text-sm font-semibold md:col-span-3 xl:col-span-6">Recurso <app-numero [numero]="numeroEdicao" /></p> }
          <label><span class="bo-label">Produto *</span>
            <select class="bo-field" name="produto" [(ngModel)]="form.produtoId" (ngModelChange)="carregarSugestoes()" [disabled]="!!editandoId">
              @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
            </select>
          </label>
          @if (!editandoId) {
            <label class="md:col-span-2 xl:col-span-5"><span class="bo-label">Sugestões do aplicativo</span>
              @if (sugestoes.length) {
                <select class="bo-field" name="sugestao" [ngModel]="''" (ngModelChange)="usarSugestao($event)">
                  <option value="" disabled>Escolha um limite ou funcionalidade que o aplicativo entende</option>
                  @for (s of sugestoes; track s.codigo) {
                    <option [value]="s.codigo" [disabled]="s.cadastrado">
                      {{ s.nome }} · {{ s.tipo === 'LIMITE' ? 'limite' : 'funcionalidade' }} · {{ s.codigo }}{{ s.cadastrado ? ' (já cadastrado)' : '' }}{{ s.aplicado ? '' : ' (ainda não aplicado pelo app)' }}
                    </option>
                  }
                </select>
              } @else {
                <span class="bo-sub block pt-2">{{ avisoSugestoes || 'Carregando...' }}</span>
              }
            </label>
          }
          <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo" placeholder="voluntarios" [disabled]="!!editandoId"></label>
          <label><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
          <label><span class="bo-label">Tipo *</span>
            <select class="bo-field" name="tipo" [(ngModel)]="form.tipo"><option value="LIMITE">Limite</option><option value="FUNCIONALIDADE">Funcionalidade</option></select>
          </label>
          <label><span class="bo-label">Unidade</span><input class="bo-field" name="unidade" [(ngModel)]="form.unidade" placeholder="pessoa, MB"></label>
          @if (form.tipo === 'LIMITE') {
            <label><span class="bo-label">Valor padrão</span><input class="bo-field" name="valorPadrao" inputmode="decimal" [(ngModel)]="form.valorPadrao" placeholder="ex.: 100"></label>
          }
          @if (escolhida && !escolhida.aplicado) {
            <p class="bo-sub md:col-span-3 xl:col-span-6">O aplicativo aceita este código, mas ainda não faz valer o limite ou a funcionalidade.</p>
          }
          <div class="flex justify-between gap-2 md:col-span-3  xl:col-span-6">
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.produtoId || !form.codigo.trim() || !form.nome.trim()">Salvar</button>
          </div>
        </form>
      }
      <div class="bo-table-wrap">
        <div class="bo-table-rolagem">
        <table class="bo-table">
          <thead><tr><th>Produto</th><th>Código</th><th>Nome</th><th>Tipo</th><th>Unidade</th><th>Valor padrão</th><th></th></tr></thead>
          <tbody>
            @for (r of recursos; track r.id) {
              <tr class="clicavel" tabindex="0" (click)="editar(r)" (keydown.enter)="editar(r)">
                <td>{{ nomeProduto(r.produtoId) }}</td><td class="font-semibold">{{ r.codigo }}</td><td>{{ r.nome }}</td>
                <td>{{ r.tipo === 'LIMITE' ? 'Limite' : 'Funcionalidade' }}</td><td>{{ r.unidade || '—' }}</td><td>{{ r.valorPadrao ?? '—' }}</td>
                <td class="text-right"><button type="button" class="bo-link" (click)="$event.stopPropagation(); editar(r)">Editar</button></td>
              </tr>
            }
          </tbody>
        </table>
        </div>
        <app-estado-lista [vazio]="!recursos.length" mensagemVazio="Nenhum recurso." />
      </div>
    </div>
  `
})
export class RecursosComponent implements OnInit {
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  recursos: Recurso[] = [];
  produtoId = '';
  editando = false;
  editandoId: string | null = null;
  numeroEdicao: number | null = null;
  salvando = false;
  erro = '';
  sugestoes: RecursoDoApp[] = [];
  avisoSugestoes = '';
  escolhida: RecursoDoApp | null = null;
  form = { produtoId: '', codigo: '', nome: '', tipo: 'LIMITE' as TipoRecurso, unidade: '', valorPadrao: '' };

  ngOnInit(): void {
    this.api.produtos().subscribe({ next: l => this.produtos = l });
    this.carregar();
  }

  carregar(): void {
    this.api.recursos(this.produtoId || undefined).subscribe({
      next: l => this.recursos = l,
      error: e => this.erro = mensagemApi(e, 'Não foi possível listar os recursos.')
    });
  }

  nomeProduto(id: string): string {
    return this.produtos.find(p => p.id === id)?.nome ?? '—';
  }

  /** Sem URL de integração ou com o app fora do ar, o cadastro continua à mão. */
  carregarSugestoes(): void {
    this.sugestoes = [];
    this.escolhida = null;
    this.avisoSugestoes = '';
    if (!this.form.produtoId) return;
    this.api.recursosDoApp(this.form.produtoId).subscribe({
      next: l => {
        this.sugestoes = l;
        if (!l.length) this.avisoSugestoes = 'O aplicativo não informou recursos; preencha à mão.';
      },
      error: e => this.avisoSugestoes = mensagemApi(e, 'Sem sugestões do aplicativo') + ' Preencha à mão.'
    });
  }

  usarSugestao(codigo: string): void {
    const s = this.sugestoes.find(x => x.codigo === codigo);
    if (!s) return;
    this.escolhida = s;
    this.form = { ...this.form, codigo: s.codigo, nome: s.nome, tipo: s.tipo, unidade: s.unidade ?? '' };
  }

  novo(): void {
    this.editandoId = null;
    this.numeroEdicao = null;
    this.form = { produtoId: this.produtoId || this.produtos[0]?.id || '', codigo: '', nome: '', tipo: 'LIMITE', unidade: '', valorPadrao: '' };
    this.editando = true;
    this.carregarSugestoes();
  }

  editar(r: Recurso): void {
    this.editandoId = r.id;
    this.numeroEdicao = r.sequencial;
    this.escolhida = null;
    this.form = { produtoId: r.produtoId, codigo: r.codigo, nome: r.nome, tipo: r.tipo, unidade: r.unidade ?? '', valorPadrao: r.valorPadrao != null ? String(r.valorPadrao) : '' };
    this.editando = true;
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    const corpo = montarRecursoRequest(this.form);
    const chamada = this.editandoId ? this.api.atualizarRecurso(this.editandoId, corpo) : this.api.criarRecurso(corpo);
    chamada.subscribe({
      next: () => { this.salvando = false; this.editando = false; this.carregar(); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o recurso.'); }
    });
  }
}
