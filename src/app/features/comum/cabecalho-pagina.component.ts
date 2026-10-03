import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { exportarTabela, FormatoExportacao, TabelaExportacao } from './exportacao-tabela';
import { Router, RouterLink } from '@angular/router';
import { ajudaDaRota } from '../ajuda/ajuda-da-rota';

/**
 * Cabeçalho de página padrão (PLANO-002): título à esquerda + ações à direita,
 * subtítulo `.bo-sub` embaixo, linha fina `#262626` separando do conteúdo.
 * No celular as ações descem para baixo do título.
 * O botão "Ajuda" é automático: abre o tema que explica a tela atual (veja `ajuda-da-rota.ts`).
 */
@Component({
  selector: 'app-cabecalho-pagina',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="bo-title">{{ titulo() }}</h1>
          @if (subtitulo()) {
            <p class="bo-sub mt-1">{{ subtitulo() }}</p>
          }
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <ng-content select="[acoes]" />
          @if (exportacao()) {
            <select class="bo-field !w-auto nao-imprimir" aria-label="Formato da exportação" [(ngModel)]="formato" [ngModelOptions]="{standalone:true}"><option value="xlsx">Excel (XLSX)</option><option value="csv">CSV</option><option value="json">JSON</option><option value="pdf">PDF</option><option value="png">Imagem</option></select>
            <button type="button" class="bo-btn-ghost nao-imprimir" [disabled]="exportando() || exportacaoOcupada()" (click)="exportar()">{{exportando() ? 'Preparando...' : 'Exportar filtrados'}}</button>
          }
          @if (temaDeAjuda; as tema) {
            <a routerLink="/ajuda" [queryParams]="{ tema }" class="bo-btn-ghost nao-imprimir" data-ajuda aria-label="Ajuda desta tela">Ajuda</a>
          }
        </div>
      </div>
      <div class="mt-4 border-b border-[#262626]"></div>
      @if (erroExportacao()) {<p class="mt-3 text-sm text-rose-400 nao-imprimir" role="alert">{{erroExportacao()}}</p>}
    </div>
  `
})
export class CabecalhoPaginaComponent {
  readonly exportacao = input<(() => TabelaExportacao | Promise<TabelaExportacao>) | undefined>();
  readonly exportacaoOcupada = input(false);
  readonly exportando = signal(false);
  readonly erroExportacao = signal('');
  formato: FormatoExportacao = 'xlsx';
  private destruido = false;
  constructor() { inject(DestroyRef).onDestroy(() => { this.destruido = true; }); }
  async exportar() {
    const coletar = this.exportacao(); if (!coletar || this.exportando() || this.exportacaoOcupada()) return;
    const formato = this.formato; this.exportando.set(true); this.erroExportacao.set('');
    try { await exportarTabela(await coletar(), formato, () => !this.destruido); }
    catch (e) { if (!this.destruido) this.erroExportacao.set(e instanceof Error ? e.message : 'Não foi possível exportar.'); }
    finally { if (!this.destruido) this.exportando.set(false); }
  }
  private readonly router = inject(Router);
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');
  /** Para páginas que já têm a própria explicação na tela (a Ajuda). */
  readonly semAjuda = input(false);

  get temaDeAjuda(): string | null { return this.semAjuda() ? null : ajudaDaRota(this.router.url); }
}
