import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Estado da lista padrão (PLANO-002): skeleton de carregamento ou mensagem de vazio.
 * Fica abaixo da `<table>` e substitui as linhas "Carregando…"/"Nenhum…" de hoje.
 */
@Component({
  selector: 'app-estado-lista',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (carregando()) {
      <div class="space-y-2 p-2" aria-live="polite" aria-label="Carregando…">
        @for (_ of esqueleto; track $index) {
          <div class="h-[55px] rounded-lg bg-[#1f1f1f] motion-safe:animate-pulse" data-esqueleto></div>
        }
      </div>
    } @else if (vazio()) {
      <div class="py-12 text-center">
        <p class="bo-sub">{{ mensagemVazio() }}</p>
      </div>
    }
  `
})
export class EstadoListaComponent {
  readonly carregando = input(false);
  readonly vazio = input(false);
  readonly mensagemVazio = input<string>('Nenhum registro encontrado, tente outros filtros.');

  readonly esqueleto = Array.from({ length: 5 });
}
