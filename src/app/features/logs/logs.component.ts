import { Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ErroAplicativo, FiltroErros, Produto } from '../../core/api/central.models';
import { data } from '../comum/rotulos';

/**
 * Erros de servidor que os aplicativos relataram (contrato 6.2, 26/09/2026).
 * Tela "Logs" no menu e, com `contratacaoId`, aba "Erros" da contratação.
 * O usuário aparece só pelo id: a Central não guarda nome nem e-mail dos apps.
 */
@Component({
  selector: 'app-logs',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      @if (!contratacaoId()) {
        <div>
          <h1 class="bo-title">Logs</h1>
          <p class="bo-sub">Erros de servidor que os aplicativos tiveram (últimos 90 dias).</p>
        </div>
      }
      <form class="bo-card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5" (ngSubmit)="carregar()">
        <label class="md:col-span-2"><span class="bo-label">Pesquisar</span>
          <input class="bo-field" name="busca" [(ngModel)]="filtro.busca" placeholder="Mensagem, rota, código, requestId, cliente"></label>
        @if (!contratacaoId()) {
          <label><span class="bo-label">Produto</span>
            <select class="bo-field" name="produto" [(ngModel)]="filtro.produtoId" (ngModelChange)="carregar()">
              <option value="">Todos</option>
              @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
            </select>
          </label>
        }
        <label><span class="bo-label">De</span><input class="bo-field" type="date" name="de" [(ngModel)]="filtro.de" (ngModelChange)="carregar()"></label>
        <label><span class="bo-label">Até</span><input class="bo-field" type="date" name="ate" [(ngModel)]="filtro.ate" (ngModelChange)="carregar()"></label>
        <div class="flex items-end gap-2 md:col-span-2 xl:col-span-5">
          <button class="bo-btn" type="submit">Buscar</button>
          <button class="bo-btn-ghost" type="button" (click)="limpar()">Limpar filtros</button>
          <span class="bo-sub ml-auto">{{ erros.length }} erro(s){{ erros.length >= 500 ? ' (mostrando os 500 mais recentes)' : '' }}</span>
        </div>
      </form>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <div class="bo-table-wrap">
        <table class="bo-table">
          <thead><tr><th>Quando</th>@if (!contratacaoId()) { <th>Cliente</th> }<th>Status</th><th>Rota</th><th>Mensagem</th><th>Usuário</th></tr></thead>
          <tbody>
            @for (e of erros; track e.id) {
              <tr class="cursor-pointer" (click)="aberto = aberto === e.id ? null : e.id">
                <td class="whitespace-nowrap">{{ data(e.ocorridoEm) }}</td>
                @if (!contratacaoId()) {
                  <td>@if (e.contratacaoId) { <a class="hover:text-white" [routerLink]="['/contratacoes', e.contratacaoId]" (click)="$event.stopPropagation()">{{ e.clienteNome }}</a>
                      <div class="text-xs text-neutral-500">{{ e.produtoCodigo }} · {{ e.nomeInstancia }}</div> }
                    @else { <span class="text-neutral-500">{{ e.produtoCodigo }} · fora de uma instância</span> }</td>
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
            } @empty {
              <tr><td [attr.colspan]="contratacaoId() ? 5 : 6" class="text-center text-neutral-500">{{ carregando ? 'Carregando...' : 'Nenhum erro com estes filtros.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
      <p class="bo-sub">Clique numa linha para ver requestId e ids completos. Para achar a pessoa, entre em suporte no aplicativo.</p>
    </div>
  `
})
export class LogsComponent implements OnInit {
  private api = inject(CentralApiService);

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
    if (!this.contratacaoId()) this.api.produtos().subscribe({ next: l => this.produtos = l });
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.api.erros({ ...this.filtro, contratacaoId: this.contratacaoId() ?? '' }).subscribe({
      next: l => { this.erros = l; this.carregando = false; },
      error: e => { this.carregando = false; this.erro = mensagemApi(e, 'Não foi possível listar os erros.'); }
    });
  }

  limpar(): void {
    this.filtro = filtroVazio();
    this.carregar();
  }

  curto(id: string): string {
    return id.slice(0, 8);
  }
}

function filtroVazio(): FiltroErros {
  return { produtoId: '', de: '', ate: '', busca: '' };
}
