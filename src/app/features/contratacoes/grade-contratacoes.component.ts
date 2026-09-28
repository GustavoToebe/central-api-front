import { NumeroComponent } from '../comum/numero.component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ContratacaoResumo } from '../../core/api/central.models';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import {
  data, dinheiro, podeTentarNovamente, rotuloPeriodicidade, rotuloProvisionamento, rotuloSituacao,
  tomProvisionamento, tomSituacao
} from '../comum/rotulos';

/**
 * Grade de contratações (aplicativo, instância, plano, situação, vencimento,
 * provisionamento) com "Tentar novamente" quando o provisionamento parou em ERRO.
 * Clique na linha abre a contratação.
 */
@Component({
  selector: 'app-grade-contratacoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NumeroComponent, EstadoListaComponent],
  template: `
    @if (erro) { <div class="bo-erro mb-3">{{ erro }}</div> }
    <div class="bo-table-wrap">
      <div class="bo-table-rolagem">
        <table class="bo-table">
          <thead>
            <tr>
              @if (mostrarCliente) { <th>Cliente</th> }
              <th>Aplicativo</th><th>Instância</th><th>Plano</th><th>Situação</th><th>Vencimento</th><th>Provisionamento</th>
            </tr>
          </thead>
          <tbody>
            @for (c of contratacoes; track c.id) {
              <tr class="clicavel" tabindex="0"
                (click)="abrirContratacao(c.id)"
                (keydown.enter)="abrirContratacao(c.id)">
                @if (mostrarCliente) {
                  <td>
                    <a [routerLink]="['/clientes', c.clienteId]" class="hover:text-[#ff4d47]"
                      (click)="$event.stopPropagation()">{{ c.clienteNome }}</a>
                  </td>
                }
                <td class="font-semibold">{{ c.produtoCodigo }}</td>
                <td>
                  <span class="font-semibold">{{ c.nomeInstancia }}</span><app-numero [numero]="c.sequencial" />
                  <div class="text-xs text-neutral-500">{{ c.slugInstancia }}</div>
                </td>
                <td>{{ c.planoCodigo }}<div class="text-xs text-neutral-500">{{ rotuloPeriodicidade(c.periodicidade) }} · {{ dinheiro(c.valor) }}</div></td>
                <td><span [class]="tomSituacao(c.situacaoComercial)">{{ rotuloSituacao(c.situacaoComercial) }}</span></td>
                <td>Dia {{ c.diaVencimento }}<div class="text-xs text-neutral-500">pago até {{ data(c.vigenteAte) }}</div></td>
                <td>
                  <span [class]="tomProvisionamento(c.situacaoProvisionamento, c.situacaoComercial)">{{ rotuloProvisionamento(c.situacaoProvisionamento, c.situacaoComercial) }}</span>
                  @if (podeTentarNovamente(c)) {
                    <button type="button" class="bo-btn-line ml-2 !px-3 !py-1"
                      [disabled]="enviando === c.id"
                      (click)="$event.stopPropagation(); tentar(c)">
                      {{ enviando === c.id ? 'Enviando...' : 'Tentar novamente' }}
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-estado-lista [vazio]="!contratacoes.length" [mensagemVazio]="vazio" />
    </div>
  `
})
export class GradeContratacoesComponent {
  private api = inject(CentralApiService);
  private router = inject(Router);

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

  abrirContratacao(id: string): void {
    void this.router.navigate(['/contratacoes', id]);
  }

  tentar(c: ContratacaoResumo): void {
    this.enviando = c.id;
    this.erro = '';
    this.api.tentarProvisionamento(c.id).subscribe({
      next: () => { this.enviando = null; this.alterou.emit(); },
      error: e => { this.enviando = null; this.erro = mensagemApi(e, 'Não foi possível reenviar o provisionamento.'); }
    });
  }
}
