import { Component, HostListener, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormaPagamento, RegistrarPagamentoRequest } from '../../core/api/central.models';
import { montarPagamento } from '../contratacoes/contratacao.form';
import { CampoDataComponent } from '../comum/campo-data.component';
import { FORMAS_PAGAMENTO, dinheiro, hojeIso, rotuloFormaPagamento } from '../comum/rotulos';

/** Uma cobrança escolhida para pagar: o suficiente para o operador conferir. */
export interface CobrancaAPagar {
  id: string;
  descricao: string;
  valor: number;
}

/**
 * Modal "Pagar" (26/09/2026): substitui o formulário fixo de "Registrar
 * pagamento". Serve à aba Financeiro da contratação e à tela Cobranças.
 */
@Component({
  selector: 'app-pagamento-modal',
  imports: [FormsModule, CampoDataComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" (click)="fechar.emit()">
      <form class="bo-card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-5" role="dialog" aria-modal="true"
        aria-labelledby="titulo-pagamento" (click)="$event.stopPropagation()" (ngSubmit)="confirmar()">
        <h2 id="titulo-pagamento" class="text-lg font-bold">Pagar {{ cobrancas().length }} cobrança(s)</h2>
        <ul class="max-h-40 space-y-1 overflow-y-auto text-sm">
          @for (c of cobrancas(); track c.id) {
            <li class="flex justify-between gap-3"><span class="text-neutral-300">{{ c.descricao }}</span><span>{{ dinheiro(c.valor) }}</span></li>
          }
        </ul>
        <p class="flex justify-between border-t border-[#262626] pt-2 font-bold"><span>Total</span><span>{{ dinheiro(total()) }}</span></p>
        <div class="grid gap-3 sm:grid-cols-2">
          <label><span class="bo-label">Pago em *</span><app-campo-data name="pgData" [(ngModel)]="form.pagoEm" [max]="hoje" [limpavel]="false" /></label>
          <label><span class="bo-label">Forma *</span>
            <select class="bo-field" name="pgForma" [(ngModel)]="form.formaPagamento">
              @for (f of formas; track f) { <option [value]="f">{{ rotuloFormaPagamento(f) }}</option> }
            </select>
          </label>
          @if (cobrancas().length === 1) {
            <label><span class="bo-label">Valor pago (vazio = valor da cobrança)</span><input class="bo-field" name="pgValor" [(ngModel)]="form.valorPago"></label>
          }
          <label [class.sm:col-span-2]="cobrancas().length !== 1"><span class="bo-label">Observação</span><input class="bo-field" name="pgObs" [(ngModel)]="form.observacao"></label>
        </div>
        @if (erro()) { <div class="bo-erro">{{ erro() }}</div> }
        <div class="flex justify-end gap-2">
          <button class="bo-btn-ghost" type="button" (click)="fechar.emit()">Cancelar</button>
          <button class="bo-btn" type="submit" [disabled]="ocupado() || !form.pagoEm">Confirmar pagamento</button>
        </div>
      </form>
    </div>
  `
})
export class PagamentoModalComponent {
  readonly cobrancas = input.required<CobrancaAPagar[]>();
  readonly ocupado = input(false);
  readonly erro = input('');
  readonly pagar = output<RegistrarPagamentoRequest>();
  readonly fechar = output<void>();

  readonly hoje = hojeIso();
  readonly formas = FORMAS_PAGAMENTO;
  readonly dinheiro = dinheiro;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  form = { pagoEm: hojeIso(), formaPagamento: 'PIX' as FormaPagamento, valorPago: '', observacao: '' };

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.fechar.emit();
  }

  total(): number {
    return this.cobrancas().reduce((soma, c) => soma + Number(c.valor), 0);
  }

  confirmar(): void {
    const valorPago = this.cobrancas().length === 1 ? this.form.valorPago : '';
    this.pagar.emit(montarPagamento({ ...this.form, valorPago, cobrancaIds: this.cobrancas().map(c => c.id) }));
  }
}
