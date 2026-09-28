import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Rodapé fixo de formulário padrão (PLANO-002):
 * Cancelar à esquerda, Salvar à direita, `<ng-content>` opcional no meio.
 */
@Component({
  selector: 'app-rodape-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="sticky bottom-0 flex items-center gap-3 border-t border-[#262626] bg-[#101010] px-4 py-3">
      @if (voltarUrl()) {
        <a [routerLink]="voltarUrl()" class="bo-btn-ghost">Cancelar</a>
      } @else {
        <button type="button" class="bo-btn-ghost" (click)="cancelar.emit()">Cancelar</button>
      }
      <ng-content />
      <button type="submit" class="bo-btn ml-auto" [disabled]="carregando() || desabilitado()" data-salvar>
        {{ carregando() ? 'Salvando…' : rotuloSalvar() }}
      </button>
    </div>
  `
})
export class RodapeFormComponent {
  /** URL para o routerLink do Cancelar. Se vazio, usa output `cancelar`. */
  readonly voltarUrl = input<string | string[]>('');
  readonly rotuloSalvar = input<string>('Salvar');
  readonly carregando = input<boolean>(false);
  /** Salvar desligado sem estar salvando (formulário incompleto). */
  readonly desabilitado = input<boolean>(false);
  readonly cancelar = output<void>();
}
