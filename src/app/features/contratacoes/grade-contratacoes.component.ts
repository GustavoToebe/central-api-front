import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ContratacaoResumo } from '../../core/api/central.models';
import {
  data, dinheiro, podeTentarNovamente, rotuloPeriodicidade, rotuloProvisionamento, rotuloSituacao,
  tomProvisionamento, tomSituacao
} from '../comum/rotulos';

/**
 * Grade de contratações (aplicativo, instância, plano, situação, vencimento,
 * provisionamento) com "Tentar novamente" quando o provisionamento parou em ERRO.
 */
@Component({
  selector: 'app-grade-contratacoes',
  imports: [RouterLink],
  template: `
    @if (erro) { <div class="bo-erro mb-3">{{ erro }}</div> }
    <div class="bo-table-wrap">
      <table class="bo-table">
        <thead>
          <tr>
            @if (mostrarCliente) { <th>Cliente</th> }
            <th>Aplicativo</th><th>Instância</th><th>Plano</th><th>Situação</th><th>Vencimento</th><th>Provisionamento</th>
          </tr>
        </thead>
        <tbody>
          @for (c of contratacoes; track c.id) {
            <tr>
              @if (mostrarCliente) { <td><a [routerLink]="['/clientes', c.clienteId]" class="hover:text-[#ff4d47]">{{ c.clienteNome }}</a></td> }
              <td class="font-semibold">{{ c.produtoCodigo }}</td>
              <td>
                <a [routerLink]="['/contratacoes', c.id]" class="font-semibold hover:text-[#ff4d47]">{{ c.nomeInstancia }}</a>
                <div class="text-xs text-neutral-500">{{ c.slugInstancia }}</div>
              </td>
              <td>{{ c.planoCodigo }}<div class="text-xs text-neutral-500">{{ rotuloPeriodicidade(c.periodicidade) }} · {{ dinheiro(c.valor) }}</div></td>
              <td><span [class]="tomSituacao(c.situacaoComercial)">{{ rotuloSituacao(c.situacaoComercial) }}</span></td>
              <td>Dia {{ c.diaVencimento }}<div class="text-xs text-neutral-500">pago até {{ data(c.vigenteAte) }}</div></td>
              <td>
                <span [class]="tomProvisionamento(c.situacaoProvisionamento)">{{ rotuloProvisionamento(c.situacaoProvisionamento) }}</span>
                @if (podeTentarNovamente(c)) {
                  <button type="button" class="bo-btn-line ml-2 !px-3 !py-1" [disabled]="enviando === c.id" (click)="tentar(c)">
                    {{ enviando === c.id ? 'Enviando...' : 'Tentar novamente' }}
                  </button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td [attr.colspan]="mostrarCliente ? 7 : 6" class="text-center text-neutral-500">{{ vazio }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class GradeContratacoesComponent {
  private api = inject(CentralApiService);

  @Input() contratacoes: ContratacaoResumo[] = [];
  @Input() mostrarCliente = false;
  @Input() vazio = 'Nenhuma contratação.';
  @Output() alterou = new EventEmitter<void>();

  enviando: string | null = null;
  erro = '';

  readonly podeTentarNovamente = podeTentarNovamente;
  readonly rotuloSituacao = rotuloSituacao;
  readonly tomSituacao = tomSituacao;
  readonly rotuloProvisionamento = rotuloProvisionamento;
  readonly tomProvisionamento = tomProvisionamento;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;
  readonly dinheiro = dinheiro;
  readonly data = data;

  tentar(c: ContratacaoResumo): void {
    this.enviando = c.id;
    this.erro = '';
    this.api.tentarProvisionamento(c.id).subscribe({
      next: () => { this.enviando = null; this.alterou.emit(); },
      error: e => { this.enviando = null; this.erro = mensagemApi(e, 'Não foi possível reenviar o provisionamento.'); }
    });
  }
}
