import { Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { codigoApi, mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Adicional, Contratacao, Financeiro, FormaPagamento, Periodicidade, Plano, Suporte } from '../../core/api/central.models';
import {
  FORMAS_PAGAMENTO, data, porVencimento, dinheiro, hojeIso, podeBloquear, podeCancelar, podeDesbloquear, podeEditarProvisionamento,
  podeEntrarEmSuporte, podeTentarNovamente, rotuloAcaoHistorico, rotuloFormaPagamento, rotuloPeriodicidade,
  rotuloProvisionamento, rotuloSituacao, rotuloStatusCobranca, textoOuNulo, tomCobranca, tomProvisionamento, tomSituacao
} from '../comum/rotulos';
import { adicionaisValidos, montarPagamento, montarProvisionamentoRequest, montarTrocaDePlano } from './contratacao.form';

type Aba = 'resumo' | 'financeiro' | 'historico';
type AcaoComMotivo = 'bloquear' | 'desbloquear' | 'cancelar' | 'suporte';

@Component({
  selector: 'app-contratacao-detalhe',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <a routerLink="/contratacoes" class="bo-link">← Contratações</a>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (aviso) { <div class="bo-aviso">{{ aviso }}</div> }
      @if (c) {
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-wider text-neutral-500">{{ c.produtoCodigo }}</div>
            <h1 class="bo-title">{{ c.nomeInstancia }}</h1>
            <p class="bo-sub"><a [routerLink]="['/clientes', c.clienteId]" class="hover:text-white">Ver cliente</a> · slug {{ c.slugInstancia }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="bo-chip" [class]="tomSituacao(c.situacaoComercial)">{{ rotuloSituacao(c.situacaoComercial) }}</span>
            <span class="bo-chip" [class]="tomProvisionamento(c.situacaoProvisionamento, c.situacaoComercial)">{{ rotuloProvisionamento(c.situacaoProvisionamento, c.situacaoComercial) }}</span>
          </div>
        </div>

        <nav class="bo-tabs">
          <button type="button" class="bo-tab" [class.active]="aba === 'resumo'" (click)="aba = 'resumo'">Resumo</button>
          <button type="button" class="bo-tab" [class.active]="aba === 'financeiro'" (click)="abrirFinanceiro()">Financeiro</button>
          <button type="button" class="bo-tab" [class.active]="aba === 'historico'" (click)="aba = 'historico'">Histórico ({{ c.historico.length }})</button>
        </nav>

        @if (aba === 'resumo') {
          <div class="grid gap-4 lg:grid-cols-3">
            <section class="bo-card space-y-2 p-5">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Plano</h2>
              <p class="text-lg font-bold">{{ c.planoNome }}</p>
              <p class="bo-sub">{{ rotuloPeriodicidade(c.periodicidade) }} · {{ dinheiro(c.valor) }} · vence dia {{ c.diaVencimento }}</p>
              <p class="bo-sub">Início {{ data(c.inicio) }} · pago até {{ data(c.vigenteAte) }}</p>
            </section>
            <section class="bo-card space-y-2 p-5">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Direitos enviados (v{{ c.versaoDireitos }})</h2>
              <p [class]="c.direitos.acessoLiberado ? 'bo-ok' : 'bo-bad'">{{ c.direitos.acessoLiberado ? 'Acesso liberado' : 'Acesso bloqueado' }}
                @if (c.direitos.motivoBloqueio) { <span class="text-neutral-400"> · {{ c.direitos.motivoBloqueio }}</span> }</p>
              @for (l of limites(); track l.chave) { <p class="text-sm">{{ l.chave }}: <b>{{ l.valor }}</b></p> }
              @if (c.direitos.funcionalidades.length) { <p class="text-sm text-neutral-400">{{ c.direitos.funcionalidades.join(', ') }}</p> }
            </section>
            <section class="bo-card space-y-2 p-5">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Adicionais</h2>
              @for (a of c.adicionais; track a.adicionalId) {
                <p class="text-sm">{{ a.codigo }} × {{ a.quantidade }} <span class="text-neutral-500">(+{{ a.quantidadeUnitaria }} {{ a.recursoCodigo }} cada)</span></p>
              } @empty { <p class="bo-sub">Nenhum.</p> }
              @if (c.situacaoComercial !== 'CANCELADA') {
                <button type="button" class="bo-link" (click)="abrirAdicionais()">Alterar adicionais</button>
              }
            </section>
          </div>

          <section class="bo-card space-y-4 p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Instância no aplicativo</h2>
              <div class="flex flex-wrap gap-2">
                @if (podeTentarNovamente(c)) {
                  <button type="button" class="bo-btn" [disabled]="ocupado" (click)="tentarNovamente()">Tentar novamente</button>
                }
                @if (podeEditarProvisionamento(c) && !editandoProvisionamento) {
                  <button type="button" class="bo-btn-ghost" (click)="abrirEdicaoProvisionamento()">Editar nome, slug e admin</button>
                }
              </div>
            </div>
            <dl class="grid gap-3 text-sm md:grid-cols-4">
              <div><dt class="text-neutral-500">Situação</dt><dd [class]="tomProvisionamento(c.situacaoProvisionamento, c.situacaoComercial)">{{ rotuloProvisionamento(c.situacaoProvisionamento, c.situacaoComercial) }}</dd></div>
              <div><dt class="text-neutral-500">Id no aplicativo</dt><dd class="break-all">{{ c.idExterno || '—' }}</dd></div>
              <div><dt class="text-neutral-500">Administrador</dt><dd>{{ c.adminNome }}<span class="block text-neutral-400">{{ c.adminEmail }}</span></dd></div>
              <div><dt class="text-neutral-500">Idempotency-Key</dt><dd class="break-all text-neutral-400">{{ c.idempotencyKey }}</dd></div>
            </dl>
            @if (!c.provisionamentoEditavel && !c.idExterno && c.situacaoComercial !== 'CANCELADA') {
              <p class="bo-sub">O aplicativo pode já ter criado a instância com estes dados; tente o provisionamento de novo antes de editar.</p>
            }
            @if (editandoProvisionamento) {
              <form class="grid gap-3 md:grid-cols-2" (ngSubmit)="salvarProvisionamento()">
                <label><span class="bo-label">Nome da instância</span><input class="bo-field" name="pNome" [(ngModel)]="prov.nomeInstancia"></label>
                <label><span class="bo-label">Slug</span><input class="bo-field" name="pSlug" [(ngModel)]="prov.slugInstancia"></label>
                <label><span class="bo-label">Administrador</span><input class="bo-field" name="pAdmin" [(ngModel)]="prov.adminNome"></label>
                <label><span class="bo-label">E-mail do administrador</span><input class="bo-field" type="email" name="pEmail" [(ngModel)]="prov.adminEmail"></label>
                <div class="flex gap-2 md:col-span-2">
                  <button class="bo-btn" type="submit" [disabled]="ocupado">Salvar e reenviar</button>
                  <button class="bo-btn-ghost" type="button" (click)="editandoProvisionamento = false">Cancelar</button>
                </div>
              </form>
            }
          </section>

          @if (editandoAdicionais) {
            <section class="bo-card space-y-3 p-5">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Alterar adicionais</h2>
              @for (a of adicionaisForm; track $index; let i = $index) {
                <div class="grid items-end gap-3 md:grid-cols-[1fr_8rem_auto]">
                  <select class="bo-field" [name]="'ea' + i" [(ngModel)]="a.adicionalId">
                    <option value="" disabled>Escolha</option>
                    @for (ad of catalogoAdicionais; track ad.id) { <option [value]="ad.id">{{ ad.nome }} (+{{ ad.quantidade }} {{ ad.recursoCodigo }})</option> }
                  </select>
                  <input class="bo-field" type="number" min="1" [name]="'eq' + i" [(ngModel)]="a.quantidade">
                  <button type="button" class="bo-link pb-3" (click)="adicionaisForm.splice(i, 1)">Excluir</button>
                </div>
              }
              <div class="flex flex-wrap items-end gap-3">
                <button type="button" class="bo-btn-line" (click)="adicionaisForm.push({ adicionalId: '', quantidade: 1 })">+ Adicional</button>
                <input class="bo-field max-w-sm" placeholder="Motivo (opcional)" name="motivoAd" [(ngModel)]="motivoAdicionais">
                <button type="button" class="bo-btn" [disabled]="ocupado" (click)="salvarAdicionais()">Salvar adicionais</button>
                <button type="button" class="bo-btn-ghost" (click)="editandoAdicionais = false">Cancelar</button>
              </div>
            </section>
          }

          @if (c.situacaoComercial !== 'CANCELADA') {
            <section class="bo-card space-y-3 p-5">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Troca de plano</h2>
                @if (!trocandoPlano) { <button type="button" class="bo-link" (click)="abrirTrocaDePlano()">Trocar plano</button> }
              </div>
              @if (trocandoPlano) {
                <form class="grid gap-3 md:grid-cols-3" (ngSubmit)="salvarTrocaDePlano()">
                  <label><span class="bo-label">Plano</span>
                    <select class="bo-field" name="tpPlano" [(ngModel)]="troca.planoId">
                      @for (p of planos; track p.id) { <option [value]="p.id">{{ p.nome }} · {{ dinheiro(p.precoMensal) }}/mês</option> }
                    </select>
                  </label>
                  <label><span class="bo-label">Periodicidade</span>
                    <select class="bo-field" name="tpPer" [(ngModel)]="troca.periodicidade"><option value="MENSAL">Mensal</option><option value="ANUAL">Anual</option></select>
                  </label>
                  <label><span class="bo-label">Valor (vazio = preço do plano)</span><input class="bo-field" name="tpValor" [(ngModel)]="troca.valor"></label>
                  <label><span class="bo-label">Dia de vencimento</span><input class="bo-field" type="number" min="1" max="28" name="tpDia" [(ngModel)]="troca.diaVencimento"></label>
                  <label><span class="bo-label">A partir de</span><input class="bo-field" type="date" name="tpData" [(ngModel)]="troca.aPartirDe"></label>
                  <label><span class="bo-label">Motivo</span><input class="bo-field" name="tpMotivo" [(ngModel)]="troca.motivo"></label>
                  <p class="bo-sub md:col-span-3">Cobranças pagas ficam; as abertas a partir da data são refeitas com o valor novo.</p>
                  <div class="flex gap-2 md:col-span-3">
                    <button class="bo-btn" type="submit" [disabled]="ocupado || !troca.planoId || !troca.aPartirDe">Trocar plano</button>
                    <button class="bo-btn-ghost" type="button" (click)="trocandoPlano = false">Cancelar</button>
                  </div>
                </form>
              }
            </section>
          }

          <section class="bo-card space-y-3 p-5">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Ações</h2>
            <div class="flex flex-wrap gap-2">
              @if (podeEntrarEmSuporte(c)) { <button type="button" class="bo-btn-line" (click)="pedir('suporte')">Entrar em suporte</button> }
              @if (podeBloquear(c)) { <button type="button" class="bo-btn-ghost" (click)="pedir('bloquear')">Bloquear</button> }
              @if (podeDesbloquear(c)) { <button type="button" class="bo-btn-ghost" (click)="pedir('desbloquear')">Desbloquear</button> }
              @if (podeCancelar(c)) { <button type="button" class="bo-btn-ghost" (click)="pedir('cancelar')">Cancelar contratação</button> }
            </div>
            @if (acao) {
              <div class="flex flex-wrap items-end gap-3 rounded-lg border border-[#3a3a3a] p-3">
                <label class="min-w-[16rem] flex-1"><span class="bo-label">{{ tituloAcao() }}</span>
                  <input class="bo-field" name="motivoAcao" [(ngModel)]="motivo" [placeholder]="motivoObrigatorio() ? 'Motivo (obrigatório)' : 'Motivo (opcional)'">
                </label>
                <button type="button" class="bo-btn" [disabled]="ocupado || (motivoObrigatorio() && !motivo.trim())" (click)="confirmar()">Confirmar</button>
                <button type="button" class="bo-btn-ghost" (click)="acao = null">Voltar</button>
              </div>
            }
            @if (suporte) {
              <p class="text-sm">Código <b>{{ suporte.codigo }}</b> até {{ data(suporte.expiraEm) }} ·
                <a class="bo-link" [href]="suporte.urlAcesso" target="_blank" rel="noopener">abrir de novo</a></p>
            }
          </section>
        }

        @if (aba === 'financeiro') {
          @if (financeiro) {
            <div class="grid gap-3 md:grid-cols-5">
              <div class="bo-card p-4"><div class="text-xs text-neutral-500">Vencidas</div><div class="text-xl font-bold" [class.bo-bad]="financeiro.resumo.vencidas > 0">{{ financeiro.resumo.vencidas }}</div></div>
              <div class="bo-card p-4"><div class="text-xs text-neutral-500">Dias de atraso</div><div class="text-xl font-bold">{{ financeiro.resumo.diasAtraso }}</div></div>
              <div class="bo-card p-4"><div class="text-xs text-neutral-500">Em atraso</div><div class="text-xl font-bold">{{ dinheiro(financeiro.resumo.valorEmAtraso) }}</div></div>
              <div class="bo-card p-4"><div class="text-xs text-neutral-500">Próximo vencimento</div><div class="text-xl font-bold">{{ data(financeiro.resumo.proximoVencimento) }}</div></div>
              <div class="bo-card p-4"><div class="text-xs text-neutral-500">Pago no ano</div><div class="text-xl font-bold">{{ dinheiro(financeiro.resumo.totalPagoNoAno) }}</div></div>
            </div>
            <div class="bo-table-wrap">
              <table class="bo-table">
                <thead><tr><th></th><th>Competência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Pagamento</th><th></th></tr></thead>
                <tbody>
                  @for (cb of cobrancasOrdenadas(); track cb.id) {
                    <tr>
                      <td>@if (cb.status === 'ABERTA') { <input type="checkbox" [checked]="selecionadas.has(cb.id)" (change)="alternar(cb.id)" [attr.aria-label]="'Selecionar cobrança de ' + data(cb.vencimento)"> }</td>
                      <td>{{ data(cb.competenciaInicio) }} a {{ data(cb.competenciaFim) }}</td>
                      <td>{{ data(cb.vencimento) }}</td>
                      <td>{{ dinheiro(cb.valor) }}</td>
                      <td><span [class]="tomCobranca(cb.status, cb.vencida)">{{ rotuloStatusCobranca(cb.status, cb.vencida) }}</span></td>
                      <td>@if (cb.pagoEm) { {{ data(cb.pagoEm) }} · {{ rotuloFormaPagamento(cb.formaPagamento) }} · {{ dinheiro(cb.valorPago) }} } @else { — }
                        @if (cb.observacao) { <span class="block text-xs text-neutral-500">{{ cb.observacao }}</span> }</td>
                      <td class="whitespace-nowrap text-right">
                        @if (cb.status === 'PAGA') { <button type="button" class="bo-link" (click)="estornar(cb.id)">Estornar</button> }
                        @if (cb.status === 'ABERTA') { <button type="button" class="bo-link" (click)="isentar(cb.id)">Isentar</button> }
                      </td>
                    </tr>
                  } @empty { <tr><td colspan="7" class="text-center text-neutral-500">Nenhuma cobrança.</td></tr> }
                </tbody>
              </table>
            </div>
            <section class="bo-card grid gap-3 p-5 md:grid-cols-5">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400 md:col-span-5">Registrar pagamento ({{ selecionadas.size }} selecionada(s))</h2>
              <label><span class="bo-label">Pago em</span><input class="bo-field" type="date" name="pgData" [(ngModel)]="pagamento.pagoEm"></label>
              <label><span class="bo-label">Forma</span>
                <select class="bo-field" name="pgForma" [(ngModel)]="pagamento.formaPagamento">
                  @for (f of formas; track f) { <option [value]="f">{{ rotuloFormaPagamento(f) }}</option> }
                </select>
              </label>
              <label><span class="bo-label">Valor pago (vazio = soma)</span><input class="bo-field" name="pgValor" [(ngModel)]="pagamento.valorPago"></label>
              <label><span class="bo-label">Observação</span><input class="bo-field" name="pgObs" [(ngModel)]="pagamento.observacao"></label>
              <div class="flex items-end"><button type="button" class="bo-btn w-full" [disabled]="ocupado || !selecionadas.size || !pagamento.pagoEm" (click)="registrarPagamento()">Registrar</button></div>
            </section>
            <section class="bo-card flex flex-wrap items-end gap-3 p-5">
              <label><span class="bo-label">Gerar cobranças adiantadas até</span><input class="bo-field" type="month" name="ate" [(ngModel)]="adiantarAte"></label>
              <button type="button" class="bo-btn-ghost" [disabled]="ocupado || !adiantarAte" (click)="gerarAdiantadas()">Gerar</button>
            </section>
          } @else { <p class="bo-sub">Carregando...</p> }
        }

        @if (aba === 'historico') {
          <div class="bo-table-wrap">
            <table class="bo-table">
              <thead><tr><th>Quando</th><th>Ação</th><th>Motivo</th><th>Versão</th><th>Por</th></tr></thead>
              <tbody>
                @for (h of historicoRecente(); track h.id) {
                  <tr>
                    <td class="whitespace-nowrap">{{ data(h.criadoEm) }}</td>
                    <td>{{ rotuloAcaoHistorico(h.acao) }}</td>
                    <td>{{ h.motivo || '—' }}</td>
                    <td>v{{ h.versaoDireitos }}</td>
                    <td class="text-neutral-400">{{ h.operadorId ? 'Operador' : 'Sistema' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `
})
export class ContratacaoDetalheComponent implements OnInit {
  private api = inject(CentralApiService);

  readonly id = input.required<string>();
  c: Contratacao | null = null;
  financeiro: Financeiro | null = null;
  planos: Plano[] = [];
  catalogoAdicionais: Adicional[] = [];
  aba: Aba = 'resumo';
  erro = '';
  aviso = '';
  ocupado = false;

  acao: AcaoComMotivo | null = null;
  motivo = '';
  suporte: Suporte | null = null;

  editandoProvisionamento = false;
  prov = { nomeInstancia: '', slugInstancia: '', adminNome: '', adminEmail: '' };
  editandoAdicionais = false;
  adicionaisForm: { adicionalId: string; quantidade: number }[] = [];
  motivoAdicionais = '';
  trocandoPlano = false;
  troca = { planoId: '', periodicidade: 'MENSAL' as Periodicidade, valor: '', diaVencimento: 10, aPartirDe: hojeIso(), motivo: '' };

  selecionadas = new Set<string>();
  pagamento = { pagoEm: hojeIso(), formaPagamento: 'PIX' as FormaPagamento, valorPago: '', observacao: '' };
  adiantarAte = '';
  readonly formas = FORMAS_PAGAMENTO;

  readonly data = data;
  readonly dinheiro = dinheiro;
  readonly rotuloSituacao = rotuloSituacao;
  readonly tomSituacao = tomSituacao;
  readonly rotuloProvisionamento = rotuloProvisionamento;
  readonly tomProvisionamento = tomProvisionamento;
  readonly rotuloPeriodicidade = rotuloPeriodicidade;
  readonly rotuloStatusCobranca = rotuloStatusCobranca;
  readonly tomCobranca = tomCobranca;
  readonly rotuloFormaPagamento = rotuloFormaPagamento;
  readonly rotuloAcaoHistorico = rotuloAcaoHistorico;
  readonly podeTentarNovamente = podeTentarNovamente;
  readonly podeEditarProvisionamento = podeEditarProvisionamento;
  readonly podeBloquear = podeBloquear;
  readonly podeDesbloquear = podeDesbloquear;
  readonly podeCancelar = podeCancelar;
  readonly podeEntrarEmSuporte = podeEntrarEmSuporte;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.contratacao(this.id()).subscribe({
      next: c => this.c = c,
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar a contratação.')
    });
  }

  limites(): { chave: string; valor: number }[] {
    return Object.entries(this.c?.direitos.limites ?? {}).map(([chave, valor]) => ({ chave, valor }));
  }

  historicoRecente() {
    return [...(this.c?.historico ?? [])].reverse();
  }

  // ---- Provisionamento

  tentarNovamente(): void {
    this.executar(this.api.tentarProvisionamento(this.id()), 'Provisionamento reenviado.');
  }

  abrirEdicaoProvisionamento(): void {
    if (!this.c) return;
    this.prov = { nomeInstancia: this.c.nomeInstancia, slugInstancia: this.c.slugInstancia, adminNome: this.c.adminNome, adminEmail: this.c.adminEmail };
    this.editandoProvisionamento = true;
  }

  salvarProvisionamento(): void {
    this.ocupado = true;
    this.limparMensagens();
    this.api.atualizarProvisionamento(this.id(), montarProvisionamentoRequest(this.prov)).subscribe({
      next: c => { this.c = c; this.ocupado = false; this.editandoProvisionamento = false; this.aviso = 'Dados salvos; o envio ao aplicativo sai em até um minuto.'; },
      error: e => {
        this.ocupado = false;
        this.erro = mensagemApi(e, 'Não foi possível salvar.');
        if (codigoApi(e) === 'PROVISIONAMENTO_NAO_EDITAVEL') {
          this.editandoProvisionamento = false;
          this.carregar();
        }
      }
    });
  }

  // ---- Adicionais e plano

  abrirAdicionais(): void {
    if (!this.c) return;
    this.adicionaisForm = this.c.adicionais.map(a => ({ adicionalId: a.adicionalId, quantidade: a.quantidade }));
    this.motivoAdicionais = '';
    this.api.adicionais(this.c.produtoId).subscribe({ next: l => this.catalogoAdicionais = l });
    this.editandoAdicionais = true;
  }

  salvarAdicionais(): void {
    this.executar(this.api.substituirAdicionais(this.id(), adicionaisValidos(this.adicionaisForm), textoOuNulo(this.motivoAdicionais)),
      'Adicionais alterados.', () => this.editandoAdicionais = false);
  }

  abrirTrocaDePlano(): void {
    if (!this.c) return;
    this.troca = { planoId: this.c.planoId, periodicidade: this.c.periodicidade, valor: '', diaVencimento: this.c.diaVencimento, aPartirDe: hojeIso(), motivo: '' };
    this.api.planos(this.c.produtoId).subscribe({ next: l => this.planos = l.filter(p => p.ativo || p.id === this.c?.planoId) });
    this.trocandoPlano = true;
  }

  salvarTrocaDePlano(): void {
    this.executar(this.api.alterarPlano(this.id(), montarTrocaDePlano(this.troca)), 'Plano trocado.', () => {
      this.trocandoPlano = false;
      this.financeiro = null;
    });
  }

  // ---- Ações com motivo

  pedir(acao: AcaoComMotivo): void {
    this.acao = acao;
    this.motivo = '';
  }

  motivoObrigatorio(): boolean {
    return this.acao === 'bloquear' || this.acao === 'suporte';
  }

  tituloAcao(): string {
    return {
      bloquear: 'Bloquear o acesso da instância',
      desbloquear: 'Desbloquear',
      cancelar: 'Cancelar a contratação (encerra o contrato e bloqueia o acesso)',
      suporte: 'Motivo do suporte (fica na auditoria do aplicativo)'
    }[this.acao ?? 'bloquear'];
  }

  confirmar(): void {
    const motivo = this.motivo.trim();
    switch (this.acao) {
      case 'bloquear':
        this.executar(this.api.bloquear(this.id(), motivo), 'Contratação bloqueada. O aplicativo recebe o aviso em até um minuto.');
        break;
      case 'desbloquear':
        this.executar(this.api.desbloquear(this.id(), textoOuNulo(motivo)), 'Contratação desbloqueada.');
        break;
      case 'cancelar':
        this.executar(this.api.cancelar(this.id(), textoOuNulo(motivo)), 'Contratação cancelada.');
        break;
      case 'suporte':
        this.entrarEmSuporte(motivo);
        break;
    }
  }

  /**
   * A aba abre já no clique (senão o navegador bloqueia o pop-up depois da
   * resposta assíncrona) e recebe a URL quando o código chega.
   */
  private entrarEmSuporte(motivo: string): void {
    const aba = window.open('about:blank', '_blank');
    this.ocupado = true;
    this.limparMensagens();
    this.api.suporte(this.id(), motivo).subscribe({
      next: s => {
        this.ocupado = false;
        this.acao = null;
        this.suporte = s;
        if (aba) {
          aba.opener = null;
          aba.location.href = s.urlAcesso;
        }
      },
      error: e => {
        this.ocupado = false;
        aba?.close();
        this.erro = mensagemApi(e, 'Não foi possível pedir o código de suporte.');
      }
    });
  }

  // ---- Financeiro

  abrirFinanceiro(): void {
    this.aba = 'financeiro';
    if (!this.financeiro) this.carregarFinanceiro();
  }

  carregarFinanceiro(): void {
    this.api.financeiro(this.id()).subscribe({
      next: f => { this.financeiro = f; this.selecionadas.clear(); },
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar o financeiro.')
    });
  }

  cobrancasOrdenadas() {
    return porVencimento(this.financeiro?.cobrancas ?? []);
  }

  alternar(id: string): void {
    if (this.selecionadas.has(id)) this.selecionadas.delete(id);
    else this.selecionadas.add(id);
  }

  registrarPagamento(): void {
    const corpo = montarPagamento({ ...this.pagamento, cobrancaIds: [...this.selecionadas] });
    this.executarFinanceiro(this.api.registrarPagamento(this.id(), corpo), 'Pagamento registrado.');
  }

  estornar(cobrancaId: string): void {
    this.executarFinanceiro(this.api.estornar(this.id(), cobrancaId), 'Pagamento estornado.');
  }

  isentar(cobrancaId: string): void {
    this.executarFinanceiro(this.api.isentar(this.id(), cobrancaId, null), 'Cobrança isenta.');
  }

  gerarAdiantadas(): void {
    this.executarFinanceiro(this.api.gerarAdiantadas(this.id(), this.adiantarAte), 'Cobranças geradas.');
  }

  // ---- Apoio

  private executar(chamada: import('rxjs').Observable<Contratacao>, sucesso: string, depois?: () => void): void {
    this.ocupado = true;
    this.limparMensagens();
    chamada.subscribe({
      next: c => { this.c = c; this.ocupado = false; this.acao = null; this.aviso = sucesso; depois?.(); },
      error: e => { this.ocupado = false; this.erro = mensagemApi(e, 'Não foi possível concluir.'); }
    });
  }

  private executarFinanceiro(chamada: import('rxjs').Observable<Financeiro>, sucesso: string): void {
    this.ocupado = true;
    this.limparMensagens();
    chamada.subscribe({
      next: f => {
        this.financeiro = f;
        this.selecionadas.clear();
        this.ocupado = false;
        this.aviso = sucesso;
        this.carregar();
      },
      error: e => { this.ocupado = false; this.erro = mensagemApi(e, 'Não foi possível concluir.'); }
    });
  }

  private limparMensagens(): void {
    this.erro = '';
    this.aviso = '';
  }
}
