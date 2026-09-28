import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ErroAplicativo, FiltroErros, Produto } from '../../core/api/central.models';
import { PeriodoComponent } from '../comum/periodo.component';
import { data } from '../comum/rotulos';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent } from '../comum/barra-filtros.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';

/**
 * Erros de servidor que os aplicativos relataram (contrato 6.2, 26/09/2026).
 * Tela "Logs" no menu e, com `contratacaoId`, aba "Erros" da contratação.
 * O usuário aparece só pelo id: a Central não guarda nome nem e-mail dos apps.
 */
@Component({
  selector: 'app-logs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, PeriodoComponent, CabecalhoPaginaComponent, BarraFiltrosComponent, EstadoListaComponent],
  template: `
    <div class="space-y-4">
      @if (!contratacaoId()) {
        <app-cabecalho-pagina titulo="Logs"
          subtitulo="Erros de servidor que os aplicativos tiveram (últimos 90 dias).">
        </app-cabecalho-pagina>
      }

      <app-barra-filtros [termo]="filtro.busca ?? ''" (termoChange)="filtro.busca = $event"
        placeholder="Mensagem, rota, código, requestId, cliente"
        (buscar)="carregar()">
        <!-- Filtros avançados -->
        @if (!contratacaoId()) {
          <div class="md:col-span-4">
            <label><span class="bo-label">Produto</span>
              <select class="bo-field" name="produto" [(ngModel)]="filtro.produtoId">
                <option value="">Todos</option>
                @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
              </select>
            </label>
          </div>
        }
        <div class="md:col-span-8">
          <label><span class="bo-label">Período</span>
            <app-periodo [de]="filtro.de ?? ''" (deChange)="filtro.de = $event"
              [ate]="filtro.ate ?? ''" (ateChange)="filtro.ate = $event" />
          </label>
        </div>
      </app-barra-filtros>

      <p class="bo-sub">{{ erros.length }} erro(s){{ erros.length >= 500 ? ' (mostrando os 500 mais recentes)' : '' }}</p>

      @if (erro) { <div class="bo-erro">{{ erro }}</div> }

      <div class="bo-table-wrap">
        <div class="bo-table-rolagem">
          <table class="bo-table">
            <thead>
              <tr>
                <th>Quando</th>
                @if (!contratacaoId()) { <th>Cliente</th> }
                <th>Status</th><th>Rota</th><th>Mensagem</th><th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              @for (e of erros; track e.id) {
                <tr class="clicavel" tabindex="0"
                  (click)="aberto = aberto === e.id ? null : e.id; cdr.markForCheck()"
                  (keydown.enter)="aberto = aberto === e.id ? null : e.id; cdr.markForCheck()">
                  <td class="whitespace-nowrap">{{ data(e.ocorridoEm) }}</td>
                  @if (!contratacaoId()) {
                    <td>@if (e.contratacaoId) {
                        <a class="hover:text-white" [routerLink]="['/contratacoes', e.contratacaoId]"
                          (click)="$event.stopPropagation()">{{ e.clienteNome }}</a>
                        <div class="text-xs text-neutral-500">{{ e.produtoCodigo }} · {{ e.nomeInstancia }}</div>
                      }
                      @else { <span class="text-neutral-500">{{ e.produtoCodigo }} · fora de uma instância</span> }
                    </td>
                  }
                  <td><span class="bo-bad">{{ e.status }}</span></td>
                  <td class="whitespace-nowrap text-neutral-300">{{ e.metodo }} {{ e.rota }}</td>
                  <td>{{ e.mensagem || '—' }}</td>
                  <td class="text-xs text-neutral-400">{{ e.usuarioId ? curto(e.usuarioId) : '—' }}</td>
                </tr>
                @if (aberto === e.id) {
                  <tr><td [attr.colspan]="contratacaoId() ? 5 : 6" class="text-xs text-neutral-400">
                    requestId {{ e.requestId || '—' }} · código {{ e.codigo || '—' }} · usuário {{ e.usuarioId || '—' }} · instância {{ e.tenantId || '—' }}
                  </td></tr>
                }
              }
            </tbody>
          </table>
        </div>
        <app-estado-lista [carregando]="carregando" [vazio]="!carregando && erros.length === 0"
          mensagemVazio="Nenhum erro com estes filtros." />
      </div>
      <p class="bo-sub">Clique numa linha para ver requestId e ids completos. Para achar a pessoa, entre em suporte no aplicativo.</p>
    </div>
  `
})
export class LogsComponent implements OnInit {
  private api = inject(CentralApiService);
  readonly cdr = inject(ChangeDetectorRef);

  /** Preenchido na aba "Erros" da contratação. */
  readonly contratacaoId = input<string>();

  produtos: Produto[] = [];
  erros: ErroAplicativo[] = [];
  filtro: FiltroErros = filtroVazio();
  carregando = false;
  erro = '';
  aberto: string | null = null;

  readonly data = data;

  ngOnInit(): void {
    if (!this.contratacaoId()) this.api.produtos().subscribe({ next: l => { this.produtos = l; this.cdr.markForCheck(); } });
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.api.erros({ ...this.filtro, contratacaoId: this.contratacaoId() ?? '' }).subscribe({
      next: l => { this.erros = l; this.carregando = false; this.cdr.markForCheck(); },
      error: e => { this.carregando = false; this.erro = mensagemApi(e, 'Não foi possível listar os erros.'); this.cdr.markForCheck(); }
    });
  }

  curto(id: string): string {
    return id.slice(0, 8);
  }
}

function filtroVazio(): FiltroErros {
  return { produtoId: '', de: '', ate: '', busca: '' };
}
