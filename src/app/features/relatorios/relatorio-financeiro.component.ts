import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { mensagemApi } from '../../core/api/api-error';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { CampoDataComponent } from '../comum/campo-data.component';
import { Conta } from '../financeiro/financeiro.models';
import { baixarCsv, csvBancoCaixa, csvDemonstrativo, csvPorTipo } from './relatorios-csv';
import { BancoCaixa, Demonstrativo, PorTipo, RelatorioCatalogo, RelatorioId, Visao, relatorioPorId } from './relatorios.models';

function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/**
 * Um relatório financeiro por vez (`/relatorios/:tipo`): período, geração, impressão e CSV. Só lê dados; nada é gravado.
 * A impressão usa o diálogo do navegador (`window.print`) e a folha de estilo de impressão do painel.
 */
@Component({
  selector: 'app-relatorio-financeiro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, CabecalhoPaginaComponent, CampoDataComponent],
  template: `
    <div class="space-y-5">
      <app-cabecalho-pagina [titulo]="info?.titulo ?? 'Relatório'" [subtitulo]="info?.descricao ?? ''">
        <a acoes class="bo-btn-ghost nao-imprimir" routerLink="/relatorios">Todos os relatórios</a>
      </app-cabecalho-pagina>

      @if (!info) {
        <p class="bo-card p-4" role="alert">Relatório não encontrado. <a routerLink="/relatorios" class="underline">Ver todos os relatórios</a>.</p>
      } @else {
        <form class="bo-card nao-imprimir flex flex-wrap items-end gap-3 p-4" (ngSubmit)="gerar()" data-filtros>
          <div><label class="bo-label" for="rel-de">De</label><app-campo-data idCampo="rel-de" name="de" [(ngModel)]="de" /></div>
          <div><label class="bo-label" for="rel-ate">Até</label><app-campo-data idCampo="rel-ate" name="ate" [(ngModel)]="ate" /></div>
          @if (info.id === 'despesas' || info.id === 'receitas') {
            <div>
              <label class="bo-label" for="rel-visao">Visão</label>
              <select id="rel-visao" name="visao" class="bo-field" [(ngModel)]="visao">
                <option value="REALIZADO">Realizado (pela data da baixa)</option><option value="PREVISTO">Previsto (pendentes, pelo vencimento)</option>
              </select>
            </div>
          }
          @if (info.id === 'banco-caixa') {
            <div>
              <label class="bo-label" for="rel-conta">Conta / banco</label>
              <select id="rel-conta" name="conta" class="bo-field" [(ngModel)]="contaId"><option value="">Todas</option>@for (c of contas(); track c.id) { <option [value]="c.id">{{ c.nome }}</option> }</select>
            </div>
          }
          <button type="submit" class="bo-btn" [disabled]="carregando()" data-gerar>{{ carregando() ? 'Gerando...' : 'Gerar relatório' }}</button>
          <button type="button" class="bo-btn-ghost" [disabled]="!temDados()" (click)="imprimir()" data-imprimir>Imprimir</button>
          <button type="button" class="bo-btn-ghost" [disabled]="!temDados()" (click)="baixar()" data-csv>Baixar CSV</button>
        </form>

        @if (erro()) { <div class="bo-card p-4 text-rose-400" role="alert" data-erro>{{ erro() }}</div> }

        @if (temDados()) {
          <div class="so-impressao">
            <strong>Central — {{ info.titulo }}</strong>
            <div>Período: {{ de | date:'dd/MM/yyyy':'UTC' }} a {{ ate | date:'dd/MM/yyyy':'UTC' }} · gerado em {{ geradoEm | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        }

        @if (porTipo(); as r) {
          <section class="bo-card area-relatorio space-y-3 p-4" data-relatorio-tipo>
            <h2 class="text-lg font-bold">{{ r.tipo === 'DESPESA' ? 'Despesas' : 'Receitas' }} {{ r.visao === 'REALIZADO' ? 'realizadas' : 'previstas' }}</h2>
            <p>Total: <strong>{{ r.total | currency:'BRL' }}</strong></p>
            <div class="bo-table-rolagem">
              <table class="bo-table">
                <thead><tr><th>Data</th><th>Descrição</th><th>Conta / banco</th><th class="text-right">Valor</th></tr></thead>
                <tbody>
                  @for (g of r.grupos; track g.nome) {
                    <tr class="rel-grupo" data-grupo><td colspan="3"><strong>{{ g.nome }}</strong>@if (g.comercial) { <small class="ml-2 text-neutral-400">calculado das cobranças de assinatura</small> }</td><td class="text-right"><strong>{{ g.total | currency:'BRL' }}</strong></td></tr>
                    @for (c of g.contas; track c.nome) {
                      <tr class="rel-conta"><td colspan="3" class="pl-6">{{ c.nome }}</td><td class="text-right">{{ c.total | currency:'BRL' }}</td></tr>
                      @for (l of c.lancamentos; track $index) {
                        <tr><td class="pl-10">{{ l.data | date:'dd/MM/yyyy':'UTC' }}</td><td>{{ l.descricao }}</td><td>{{ l.contaBanco }}</td><td class="text-right">{{ l.valor | currency:'BRL' }}</td></tr>
                      }
                    }
                  } @empty {
                    <tr><td colspan="4" class="text-neutral-400" data-vazio>Nenhum lançamento {{ r.visao === 'REALIZADO' ? 'baixado' : 'pendente' }} neste período.</td></tr>
                  }
                  <tr class="rel-total"><td colspan="3"><strong>Total</strong></td><td class="text-right"><strong>{{ r.total | currency:'BRL' }}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (banco(); as b) {
          <section class="area-relatorio space-y-4" data-relatorio-banco>
            <div class="bo-card grid gap-3 p-4 sm:grid-cols-4">
              <p>Saldo anterior <strong class="block">{{ b.saldoAnterior | currency:'BRL' }}</strong></p>
              <p>Entradas <strong class="block text-emerald-400">{{ b.entradas | currency:'BRL' }}</strong></p>
              <p>Saídas <strong class="block text-rose-400">{{ b.saidas | currency:'BRL' }}</strong></p>
              <p>Saldo final <strong class="block">{{ b.saldoFinal | currency:'BRL' }}</strong></p>
            </div>
            @for (c of b.contas; track c.id) {
              <section class="bo-card space-y-2 p-4" data-conta-banco>
                <h2 class="text-lg font-bold">{{ c.nome }}@if (!c.ativo) { <small class="ml-2 text-neutral-400">inativa</small> }</h2>
                <div class="bo-table-rolagem">
                  <table class="bo-table">
                    <thead><tr><th>Data</th><th>Descrição</th><th>Conta contábil</th><th class="text-right">Entrada</th><th class="text-right">Saída</th><th class="text-right">Saldo</th></tr></thead>
                    <tbody>
                      <tr class="rel-grupo"><td colspan="5">Saldo anterior</td><td class="text-right">{{ c.saldoAnterior | currency:'BRL' }}</td></tr>
                      @for (m of c.movimentos; track $index) {
                        <tr><td>{{ m.data | date:'dd/MM/yyyy':'UTC' }}</td><td>{{ m.descricao }}</td><td>{{ m.contaContabil }}</td><td class="text-right">{{ m.entrada ? (m.entrada | currency:'BRL') : '' }}</td><td class="text-right">{{ m.saida ? (m.saida | currency:'BRL') : '' }}</td><td class="text-right">{{ m.saldo | currency:'BRL' }}</td></tr>
                      } @empty {
                        <tr><td colspan="6" class="text-neutral-400">Sem movimentação baixada neste período.</td></tr>
                      }
                      <tr class="rel-total"><td colspan="3"><strong>Total da conta</strong></td><td class="text-right"><strong>{{ c.entradas | currency:'BRL' }}</strong></td><td class="text-right"><strong>{{ c.saidas | currency:'BRL' }}</strong></td><td class="text-right"><strong>{{ c.saldoFinal | currency:'BRL' }}</strong></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            } @empty {
              <p class="bo-card p-4 text-neutral-400" data-vazio>Nenhuma conta/banco com movimentação ou saldo neste período.</p>
            }
            <p class="text-xs text-neutral-400">{{ b.observacao }}</p>
          </section>
        }

        @if (demo(); as d) {
          <section class="area-relatorio space-y-4" data-relatorio-demonstrativo>
            <div class="bo-card grid gap-3 p-4 sm:grid-cols-3">
              <p>Receitas <strong class="block text-emerald-400">{{ d.totalReceitas | currency:'BRL' }}</strong></p>
              <p>Despesas <strong class="block text-rose-400">{{ d.totalDespesas | currency:'BRL' }}</strong></p>
              <p>Resultado do período <strong class="block">{{ d.resultado | currency:'BRL' }}</strong></p>
            </div>
            @for (bloco of [{ nome: 'Receitas', dados: d.receitas }, { nome: 'Despesas', dados: d.despesas }]; track bloco.nome) {
              <section class="bo-card space-y-2 p-4">
                <h2 class="text-lg font-bold">{{ bloco.nome }}</h2>
                <div class="bo-table-rolagem">
                  <table class="bo-table">
                    <thead><tr><th>Grupo / conta contábil</th><th class="text-right">Valor</th></tr></thead>
                    <tbody>
                      @for (g of bloco.dados.grupos; track g.nome) {
                        <tr class="rel-grupo"><td><strong>{{ g.nome }}</strong></td><td class="text-right"><strong>{{ g.total | currency:'BRL' }}</strong></td></tr>
                        @for (c of g.contas; track c.nome) { <tr><td class="pl-6">{{ c.nome }}</td><td class="text-right">{{ c.total | currency:'BRL' }}</td></tr> }
                      } @empty {
                        <tr><td colspan="2" class="text-neutral-400">Nada baixado neste período.</td></tr>
                      }
                      <tr class="rel-total"><td><strong>Total de {{ bloco.nome.toLowerCase() }}</strong></td><td class="text-right"><strong>{{ bloco.dados.total | currency:'BRL' }}</strong></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            }
            <section class="bo-card grid gap-3 p-4 sm:grid-cols-3">
              <p>A receber (pendente) <strong class="block text-amber-300">{{ d.aReceber | currency:'BRL' }}</strong></p>
              <p>A pagar (pendente) <strong class="block text-amber-300">{{ d.aPagar | currency:'BRL' }}</strong></p>
              <p>Resultado previsto <strong class="block">{{ d.resultadoPrevisto | currency:'BRL' }}</strong></p>
              <p class="text-xs text-neutral-400 sm:col-span-3">Previsto = resultado realizado + pendentes a receber − pendentes a pagar, com vencimento no período. É uma previsão, não dinheiro disponível.</p>
            </section>
            <section class="bo-card space-y-2 p-4">
              <h2 class="text-lg font-bold">Saldo das contas em {{ d.ate | date:'dd/MM/yyyy':'UTC' }}</h2>
              <div class="flex flex-wrap gap-5">@for (s of d.saldos; track s.id) { <p>{{ s.nome }}: <strong>{{ s.saldo | currency:'BRL' }}</strong></p> }</div>
            </section>
          </section>
        }
      }
    </div>
  `
})
export class RelatorioFinanceiroComponent implements OnDestroy {
  private readonly api = inject(CentralApiService);
  private readonly rota = inject(ActivatedRoute);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly sub: Subscription;
  private geracao = 0;

  info: RelatorioCatalogo | undefined;
  de = hojeLocal().slice(0, 7) + '-01';
  ate = hojeLocal();
  visao: Visao = 'REALIZADO';
  contaId = '';
  geradoEm = new Date();

  readonly contas = signal<Conta[]>([]);
  readonly porTipo = signal<PorTipo | null>(null);
  readonly banco = signal<BancoCaixa | null>(null);
  readonly demo = signal<Demonstrativo | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal('');

  constructor() {
    this.sub = this.rota.paramMap.subscribe(p => {
      this.info = relatorioPorId(p.get('tipo') ?? '');
      this.limpar();
      if (this.info?.id === 'banco-caixa') void firstValueFrom(this.api.contasFinanceiras()).then(c => { this.contas.set(c); this.cd.markForCheck(); }).catch(() => undefined);
      if (this.info) void this.gerar();
      this.cd.markForCheck();
    });
  }
  ngOnDestroy() { this.sub.unsubscribe(); ++this.geracao; }

  temDados() { return !!(this.porTipo() || this.banco() || this.demo()); }

  private limpar() { this.porTipo.set(null); this.banco.set(null); this.demo.set(null); this.erro.set(''); }

  async gerar() {
    if (!this.info) return;
    const geracao = ++this.geracao;
    if (!this.de || !this.ate || this.de > this.ate) { this.limpar(); this.erro.set('Informe um período válido: a data inicial não pode ser depois da final.'); return; }
    this.carregando.set(true); this.limpar();
    try {
      const id: RelatorioId = this.info.id;
      if (id === 'despesas' || id === 'receitas') this.porTipo.set(await firstValueFrom(this.api.relatorioPorTipo(id, this.de, this.ate, this.visao)));
      else if (id === 'banco-caixa') this.banco.set(await firstValueFrom(this.api.relatorioBancoCaixa(this.de, this.ate, this.contaId || undefined)));
      else this.demo.set(await firstValueFrom(this.api.relatorioDemonstrativo(this.de, this.ate)));
      if (geracao === this.geracao) this.geradoEm = new Date();
    } catch (e) {
      if (geracao === this.geracao) this.erro.set(mensagemApi(e, 'Não foi possível gerar o relatório.'));
    } finally {
      if (geracao === this.geracao) { this.carregando.set(false); this.cd.markForCheck(); }
    }
  }

  imprimir() { window.print(); }

  baixar() {
    if (!this.info) return;
    const nome = `relatorio-${this.info.id}-${this.de}-a-${this.ate}.csv`;
    const r = this.porTipo(), b = this.banco(), d = this.demo();
    if (r) baixarCsv(nome, csvPorTipo(r)); else if (b) baixarCsv(nome, csvBancoCaixa(b)); else if (d) baixarCsv(nome, csvDemonstrativo(d));
  }
}
