import { CampoCompetenciaComponent } from '../comum/campo-competencia.component';
import { competenciaAtual } from '../comum/datas';
import { NumeroComponent } from '../comum/numero.component';
import { PeriodoComponent } from '../comum/periodo.component';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaLinha, FiltroCobrancas, Produto, RegistrarPagamentoRequest } from '../../core/api/central.models';
import {
  FORMAS_PAGAMENTO, competencia, data, dinheiro, rotuloFormaPagamento, rotuloStatusCobranca, tomCobranca
} from '../comum/rotulos';
import { CobrancaDetalheModalComponent } from './cobranca-detalhe-modal.component';
import { CobrancaAPagar, PagamentoModalComponent } from './pagamento-modal.component';

/**
 * Todas as cobranças, de todos os clientes (26/09/2026). Pagar aqui aceita
 * cobranças de contratações diferentes de uma vez.
 */
@Component({
  selector: 'app-cobrancas',
  imports: [FormsModule, RouterLink, PagamentoModalComponent, CobrancaDetalheModalComponent, NumeroComponent, CampoCompetenciaComponent, PeriodoComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Cobranças</h1>
          <p class="bo-sub">Todas as contratações. Clique numa linha para ver o detalhamento.</p>
        </div>
        <button type="button" class="bo-btn" [disabled]="!selecionadas.size" (click)="abrirPagamento()">Pagar ({{ selecionadas.size }})</button>
      </div>

      <form class="bo-card grid gap-3 p-4 md:grid-cols-4 xl:grid-cols-7" (ngSubmit)="carregar()">
        <label class="md:col-span-2 xl:col-span-2"><span class="bo-label">Cliente ou instância</span>
          <input class="bo-field" name="busca" [(ngModel)]="filtro.busca" placeholder="Nome, CPF/CNPJ, instância ou número"></label>
        <label><span class="bo-label">Produto</span>
          <select class="bo-field" name="produto" [(ngModel)]="filtro.produtoId" (ngModelChange)="carregar()">
            <option value="">Todos</option>
            @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
          </select>
        </label>
        <label><span class="bo-label">Situação</span>
          <select class="bo-field" name="situacao" [(ngModel)]="filtro.situacao" (ngModelChange)="carregar()">
            <option value="">Todas</option>
            <option value="ABERTA">Aberta</option>
            <option value="VENCIDA">Vencida</option>
            <option value="PAGA">Paga</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </label>
        <label><span class="bo-label">Forma de pagamento</span>
          <select class="bo-field" name="forma" [(ngModel)]="filtro.formaPagamento" (ngModelChange)="carregar()">
            <option value="">Todas</option>
            @for (f of formas; track f) { <option [value]="f">{{ rotuloFormaPagamento(f) }}</option> }
          </select>
        </label>
        <label><span class="bo-label">Competência</span>
          <app-campo-competencia name="competencia" [(ngModel)]="filtro.competencia" (ngModelChange)="carregar()" /></label>
        <label class="md:col-span-2 xl:col-span-1"><span class="bo-label">Vencimento</span>
          <app-periodo [de]="filtro.vencimentoDe ?? ''" (deChange)="filtro.vencimentoDe = $event"
            [ate]="filtro.vencimentoAte ?? ''" (ateChange)="filtro.vencimentoAte = $event" (aplicado)="carregar()" /></label>
        <div class="flex items-end gap-2 md:col-span-4 xl:col-span-7">
          <button class="bo-btn" type="submit">Buscar</button>
          <button class="bo-btn-ghost" type="button" (click)="limpar()">Limpar filtros</button>
          <span class="bo-sub ml-auto">{{ linhas.length }} cobrança(s) · {{ dinheiro(total()) }}</span>
        </div>
      </form>

      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (aviso) { <div class="bo-aviso">{{ aviso }}</div> }

      <div class="bo-table-wrap">
        <table class="bo-table">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Selecionar todas as abertas" [checked]="todasSelecionadas()" (change)="alternarTodas()"></th>
              <th>Cliente</th><th>Produto</th><th>Competência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Pagamento</th>
            </tr>
          </thead>
          <tbody>
            @for (c of linhas; track c.id) {
              <tr class="cursor-pointer" (click)="detalheId = c.id">
                <td (click)="$event.stopPropagation()">
                  @if (c.status === 'ABERTA') {
                    <input type="checkbox" [checked]="selecionadas.has(c.id)" (change)="alternar(c.id)" [attr.aria-label]="'Selecionar cobrança de ' + c.clienteNome">
                  }
                </td>
                <td>{{ c.clienteNome }}<div class="text-xs text-neutral-500">{{ c.nomeInstancia }}</div></td>
                <td>{{ c.produtoCodigo }}<div class="text-xs text-neutral-500">{{ c.planoNome }}</div></td>
                <td>{{ competencia(c.competenciaInicio, c.competenciaFim) }}<app-numero [numero]="c.sequencial" /></td>
                <td>{{ data(c.vencimento) }}</td>
                <td>{{ dinheiro(c.valor) }}</td>
                <td><span [class]="tomCobranca(c.status, c.vencida)">{{ rotuloStatusCobranca(c.status, c.vencida) }}</span></td>
                <td>@if (c.pagoEm) { {{ data(c.pagoEm) }} · {{ rotuloFormaPagamento(c.formaPagamento) }} } @else { — }</td>
              </tr>
            } @empty { <tr><td colspan="8" class="text-center text-neutral-500">{{ carregando ? 'Carregando...' : 'Nenhuma cobrança com estes filtros.' }}</td></tr> }
          </tbody>
        </table>
      </div>
      @if (linhas.length >= 1000) { <p class="bo-sub">Mostrando as 1000 primeiras; refine os filtros.</p> }
      <p class="bo-sub">Para gerar cobranças adiantadas, abra a <a routerLink="/contratacoes" class="hover:text-white underline">contratação</a>.</p>
    </div>

    @if (pagando) {
      <app-pagamento-modal [cobrancas]="aPagar()" [ocupado]="ocupado" [erro]="erroPagamento"
        (pagar)="pagar($event)" (fechar)="pagando = false" />
    }
    @if (detalheId) {
      <app-cobranca-detalhe-modal [cobrancaId]="detalheId" (fechar)="detalheId = null" />
    }
  `
})
export class CobrancasComponent implements OnInit {
  private api = inject(CentralApiService);

  produtos: Produto[] = [];
  linhas: CobrancaLinha[] = [];
  filtro: FiltroCobrancas = filtroVazio();
  selecionadas = new Set<string>();
  carregando = false;
  erro = '';
  aviso = '';
  pagando = false;
  ocupado = false;
  erroPagamento = '';
  detalheId: string | null = null;

  readonly formas = FORMAS_PAGAMENTO;
  readonly competencia = competencia;
  readonly data = data;
  readonly dinheiro = dinheiro;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  readonly rotuloStatusCobranca = rotuloStatusCobranca;
  readonly tomCobranca = tomCobranca;

  ngOnInit(): void {
    this.api.produtos().subscribe({ next: l => this.produtos = l });
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.api.cobrancas(this.filtro).subscribe({
      next: l => {
        this.linhas = l;
        this.carregando = false;
        const abertas = new Set(l.filter(c => c.status === 'ABERTA').map(c => c.id));
        this.selecionadas = new Set([...this.selecionadas].filter(id => abertas.has(id)));
      },
      error: e => { this.carregando = false; this.erro = mensagemApi(e, 'Não foi possível listar as cobranças.'); }
    });
  }

  limpar(): void {
    this.filtro = filtroVazio();
    this.carregar();
  }

  total(): number {
    return this.linhas.reduce((soma, c) => soma + Number(c.valor), 0);
  }

  alternar(id: string): void {
    if (this.selecionadas.has(id)) this.selecionadas.delete(id);
    else this.selecionadas.add(id);
  }

  todasSelecionadas(): boolean {
    const abertas = this.linhas.filter(c => c.status === 'ABERTA');
    return abertas.length > 0 && abertas.every(c => this.selecionadas.has(c.id));
  }

  alternarTodas(): void {
    const abertas = this.linhas.filter(c => c.status === 'ABERTA').map(c => c.id);
    this.selecionadas = this.todasSelecionadas() ? new Set() : new Set(abertas);
  }

  aPagar(): CobrancaAPagar[] {
    return this.linhas.filter(c => this.selecionadas.has(c.id)).map(c => ({
      id: c.id,
      descricao: `${c.clienteNome} · ${competencia(c.competenciaInicio, c.competenciaFim)}`,
      valor: c.valor
    }));
  }

  abrirPagamento(): void {
    this.erroPagamento = '';
    this.aviso = '';
    this.pagando = true;
  }

  pagar(corpo: RegistrarPagamentoRequest): void {
    this.ocupado = true;
    this.erroPagamento = '';
    this.api.pagarCobrancas(corpo).subscribe({
      next: () => {
        this.ocupado = false;
        this.pagando = false;
        this.aviso = `${corpo.cobrancaIds.length} cobrança(s) paga(s).`;
        this.selecionadas.clear();
        this.carregar();
      },
      error: e => { this.ocupado = false; this.erroPagamento = mensagemApi(e, 'Não foi possível registrar o pagamento.'); }
    });
  }
}

/** A competência do mês já vem aplicada (teste de telas de 27/09/2026); o "✕" do campo tira. */
function filtroVazio(): FiltroCobrancas {
  return { produtoId: '', situacao: '', formaPagamento: '', vencimentoDe: '', vencimentoAte: '', competencia: competenciaAtual(), busca: '' };
}
