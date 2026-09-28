import { NumeroComponent } from '../comum/numero.component';
import { ModalComponent } from '../comum/modal.component';
import { Component, OnInit, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaDetalhe } from '../../core/api/central.models';
import {
  competencia, data, dinheiro, rotuloFormaPagamento, rotuloPeriodicidade, rotuloStatusCobranca, tomCobranca
} from '../comum/rotulos';

/** Detalhe de uma cobrança: de onde vem o valor (plano e adicionais) e o pagamento. */
@Component({
  selector: 'app-cobranca-detalhe-modal',
  imports: [RouterLink, NumeroComponent, ModalComponent],
  template: `
    <app-modal [aberto]="true" titulo="Cobrança" tamanho="lg" (fechar)="fechar.emit()">
      <div class="space-y-4">
        @if (d) {
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-neutral-500">{{ d.cobranca.produtoCodigo }} · {{ d.cobranca.nomeInstancia }}</div>
              <h3 class="text-lg font-bold">Competência {{ competencia(d.cobranca.competenciaInicio, d.cobranca.competenciaFim) }}<app-numero [numero]="d.cobranca.sequencial" /></h3>
              <p class="bo-sub">{{ d.cobranca.clienteNome }} · {{ d.cobranca.planoNome }} ({{ rotuloPeriodicidade(d.cobranca.periodicidade) }})</p>
            </div>
            <span [class]="tomCobranca(d.cobranca.status, d.cobranca.vencida)">{{ rotuloStatusCobranca(d.cobranca.status, d.cobranca.vencida) }}</span>
          </div>
          <dl class="grid gap-3 text-sm sm:grid-cols-3">
            <div><dt class="text-neutral-500">Período</dt><dd>{{ data(d.cobranca.competenciaInicio) }} a {{ data(d.cobranca.competenciaFim) }}</dd></div>
            <div><dt class="text-neutral-500">Vencimento</dt><dd>{{ data(d.cobranca.vencimento) }}</dd></div>
            <div><dt class="text-neutral-500">Pagamento</dt>
              <dd>@if (d.cobranca.pagoEm) { {{ data(d.cobranca.pagoEm) }} · {{ rotuloFormaPagamento(d.cobranca.formaPagamento) }} · {{ dinheiro(d.cobranca.valorPago) }} } @else { — }</dd></div>
          </dl>
          <div class="bo-table-wrap">
            <table class="bo-table">
              <thead><tr><th>Item</th><th class="text-right">Qtd.</th><th class="text-right">Unitário</th><th class="text-right">Meses</th><th class="text-right">Valor</th></tr></thead>
              <tbody>
                @for (i of d.itens; track $index) {
                  <tr>
                    <td>{{ i.descricao }}</td>
                    <td class="text-right">{{ i.quantidade }}</td>
                    <td class="text-right">{{ dinheiro(i.valorUnitario) }}{{ i.tipo === 'ADICIONAL' ? '/mês' : '' }}</td>
                    <td class="text-right">{{ i.tipo === 'ADICIONAL' ? i.meses : '—' }}</td>
                    <td class="text-right">{{ dinheiro(i.valor) }}</td>
                  </tr>
                }
                <tr><td colspan="4" class="text-right font-bold">Total</td><td class="text-right font-bold">{{ dinheiro(d.cobranca.valor) }}</td></tr>
              </tbody>
            </table>
          </div>
          @if (d.observacao) { <p class="text-sm text-neutral-400">Observação: {{ d.observacao }}</p> }
        } @else if (erro) {
          <div class="bo-erro">{{ erro }}</div>
        } @else {
          <p class="bo-sub">Carregando...</p>
        }
      </div>
      <div rodape class="flex justify-between gap-2">
        <button class="bo-btn-ghost" type="button" (click)="fechar.emit()">Fechar</button>
        @if (d) {
          <a class="bo-link self-center" [routerLink]="['/contratacoes', d.cobranca.contratacaoId]" (click)="fechar.emit()">Abrir contratação</a>
        }
      </div>
    </app-modal>
  `
})
export class CobrancaDetalheModalComponent implements OnInit {
  private api = inject(CentralApiService);

  readonly cobrancaId = input.required<string>();
  readonly fechar = output<void>();

  d: CobrancaDetalhe | null = null;
  erro = '';

  readonly competencia = competencia;
  readonly data = data;
  readonly dinheiro = dinheiro;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;
  readonly rotuloStatusCobranca = rotuloStatusCobranca;
  readonly tomCobranca = tomCobranca;

  ngOnInit(): void {
    this.api.cobranca(this.cobrancaId()).subscribe({
      next: d => this.d = d,
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar a cobrança.')
    });
  }
}
