import { CampoCompetenciaComponent } from '../comum/campo-competencia.component';
import { competenciaAtual } from '../comum/datas';
import { PeriodoComponent } from '../comum/periodo.component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { CobrancaLinha, FiltroCobrancas, Produto, RegistrarPagamentoRequest } from '../../core/api/central.models';
import {
  FORMAS_PAGAMENTO, competencia, competenciaNaLista, data, dinheiro, rotuloFormaPagamento, rotuloStatusCobranca, tomCobranca
} from '../comum/rotulos';
import { CobrancaDetalheModalComponent } from './cobranca-detalhe-modal.component';
import { CobrancaAPagar, PagamentoModalComponent } from './pagamento-modal.component';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent, FiltroAtivo, OpcaoMenu } from '../comum/barra-filtros.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import { Selecao } from '../comum/selecao';

/**
 * Todas as cobranças, de todos os clientes (26/09/2026). Pagar aqui aceita
 * cobranças de contratações diferentes de uma vez.
 * PLANO-002: filtros no painel da barra, seleção com `Selecao`, pagamento via menu Opções.
 */
@Component({
  selector: 'app-cobrancas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, PagamentoModalComponent, CobrancaDetalheModalComponent,
    CampoCompetenciaComponent, PeriodoComponent,
    CabecalhoPaginaComponent, BarraFiltrosComponent, EstadoListaComponent
  ],
  template: `
    <div class="space-y-8">
      <app-cabecalho-pagina titulo="Cobranças" [exportacao]="dadosExportacao" [exportacaoOcupada]="carregando"
        subtitulo="Todas as contratações. Clique numa linha para ver o detalhamento.">
      </app-cabecalho-pagina>

      <app-barra-filtros
        [termo]="filtro.busca ?? ''" (termoChange)="filtro.busca = $event"
        placeholder="Cliente, instância, CPF/CNPJ ou número"
        [opcoes]="menuOpcoes()"
        [filtrosAtivos]="filtrosAtivosLista()"
        (buscar)="carregar()"
        (opcao)="aoOpcao($event)"
        (removerFiltro)="removerFiltro($event)"
        (removerTodos)="limpar()">
        <!-- Filtros avançados no painel -->
        <div class="md:col-span-4">
          <label><span class="bo-label">Produto</span>
            <select class="bo-field" name="produto" [(ngModel)]="filtro.produtoId">
              <option value="">Todos</option>
              @for (p of produtos; track p.id) { <option [value]="p.id">{{ p.nome }}</option> }
            </select>
          </label>
        </div>
        <div class="md:col-span-4">
          <label><span class="bo-label">Situação</span>
            <select class="bo-field" name="situacao" [(ngModel)]="filtro.situacao">
              <option value="">Todas</option>
              <option value="ABERTA">Aberta</option>
              <option value="VENCIDA">Vencida</option>
              <option value="PAGA">Paga</option>
              <option value="ISENTA">Isenta</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>
        </div>
        <div class="md:col-span-4">
          <label><span class="bo-label">Forma de pagamento</span>
            <select class="bo-field" name="forma" [(ngModel)]="filtro.formaPagamento">
              <option value="">Todas</option>
              @for (f of formas; track f) { <option [value]="f">{{ rotuloFormaPagamento(f) }}</option> }
            </select>
          </label>
        </div>
        <div class="md:col-span-6">
          <label><span class="bo-label">Competência</span>
            <app-campo-competencia name="competencia" [(ngModel)]="filtro.competencia" />
          </label>
        </div>
        <div class="md:col-span-6">
          <label><span class="bo-label">Vencimento</span>
            <app-periodo [de]="filtro.vencimentoDe ?? ''" (deChange)="filtro.vencimentoDe = $event"
              [ate]="filtro.vencimentoAte ?? ''" (ateChange)="filtro.vencimentoAte = $event" />
          </label>
        </div>
      </app-barra-filtros>

      <!-- Resumo do total -->
      <p class="bo-sub">{{ linhas.length }} cobrança(s) · {{ dinheiro(total()) }}</p>

      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (aviso) { <div class="bo-aviso">{{ aviso }}</div> }

      <div class="bo-table-wrap mt-4">
        <div class="bo-table-rolagem">
          <table class="bo-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="Selecionar todas as abertas"
                    [checked]="selecao.todos(abertas())"
                    [indeterminate]="selecao.alguns(abertas())"
                    (change)="alternarTodas()">
                </th>
                <th>Cliente</th><th>Produto</th><th>Competência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Pagamento</th>
              </tr>
            </thead>
            <tbody>
              @for (c of linhas; track c.id) {
                <tr class="clicavel" tabindex="0"
                  [class.marcada]="selecao.marcado(c.id)"
                  (click)="detalheId = c.id; cdr.markForCheck()"
                  (keydown.enter)="detalheId = c.id; cdr.markForCheck()">
                  <td (click)="$event.stopPropagation()">
                    @if (c.status === 'ABERTA' || c.status === 'PAGA') {
                      <input type="checkbox"
                        [checked]="selecao.marcado(c.id)"
                        (change)="selecao.alternar(c.id); cdr.markForCheck()"
                        [attr.aria-label]="'Selecionar cobrança de ' + c.clienteNome">
                    }
                  </td>
                  <td>{{ c.clienteNome }}<div class="text-xs text-neutral-500">{{ c.nomeInstancia }}</div></td>
                  <td>{{ c.produtoCodigo }}<div class="text-xs text-neutral-500">{{ c.planoNome }}</div></td>
                  <td>{{ competenciaNaLista(c.competenciaInicio) }}</td>
                  <td>{{ data(c.vencimento) }}</td>
                  <td>{{ dinheiro(c.valor) }}</td>
                  <td><span [class]="tomCobranca(c.status, c.vencida)">{{ rotuloStatusCobranca(c.status, c.vencida) }}</span></td>
                  <td>@if (c.pagoEm) { {{ data(c.pagoEm) }} · {{ rotuloFormaPagamento(c.formaPagamento) }} } @else { — }</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-estado-lista [carregando]="carregando" [vazio]="!carregando && linhas.length === 0"
          mensagemVazio="Nenhuma cobrança com estes filtros." />
      </div>

      @if (linhas.length >= 1000) { <p class="bo-sub">Mostrando as 1000 primeiras; refine os filtros.</p> }
    </div>

    @if (pagando) {
      <app-pagamento-modal [cobrancas]="aPagar()" [ocupado]="ocupado" [erro]="erroPagamento"
        (pagar)="pagar($event)" (fechar)="pagando = false" />
    }
    @if (detalheId) {
      <app-cobranca-detalhe-modal [cobrancaId]="detalheId" (alterado)="carregar()" (fechar)="detalheId = null; cdr.markForCheck()" />
    }
  `
})
export class CobrancasComponent implements OnInit {
  readonly dadosExportacao = () => ({ nome: 'cobrancas', titulo: 'Central · Cobranças', colunas: ['Cliente', 'Instância', 'Produto', 'Plano', 'Vencimento', 'Valor (R$)', 'Situação', 'Pago em', 'Valor pago (R$)'], linhas: this.linhas.map(c => [c.clienteNome, c.nomeInstancia, c.produtoCodigo, c.planoNome, c.vencimento, c.valor, c.status, c.pagoEm, c.valorPago]) });
  private api = inject(CentralApiService);
  readonly cdr = inject(ChangeDetectorRef);

  produtos: Produto[] = [];
  linhas: CobrancaLinha[] = [];
  filtro: FiltroCobrancas = filtroVazio();
  selecao = new Selecao();
  carregando = false;
  erro = '';
  aviso = '';
  pagando = false;
  ocupado = false;
  erroPagamento = '';
  detalheId: string | null = null;

  readonly formas = FORMAS_PAGAMENTO;
  readonly competencia = competencia;
  readonly competenciaNaLista = competenciaNaLista;
  readonly data = data;
  readonly dinheiro = dinheiro;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  readonly rotuloStatusCobranca = rotuloStatusCobranca;
  readonly tomCobranca = tomCobranca;

  ngOnInit(): void {
    this.api.produtos().subscribe({ next: l => { this.produtos = l; this.cdr.markForCheck(); } });
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.api.cobrancas(this.filtro).subscribe({
      next: l => {
        this.linhas = l;
        this.carregando = false;
        // Só continuam marcadas as abertas que ainda estão na lista.
        const ficam = this.selecao.marcadosEm(l, this.abertas()).map(c => c.id);
        this.selecao.limpar();
        this.selecao.marcarTodos(ficam, true);
        this.cdr.markForCheck();
      },
      error: e => { this.carregando = false; this.erro = mensagemApi(e, 'Não foi possível listar as cobranças.'); this.cdr.markForCheck(); }
    });
  }

  limpar(): void {
    this.filtro = filtroVazio();
    this.selecao.limpar();
    this.carregar();
  }

  total(): number {
    return this.linhas.reduce((soma, c) => soma + Number(c.valor), 0);
  }

  abertas(): string[] {
    return this.linhas.filter(c => c.status === 'ABERTA').map(c => c.id);
  }

  alternarTodas(): void {
    const ids = this.abertas();
    if (this.selecao.todos(ids)) this.selecao.marcarTodos(ids, false);
    else this.selecao.marcarTodos(ids, true);
    this.cdr.markForCheck();
  }

  selecionaveis(): string[] {
    return this.linhas.filter(c => c.status === 'ABERTA' || c.status === 'PAGA').map(c => c.id);
  }

  menuOpcoes(): OpcaoMenu[] {
    const n = this.selecao.quantidade(this.abertas());
    const uma = this.unicaSelecionada();
    return [
      { id: 'pagar', rotulo: `Registrar pagamento (${n})`, desabilitada: n === 0, dica: n === 0 ? 'Selecione cobranças abertas' : '' },
      { id: 'estornar', rotulo: 'Estornar pagamento', desabilitada: uma?.status !== 'PAGA', dica: 'Selecione uma cobrança paga' },
      { id: 'reemitir', rotulo: 'Cancelar e emitir nova', desabilitada: !uma, dica: 'Selecione uma cobrança' }
    ];
  }

  private unicaSelecionada(): CobrancaLinha | null {
    const escolhidas = this.selecao.marcadosEm(this.linhas, this.selecionaveis());
    return escolhidas.length === 1 ? escolhidas[0] : null;
  }

  filtrosAtivosLista(): FiltroAtivo[] {
    const lista: FiltroAtivo[] = [];
    if (this.filtro.situacao) lista.push({ chave: 'situacao', rotulo: SITUACOES[this.filtro.situacao] ?? this.filtro.situacao });
    if (this.filtro.produtoId) {
      const p = this.produtos.find(x => x.id === this.filtro.produtoId);
      if (p) lista.push({ chave: 'produtoId', rotulo: p.nome });
    }
    if (this.filtro.formaPagamento) lista.push({ chave: 'formaPagamento', rotulo: rotuloFormaPagamento(this.filtro.formaPagamento) });
    if (this.filtro.competencia) lista.push({ chave: 'competencia', rotulo: this.filtro.competencia });
    if (this.filtro.vencimentoDe || this.filtro.vencimentoAte) {
      lista.push({ chave: 'vencimento', rotulo: `Vencimento ${data(this.filtro.vencimentoDe || null) || '…'} a ${data(this.filtro.vencimentoAte || null) || '…'}` });
    }
    return lista;
  }

  removerFiltro(chave: string): void {
    if (chave === 'situacao') this.filtro.situacao = '';
    if (chave === 'produtoId') this.filtro.produtoId = '';
    if (chave === 'formaPagamento') this.filtro.formaPagamento = '';
    if (chave === 'competencia') this.filtro.competencia = '';
    if (chave === 'vencimento') { this.filtro.vencimentoDe = ''; this.filtro.vencimentoAte = ''; }
    this.carregar();
  }

  aoOpcao(id: string): void {
    if (id === 'pagar') this.abrirPagamento();
    if (id === 'estornar') this.estornar();
    if (id === 'reemitir') this.reemitir();
  }

  estornar(): void {
    const c = this.unicaSelecionada();
    if (!c || c.status !== 'PAGA') return;
    this.ocupado = true;
    this.erro = '';
    this.aviso = '';
    this.api.estornar(c.contratacaoId, c.id).subscribe({
      next: () => { this.ocupado = false; this.aviso = 'Pagamento estornado.'; this.selecao.limpar(); this.carregar(); },
      error: e => { this.ocupado = false; this.erro = mensagemApi(e, 'Não foi possível estornar.'); this.cdr.markForCheck(); }
    });
  }

  reemitir(): void {
    const c = this.unicaSelecionada();
    if (!c) return;
    this.ocupado = true;
    this.erro = '';
    this.aviso = '';
    this.api.reemitir(c.contratacaoId, c.id).subscribe({
      next: () => { this.ocupado = false; this.aviso = 'Cobrança cancelada. Uma nova foi emitida.'; this.selecao.limpar(); this.carregar(); },
      error: e => { this.ocupado = false; this.erro = mensagemApi(e, 'Não foi possível emitir a nova cobrança.'); this.cdr.markForCheck(); }
    });
  }

  aPagar(): CobrancaAPagar[] {
    return this.selecao.marcadosEm(this.linhas, this.abertas()).map(c => ({
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
        this.selecao.limpar();
        this.carregar();
      },
      error: e => { this.ocupado = false; this.erroPagamento = mensagemApi(e, 'Não foi possível registrar o pagamento.'); this.cdr.markForCheck(); }
    });
  }
}

const SITUACOES: Record<string, string> = { ABERTA: 'Aberta', VENCIDA: 'Vencida', PAGA: 'Paga', ISENTA: 'Isenta', CANCELADA: 'Cancelada' };

/** A competência do mês já vem aplicada (teste de telas de 27/09/2026); o "✕" do campo tira. */
function filtroVazio(): FiltroCobrancas {
  return { produtoId: '', situacao: '', formaPagamento: '', vencimentoDe: '', vencimentoAte: '', competencia: competenciaAtual(), busca: '' };
}
