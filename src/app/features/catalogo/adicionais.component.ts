import { NumeroComponent } from '../comum/numero.component';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Adicional, Produto, Recurso } from '../../core/api/central.models';
import { dinheiro } from '../comum/rotulos';
import { montarAdicionalRequest } from './catalogo.form';

@Component({
  selector: 'app-adicionais',
  imports: [FormsModule, NumeroComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Adicionais</h1>
          <p class="bo-sub">Pacotes que somam a um limite sem trocar de plano (ex.: +50 voluntários).</p>
        </div>
        <button type="button" class="bo-btn" [disabled]="!produtoId || !recursosCarregados" (click)="novo()">Novo adicional</button>
      </div>
      <select class="bo-field max-w-xs" name="produto" [(ngModel)]="produtoId" (ngModelChange)="trocarProduto()">
        <option value="" disabled>Escolha o produto</option>
        @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
      </select>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form class="bo-card grid gap-3 p-5 md:grid-cols-6" (ngSubmit)="salvar()">
          <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo"></label>
          <label class="md:col-span-2"><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
          <label><span class="bo-label">Recurso *</span>
            <select class="bo-field" name="recurso" [(ngModel)]="form.recursoId">
              @for (r of limites(); track r.id) { <option [value]="r.id">{{ r.nome }}</option> }
            </select></label>
          <label><span class="bo-label">Quantidade *</span><input class="bo-field" name="qtd" [(ngModel)]="form.quantidade"></label>
          <label><span class="bo-label">Preço *</span><input class="bo-field" name="preco" [(ngModel)]="form.preco" placeholder="15,00"></label>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo"> Ativo</label>
          <div class="flex gap-2 md:col-span-5 md:justify-end">
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.recursoId || !form.codigo.trim() || !form.nome.trim()">Salvar</button>
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
          </div>
        </form>
      }
      <div class="bo-table-wrap">
        <table class="bo-table">
          <thead><tr><th>Código</th><th>Nome</th><th>Soma</th><th>Preço</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            @for (a of adicionais; track a.id) {
              <tr>
                <td class="font-semibold">{{ a.codigo }}</td><td>{{ a.nome }}<app-numero [numero]="a.sequencial" /></td><td>+{{ a.quantidade }} {{ a.recursoCodigo }}</td>
                <td>{{ dinheiro(a.preco) }}</td><td><span [class]="a.ativo ? 'bo-ok' : 'bo-mute'">{{ a.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td class="text-right"><button type="button" class="bo-link" (click)="editar(a)">Editar</button></td>
              </tr>
            } @empty { <tr><td colspan="6" class="text-center text-neutral-500">Nenhum adicional.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdicionaisComponent implements OnInit {
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  recursos: Recurso[] = [];
  adicionais: Adicional[] = [];
  produtoId = '';
  /** O formulário é montado a partir dos recursos do produto: sem eles, nasceria vazio. */
  recursosCarregados = false;
  editando = false;
  editandoId: string | null = null;
  salvando = false;
  erro = '';
  form = { recursoId: '', codigo: '', nome: '', quantidade: '', preco: '', ativo: true };
  readonly dinheiro = dinheiro;

  ngOnInit(): void {
    this.api.produtos().subscribe({
      next: l => {
        this.produtos = l;
        if (l.length) { this.produtoId = l[0].id; this.trocarProduto(); }
      },
      error: e => this.erro = mensagemApi(e, 'Não foi possível listar os produtos.')
    });
  }

  limites(): Recurso[] {
    return this.recursos.filter(r => r.tipo === 'LIMITE');
  }

  trocarProduto(): void {
    this.editando = false;
    this.recursosCarregados = false;
    this.api.recursos(this.produtoId).subscribe({ next: l => { this.recursos = l; this.recursosCarregados = true; } });
    this.carregar();
  }

  carregar(): void {
    this.api.adicionais(this.produtoId).subscribe({ next: l => this.adicionais = l, error: e => this.erro = mensagemApi(e, 'Não foi possível listar os adicionais.') });
  }

  novo(): void {
    this.editandoId = null;
    this.form = { recursoId: this.limites()[0]?.id ?? '', codigo: '', nome: '', quantidade: '', preco: '', ativo: true };
    this.editando = true;
  }

  editar(a: Adicional): void {
    this.editandoId = a.id;
    this.form = { recursoId: a.recursoId, codigo: a.codigo, nome: a.nome, quantidade: String(a.quantidade), preco: String(a.preco), ativo: a.ativo };
    this.editando = true;
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    const corpo = montarAdicionalRequest({ ...this.form, produtoId: this.produtoId });
    const chamada = this.editandoId ? this.api.atualizarAdicional(this.editandoId, corpo) : this.api.criarAdicional(corpo);
    chamada.subscribe({
      next: () => { this.salvando = false; this.editando = false; this.carregar(); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o adicional.'); }
    });
  }
}
