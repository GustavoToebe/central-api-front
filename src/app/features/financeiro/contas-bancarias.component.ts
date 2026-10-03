import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent, FiltroAtivo } from '../comum/barra-filtros.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import { CampoDataComponent } from '../comum/campo-data.component';
import { ModalComponent } from '../comum/modal.component';
import { RodapeFormComponent } from '../comum/rodape-form.component';
import { FinanceiroApiService } from './financeiro-api.service';
import { Conta } from './financeiro.models';

function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

type Situacao = 'ATIVA' | 'INATIVA' | '';

/** Cadastro do caixa e das contas bancárias da Central. É daqui que saem as contas escolhidas nos lançamentos do Financeiro. */
@Component({
  selector: 'app-contas-bancarias', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CabecalhoPaginaComponent, BarraFiltrosComponent, EstadoListaComponent, CampoDataComponent, ModalComponent, RodapeFormComponent],
  template: `
<div class="space-y-5">
  <app-cabecalho-pagina titulo="Contas bancárias" subtitulo="O caixa e as contas bancárias da Central, com o saldo inicial de cada uma.">
    <button acoes class="bo-btn" (click)="abrir()" data-nova-conta>Nova conta</button>
  </app-cabecalho-pagina>
  @if (erro) { <div class="bo-card p-4 text-rose-400" role="alert">{{ erro }} <button class="bo-btn-ghost ml-3" (click)="carregar()">Tentar novamente</button></div> }
  <section class="bo-card p-4 space-y-4">
    <app-barra-filtros placeholder="Pesquisar conta" [(termo)]="busca" (buscar)="aplicar()" [temFiltros]="true"
      [filtrosAtivos]="filtrosAtivos()" (removerFiltro)="remover($event)" (removerTodos)="remover()">
      <div><label class="bo-label" for="situacaoConta">Situação</label>
        <select id="situacaoConta" class="bo-field" [(ngModel)]="situacao" (ngModelChange)="aplicar()"><option value="ATIVA">Ativas</option><option value="INATIVA">Inativas</option><option value="">Todas</option></select></div>
    </app-barra-filtros>
    <div class="bo-table-rolagem"><table class="bo-table" data-contas>
      <thead><tr><th>Conta / banco</th><th>Saldo inicial</th><th>Data inicial</th><th>Situação</th><th>Ações</th></tr></thead>
      <tbody>
        @for (c of visiveis(); track c.id) {
          <tr><td>{{ c.nome }}</td><td>{{ c.saldoInicial | currency:'BRL' }}</td><td>{{ c.dataSaldoInicial | date:'dd/MM/yyyy':'UTC' }}</td>
            <td>{{ c.ativo ? 'Ativa' : 'Inativa' }}</td>
            <td><button class="bo-btn-ghost" (click)="abrir(c)">Editar</button></td></tr>
        }
      </tbody></table></div>
    <app-estado-lista [carregando]="carregando" [vazio]="!visiveis().length" mensagemVazio="Nenhuma conta encontrada, tente outros filtros." />
  </section>
</div>
@if (modal) {
<app-modal [aberto]="true" [titulo]="editandoId ? 'Editar conta' : 'Nova conta'" (fechar)="fechar()">
  <form #formulario="ngForm" (ngSubmit)="salvar(formulario)">
    <section class="secao-form space-y-3">
      <div><label class="bo-label" for="nomeConta">Nome da conta / banco</label><input id="nomeConta" name="nome" class="bo-field" [(ngModel)]="form.nome" required maxlength="120" /></div>
      <div><label class="bo-label" for="saldoInicial">Saldo inicial (R$)</label><input id="saldoInicial" name="saldoInicial" class="bo-field" type="number" inputmode="decimal" step="0.01" min="-999999999999.99" max="999999999999.99" [(ngModel)]="form.saldoInicial" required /></div>
      <div><label class="bo-label" for="dataSaldo">Data do saldo inicial</label><app-campo-data idCampo="dataSaldo" name="dataSaldo" [(ngModel)]="form.dataSaldoInicial" [max]="hoje" required /></div>
      <p class="text-xs text-neutral-400">Informe o saldo antes das primeiras baixas. Saldo e data inicial ficam protegidos depois do primeiro lançamento.</p>
      <label class="flex gap-2"><input type="checkbox" name="ativo" [(ngModel)]="form.ativo" /> Conta ativa</label>
    </section>
    <app-rodape-form [carregando]="salvando" rotuloSalvar="Salvar" (cancelar)="fechar()" />
  </form>
</app-modal>
}
@if (confirmacao) {
  <app-modal [aberto]="true" titulo="Confirmar ação" tamanho="sm" [fecharNoFundo]="false" (fechar)="responder(false)">
    <p>{{ confirmacao }}</p>
    <div rodape class="flex justify-between gap-3">
      <button type="button" class="bo-btn-ghost" (click)="responder(false)">Voltar</button>
      <button type="button" class="bo-btn-danger" (click)="responder(true)">Descartar</button>
    </div>
  </app-modal>
}
@if (aviso) {
  <app-modal [aberto]="true" titulo="Não foi possível concluir" tamanho="sm" (fechar)="aviso = ''">
    <p role="alert">{{ aviso }}</p><button rodape type="button" class="bo-btn" (click)="aviso = ''">Entendi</button>
  </app-modal>
}`
})
export class ContasBancariasComponent implements OnInit {
  private readonly api = inject(FinanceiroApiService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('formulario') formulario?: NgForm;
  readonly hoje = hojeLocal();
  contas: Conta[] = [];
  /** O que está aplicado na lista (só muda ao buscar); `busca` e `situacao` são o que está digitado. */
  private aplicado = { texto: '', situacao: 'ATIVA' as Situacao };
  busca = ''; situacao: Situacao = 'ATIVA';
  carregando = false; salvando = false; erro = '';
  modal = false; editandoId: string | null = null;
  form: Omit<Conta, 'id'> = this.novo();
  confirmacao = ''; aviso = '';
  private responderConfirmacao?: (v: boolean) => void;

  ngOnInit() { void this.carregar(); }
  hasPendingChanges() { return this.salvando || (this.modal && !!this.formulario?.dirty); }
  private novo(): Omit<Conta, 'id'> { return { nome: '', saldoInicial: 0, dataSaldoInicial: this.hoje, ativo: true }; }

  async carregar() {
    this.carregando = true; this.erro = ''; this.cd.markForCheck();
    try { this.contas = await this.api.contas(); }
    catch (e) { this.contas = []; this.erro = (e as Error).message; }
    finally { this.carregando = false; this.cd.markForCheck(); }
  }

  aplicar() { this.aplicado = { texto: this.busca, situacao: this.situacao }; this.cd.markForCheck(); }
  remover(chave?: string) {
    if (!chave || chave === 'texto') this.busca = '';
    if (!chave || chave === 'situacao') this.situacao = '';
    this.aplicar();
  }

  filtrosAtivos(): FiltroAtivo[] {
    const lista: FiltroAtivo[] = [];
    if (this.aplicado.situacao) lista.push({ chave: 'situacao', rotulo: `Situação: ${this.aplicado.situacao === 'ATIVA' ? 'Ativa' : 'Inativa'}` });
    if (this.aplicado.texto.trim()) lista.push({ chave: 'texto', rotulo: `Busca: ${this.aplicado.texto.trim()}` });
    return lista;
  }

  visiveis(): Conta[] {
    const sem = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const t = sem(this.aplicado.texto);
    return this.contas.filter(c => (!this.aplicado.situacao || c.ativo === (this.aplicado.situacao === 'ATIVA')) && (!t || sem(c.nome).includes(t)));
  }

  abrir(c?: Conta) {
    this.editandoId = c?.id ?? null;
    this.form = c ? { nome: c.nome, saldoInicial: c.saldoInicial, dataSaldoInicial: c.dataSaldoInicial, ativo: c.ativo } : this.novo();
    this.modal = true; this.cd.markForCheck();
  }

  responder(valor: boolean) { const r = this.responderConfirmacao; this.responderConfirmacao = undefined; this.confirmacao = ''; r?.(valor); this.cd.markForCheck(); }

  async fechar() {
    if (this.salvando || this.confirmacao || this.aviso) return;
    if (this.formulario?.dirty) {
      const descartar = await new Promise<boolean>(resolve => { this.confirmacao = 'Descartar as alterações ainda não salvas?'; this.responderConfirmacao = resolve; this.cd.markForCheck(); });
      if (!descartar) return;
    }
    this.modal = false; this.cd.markForCheck();
  }

  async salvar(form: NgForm) {
    if (this.salvando) return;
    if (form.invalid) { form.control.markAllAsTouched(); this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')?.focus(); return; }
    this.salvando = true;
    try { await this.api.salvarConta(this.editandoId, this.form); this.modal = false; await this.carregar(); }
    catch (e) { this.aviso = (e as Error).message; }
    finally { this.salvando = false; this.cd.markForCheck(); }
  }
}
