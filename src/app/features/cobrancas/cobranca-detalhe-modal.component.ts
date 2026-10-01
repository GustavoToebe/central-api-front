import { NumeroComponent } from '../comum/numero.component';
import { ModalComponent } from '../comum/modal.component';
import { ChangeDetectorRef, Component, OnInit, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaDetalhe } from '../../core/api/central.models';
import {
  competencia, competenciaNaLista, data, dinheiro, rotuloFormaPagamento, rotuloPeriodicidade, rotuloStatusCobranca, tomCobranca
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
              <h3 class="text-lg font-bold">{{ competenciaNaLista(d.cobranca.competenciaInicio) }}<app-numero [numero]="d.cobranca.sequencial" /></h3>
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
          @if (pagamentos.length) {
            <section class="space-y-2"><h4 class="font-bold">Pagamentos online</h4>
              @for (p of pagamentos; track p.pagamentoId) {
                <div class="flex flex-wrap gap-2 items-center">
                  <span>Pagamento {{ p.pagamentoId }}</span>
                  <span [class]="p.situacao === 'REVISAR' ? 'bo-warn' : p.aplicado ? 'bo-ok' : 'bo-mute'">{{ p.situacao === 'REVISAR' ? 'Revisar' : p.aplicado ? 'Baixa registrada' : 'Aguardando confirmação' }}</span>
                  @if (p.situacao === 'REVISAR') { <button type="button" class="bo-link" [disabled]="ocupado" (click)="reconciliar(p.pagamentoId)">Consultar novamente</button> }
                </div>
              }
            </section>
          }
          @if (linkCheckout) { <p><a class="bo-link" [href]="linkCheckout" target="_blank" rel="noopener noreferrer">Abrir pagamento no Mercado Pago</a></p><p class="bo-sub">A baixa aparece após a confirmação do pagamento.</p> }
          @if (erroAcao) { <div class="bo-erro">{{ erroAcao }}</div> }
        } @else if (erro) {
          <div class="bo-erro">{{ erro }}</div>
        } @else {
          <p class="bo-sub">Carregando...</p>
        }
      </div>
      <div rodape class="flex flex-wrap items-center justify-between gap-2">
        <button class="bo-btn-ghost" type="button" [disabled]="ocupado" (click)="atualizar()">Atualizar pagamento</button>
        <button class="bo-btn-ghost" type="button" (click)="fechar.emit()">Fechar</button>
        @if (d) {
          <div class="flex flex-wrap items-center gap-3">
            @if (d.cobranca.status === 'ABERTA' && d.cobranca.valor > 0) {
              <button type="button" class="bo-btn" [disabled]="ocupado" (click)="gerarCheckout()">Gerar link de pagamento</button>
            }
            @if (d.cobranca.status === 'PAGA') {
              <button type="button" class="bo-link" [disabled]="ocupado" (click)="estornar()">Estornar</button>
            }
            @if (d.cobranca.status !== 'CANCELADA') {
              <button type="button" class="bo-link" [disabled]="ocupado" (click)="reemitir()">Cancelar e emitir nova</button>
            }
            <a class="bo-link" [routerLink]="['/contratacoes', d.cobranca.contratacaoId]" (click)="fechar.emit()">Abrir contratação</a>
          </div>
        }
      </div>
    </app-modal>
  `
})
export class CobrancaDetalheModalComponent implements OnInit {
  private api = inject(CentralApiService);
  /**
   * A lista de Cobranças é OnPush: sem avisar, a resposta chegava e o modal só aparecia no próximo
   * evento da tela (29/09/2026, "muito lento ao abrir o detalhamento").
   */
  private cdr = inject(ChangeDetectorRef);

  readonly cobrancaId = input.required<string>();
  readonly fechar = output<void>();
  readonly alterado = output<void>();

  d: CobrancaDetalhe | null = null;
  erro = '';
  erroAcao = '';
  ocupado = false;
  linkCheckout = '';
  pagamentos: { pagamentoId: string; situacao: string; statusProvedor: string; aplicado: boolean }[] = [];
  private tentativaCheckout = crypto.randomUUID();

  readonly competencia = competencia;
  readonly competenciaNaLista = competenciaNaLista;
  readonly data = data;
  readonly dinheiro = dinheiro;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;
  readonly rotuloStatusCobranca = rotuloStatusCobranca;
  readonly tomCobranca = tomCobranca;

  ngOnInit(): void {
    this.recarregar();
    this.carregarPagamentos();
  }

  atualizar(): void { this.recarregar(); this.carregarPagamentos(); }

  gerarCheckout(): void {
    if (!this.d || this.ocupado || this.d.cobranca.status !== 'ABERTA' || this.d.cobranca.valor <= 0) return;
    this.ocupado = true; this.erroAcao = '';
    this.api.checkoutCobranca(this.d.cobranca.id, this.tentativaCheckout).subscribe({
      next: link => {
        try {
          const url = new URL(link.url);
          if (url.protocol !== 'https:' || url.username || !['www.mercadopago.com.br', 'www.mercadopago.com'].includes(url.hostname)) throw new Error();
          this.linkCheckout = url.href;
        } catch { this.erroAcao = 'Link de pagamento inválido.'; }
        this.ocupado = false; this.cdr.markForCheck();
      },
      error: e => { this.ocupado = false; this.erroAcao = mensagemApi(e, 'Não foi possível gerar o link de pagamento.'); this.cdr.markForCheck(); }
    });
  }

  reconciliar(id: string): void {
    if (this.ocupado) return;
    this.ocupado = true; this.erroAcao = '';
    this.api.reconciliarPagamento(id).subscribe({
      next: () => { this.ocupado = false; this.carregarPagamentos(); this.cdr.markForCheck(); },
      error: e => { this.ocupado = false; this.erroAcao = mensagemApi(e, 'Não foi possível solicitar conciliação.'); this.cdr.markForCheck(); }
    });
  }

  private carregarPagamentos(): void {
    this.api.pagamentosOnline(this.cobrancaId()).subscribe({
      next: pagamentos => { this.pagamentos = pagamentos; this.cdr.markForCheck(); },
      error: () => { this.erroAcao = 'Não foi possível carregar os pagamentos online.'; this.cdr.markForCheck(); }
    });
  }

  estornar(): void {
    if (!this.d) return;
    this.agir(this.api.estornar(this.d.cobranca.contratacaoId, this.d.cobranca.id));
  }

  reemitir(): void {
    if (!this.d) return;
    this.agir(this.api.reemitir(this.d.cobranca.contratacaoId, this.d.cobranca.id));
  }

  private agir(chamada: import('rxjs').Observable<unknown>): void {
    this.ocupado = true;
    this.erroAcao = '';
    chamada.subscribe({
      next: () => { this.ocupado = false; this.alterado.emit(); this.fechar.emit(); this.cdr.markForCheck(); },
      error: e => { this.ocupado = false; this.erroAcao = mensagemApi(e, 'Não foi possível concluir.'); this.cdr.markForCheck(); }
    });
  }

  private recarregar(): void {
    this.api.cobranca(this.cobrancaId()).subscribe({
      next: d => { this.d = d; this.cdr.markForCheck(); },
      error: e => { this.erro = mensagemApi(e, 'Não foi possível carregar a cobrança.'); this.cdr.markForCheck(); }
    });
  }
}
