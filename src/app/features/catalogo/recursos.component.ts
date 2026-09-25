import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Produto, Recurso, TipoRecurso } from '../../core/api/central.models';
import { montarRecursoRequest } from './catalogo.form';

@Component({
  selector: 'app-recursos',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Recursos</h1>
          <p class="bo-sub">O que um plano limita (voluntários, usuários, armazenamento) ou libera (funcionalidades).</p>
        </div>
        <button type="button" class="bo-btn" [disabled]="!produtos.length" (click)="novo()">Novo recurso</button>
      </div>
      <select class="bo-field max-w-xs" name="filtro" [(ngModel)]="produtoId" (ngModelChange)="carregar()">
        <option value="">Todos os produtos</option>
        @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
      </select>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form class="bo-card grid gap-3 p-5 md:grid-cols-5" (ngSubmit)="salvar()">
          <label><span class="bo-label">Produto *</span>
            <select class="bo-field" name="produto" [(ngModel)]="form.produtoId">
              @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
            </select>
          </label>
          <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo" placeholder="VOLUNTARIOS"></label>
          <label><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
          <label><span class="bo-label">Tipo *</span>
            <select class="bo-field" name="tipo" [(ngModel)]="form.tipo"><option value="LIMITE">Limite</option><option value="FUNCIONALIDADE">Funcionalidade</option></select>
          </label>
          <label><span class="bo-label">Unidade</span><input class="bo-field" name="unidade" [(ngModel)]="form.unidade" placeholder="pessoa, MB"></label>
          <div class="flex gap-2 md:col-span-5 md:justify-end">
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.produtoId || !form.codigo.trim() || !form.nome.trim()">Salvar</button>
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
          </div>
        </form>
      }
      <div class="bo-table-wrap">
        <table class="bo-table">
          <thead><tr><th>Produto</th><th>Código</th><th>Nome</th><th>Tipo</th><th>Unidade</th><th></th></tr></thead>
          <tbody>
            @for (r of recursos; track r.id) {
              <tr>
                <td>{{ nomeProduto(r.produtoId) }}</td><td class="font-semibold">{{ r.codigo }}</td><td>{{ r.nome }}</td>
                <td>{{ r.tipo === 'LIMITE' ? 'Limite' : 'Funcionalidade' }}</td><td>{{ r.unidade || '—' }}</td>
                <td class="text-right"><button type="button" class="bo-link" (click)="editar(r)">Editar</button></td>
              </tr>
            } @empty { <tr><td colspan="6" class="text-center text-neutral-500">Nenhum recurso.</td></tr> }
          </tbody>
        </table>
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
  salvando = false;
  erro = '';
  form = { produtoId: '', codigo: '', nome: '', tipo: 'LIMITE' as TipoRecurso, unidade: '' };

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

  novo(): void {
    this.editandoId = null;
    this.form = { produtoId: this.produtoId || this.produtos[0]?.id || '', codigo: '', nome: '', tipo: 'LIMITE', unidade: '' };
    this.editando = true;
  }

  editar(r: Recurso): void {
    this.editandoId = r.id;
    this.form = { produtoId: r.produtoId, codigo: r.codigo, nome: r.nome, tipo: r.tipo, unidade: r.unidade ?? '' };
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
