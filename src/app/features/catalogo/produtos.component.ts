import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import { NumeroComponent } from '../comum/numero.component';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Produto } from '../../core/api/central.models';
import { montarProdutoRequest } from './catalogo.form';

@Component({
  selector: 'app-produtos',
  imports: [FormsModule, NumeroComponent, CabecalhoPaginaComponent, EstadoListaComponent],
  template: `
    <div class="space-y-6">
      <app-cabecalho-pagina titulo="Produtos" [exportacao]="dadosExportacao" subtitulo="Os aplicativos do ecossistema. O código precisa ser o que o app pede (o Servirea usa SERVIREA).">
        <button type="button" class="bo-btn" acoes (click)="novo()">Novo produto</button>
      </app-cabecalho-pagina>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (editando) {
        <form #formulario="ngForm" class="bo-card grid gap-3 p-5 md:grid-cols-4" (ngSubmit)="salvar()">
          @if (editandoId) { <p class="text-sm font-semibold md:col-span-4">Produto <app-numero [numero]="numeroEdicao" /></p> }
          <label><span class="bo-label">Código *</span><input class="bo-field" name="codigo" [(ngModel)]="form.codigo"></label>
          <label><span class="bo-label">Nome *</span><input class="bo-field" name="nome" [(ngModel)]="form.nome"></label>
          <label class="md:col-span-2"><span class="bo-label">URL base da integração</span>
            <input class="bo-field" name="url" [(ngModel)]="form.urlBaseIntegracao" placeholder="https://api.servirea.com.br"></label>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo"> Ativo</label>
          <div class="flex justify-between gap-2 md:col-span-3">
            <button class="bo-btn-ghost" type="button" (click)="editando = false">Cancelar</button>
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.codigo.trim() || !form.nome.trim()">Salvar</button>
          </div>
        </form>
      }
      <div class="bo-table-wrap">
        <div class="bo-table-rolagem">
        <table class="bo-table">
          <thead><tr><th>Código</th><th>Nome</th><th>URL da integração</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            @for (p of produtos; track p.id) {
              <tr class="clicavel" tabindex="0" (click)="editar(p)" (keydown.enter)="editar(p)">
                <td class="font-semibold">{{ p.codigo }}</td><td>{{ p.nome }}</td>
                <td class="break-all text-neutral-400">{{ p.urlBaseIntegracao || '—' }}</td>
                <td><span [class]="p.ativo ? 'bo-ok' : 'bo-mute'">{{ p.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                <td class="text-right"><button type="button" class="bo-link" (click)="$event.stopPropagation(); editar(p)">Editar</button></td>
              </tr>
            }
          </tbody>
        </table>
        </div>
        <app-estado-lista [vazio]="!produtos.length" mensagemVazio="Nenhum produto." />
      </div>
    </div>
  `
})
export class ProdutosComponent implements OnInit {
  readonly dadosExportacao = () => ({ nome: 'produtos', titulo: 'Central · Produtos', colunas: ['Código', 'Nome', 'Situação'], linhas: this.produtos.map(p => [p.codigo, p.nome, p.ativo ? 'Ativo' : 'Inativo']) });
  @ViewChild('formulario') formulario?: NgForm;
  hasPendingChanges(): boolean { return this.salvando || (this.editando && !!this.formulario?.dirty); }
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  editando = false;
  editandoId: string | null = null;
  numeroEdicao: number | null = null;
  salvando = false;
  erro = '';
  form = { codigo: '', nome: '', urlBaseIntegracao: '', ativo: true };

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.api.produtos().subscribe({ next: l => this.produtos = l, error: e => this.erro = mensagemApi(e, 'Não foi possível listar os produtos.') });
  }

  novo(): void {
    this.editandoId = null;
    this.numeroEdicao = null;
    this.form = { codigo: '', nome: '', urlBaseIntegracao: '', ativo: true };
    this.editando = true;
  }

  editar(p: Produto): void {
    this.editandoId = p.id;
    this.numeroEdicao = p.sequencial;
    this.form = { codigo: p.codigo, nome: p.nome, urlBaseIntegracao: p.urlBaseIntegracao ?? '', ativo: p.ativo };
    this.editando = true;
  }

  salvar(): void {
    this.salvando = true;
    this.erro = '';
    const corpo = montarProdutoRequest(this.form);
    const chamada = this.editandoId ? this.api.atualizarProduto(this.editandoId, corpo) : this.api.criarProduto(corpo);
    chamada.subscribe({
      next: () => { this.salvando = false; this.editando = false; this.carregar(); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o produto.'); }
    });
  }
}
