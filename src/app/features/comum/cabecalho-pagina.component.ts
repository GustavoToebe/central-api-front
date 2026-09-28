import { Component, input } from '@angular/core';

/**
 * Cabeçalho de página padrão (PLANO-002): título à esquerda + ações à direita,
 * subtítulo `.bo-sub` embaixo, linha fina `#262626` separando do conteúdo.
 * No celular as ações descem para baixo do título.
 */
@Component({
  selector: 'app-cabecalho-pagina',
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
        </div>
      </div>
      <div class="mt-4 border-b border-[#262626]"></div>
    </div>
  `
})
export class CabecalhoPaginaComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');
}
