import { Component, inject, input } from '@angular/core';
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
  imports: [RouterLink],
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
          @if (temaDeAjuda; as tema) {
            <a routerLink="/ajuda" [queryParams]="{ tema }" class="bo-btn-ghost nao-imprimir" data-ajuda aria-label="Ajuda desta tela">Ajuda</a>
          }
        </div>
      </div>
      <div class="mt-4 border-b border-[#262626]"></div>
    </div>
  `
})
export class CabecalhoPaginaComponent {
  private readonly router = inject(Router);
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');
  /** Para páginas que já têm a própria explicação na tela (a Ajuda). */
  readonly semAjuda = input(false);

  get temaDeAjuda(): string | null { return this.semAjuda() ? null : ajudaDaRota(this.router.url); }
}
