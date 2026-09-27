import { Component, input, model, output, signal } from '@angular/core';
import { CalendarioComponent } from './calendario.component';
import { PERIODOS_PRONTOS, PeriodoPronto, dataBr, dataDeBr, intervaloDo, mascararData, prontoDe } from './datas';
import { PainelFlutuante } from './painel-flutuante';

/**
 * Filtro por período (teste de telas de 27/09/2026): períodos prontos (hoje,
 * 7 dias, este mês, mês passado, este ano, ano passado) ou data inicial e
 * final no calendário. Só aplica no OK; "Limpar" tira o filtro.
 * `de`/`ate` em ISO; `aplicado` avisa a tela para buscar de novo.
 */
@Component({
  selector: 'app-periodo',
  imports: [CalendarioComponent],
  template: `
    <div class="relative" data-ancora>
      <button type="button" class="bo-field flex items-center gap-2 pr-16 text-left" [id]="idCampo()" (click)="alternar()">
        <span class="min-w-0 flex-1 truncate" [class.text-neutral-500]="!de() && !ate()">{{ resumo() }}</span>
      </button>
      @if (de() || ate()) {
        <button type="button" class="bo-campo-x right-9" aria-label="Limpar período" (click)="limpar(); $event.stopPropagation()">✕</button>
      }
      <span class="bo-campo-icone pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
        </svg>
      </span>
    </div>
    @if (aberto()) {
      <div #painel class="bo-flutuante w-[320px] space-y-3" role="dialog" aria-label="Selecione um período"
        [style.left.px]="posicao().left" [style.top.px]="posicao().top" [style.bottom.px]="posicao().bottom">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold">Selecione um período</span>
          <button type="button" class="bo-cal-nav" aria-label="Fechar" (click)="fechar()">✕</button>
        </div>
        <select class="bo-field" aria-label="Período de consulta" (change)="escolherPronto($any($event.target).value)">
          <option value="" [selected]="!pronto()">Período de consulta</option>
          @for (p of prontos; track p.valor) { <option [value]="p.valor" [selected]="pronto() === p.valor">{{ p.rotulo }}</option> }
        </select>
        <div class="grid grid-cols-2 gap-2">
          <input class="bo-field" aria-label="Data inicial" placeholder="Data inicial" inputmode="numeric" maxlength="10"
            [class.ring-2]="editando() === 'de'" [class.ring-red-600]="editando() === 'de'"
            [value]="textoDe()" (focus)="editando.set('de')" (input)="digitar('de', $any($event.target))">
          <input class="bo-field" aria-label="Data final" placeholder="Data final" inputmode="numeric" maxlength="10"
            [class.ring-2]="editando() === 'ate'" [class.ring-red-600]="editando() === 'ate'"
            [value]="textoAte()" (focus)="editando.set('ate')" (input)="digitar('ate', $any($event.target))">
        </div>
        <app-calendario [inicio]="rascunhoDe()" [fim]="rascunhoAte()" [foco]="editando() === 'de' ? rascunhoDe() : (rascunhoAte() || rascunhoDe())"
          (escolher)="escolherDia($event)" />
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="bo-btn-ghost" (click)="limpar()">Limpar</button>
          <button type="button" class="bo-btn" (click)="aplicar()">OK</button>
        </div>
      </div>
    }
  `
})
export class PeriodoComponent extends PainelFlutuante {
  readonly de = model('');
  readonly ate = model('');
  readonly placeholder = input('Todo o período');
  readonly idCampo = input<string | null>(null);
  readonly aplicado = output<void>();

  protected readonly alturaPainel = 470;
  protected override readonly larguraPainel = 320;
  readonly prontos = PERIODOS_PRONTOS;
  readonly rascunhoDe = signal('');
  readonly rascunhoAte = signal('');
  readonly textoDe = signal('');
  readonly textoAte = signal('');
  readonly pronto = signal<PeriodoPronto | ''>('');
  readonly editando = signal<'de' | 'ate'>('de');

  resumo(): string {
    const [de, ate] = [this.de(), this.ate()];
    if (!de && !ate) return this.placeholder();
    const nome = PERIODOS_PRONTOS.find(p => p.valor === prontoDe(de, ate))?.rotulo;
    const datas = de && ate ? (de === ate ? dataBr(de) : `${dataBr(de)} a ${dataBr(ate)}`)
      : de ? `A partir de ${dataBr(de)}` : `Até ${dataBr(ate)}`;
    return nome ? `${nome} (${datas})` : datas;
  }

  protected override aoAbrir(): void {
    this.definirRascunho(this.de(), this.ate());
    this.editando.set('de');
  }

  escolherPronto(valor: PeriodoPronto | ''): void {
    if (!valor) return this.pronto.set('');
    const { de, ate } = intervaloDo(valor);
    this.definirRascunho(de, ate);
  }

  /** Primeiro clique marca o início, o segundo o fim (trocados se ficarem ao contrário). */
  escolherDia(iso: string): void {
    if (this.editando() === 'de') {
      const ate = this.rascunhoAte() && this.rascunhoAte() < iso ? '' : this.rascunhoAte();
      this.definirRascunho(iso, ate);
      this.editando.set('ate');
    } else if (this.rascunhoDe() && iso < this.rascunhoDe()) {
      this.definirRascunho(iso, this.rascunhoDe());
    } else {
      this.definirRascunho(this.rascunhoDe(), iso);
    }
  }

  digitar(qual: 'de' | 'ate', campo: HTMLInputElement): void {
    const texto = mascararData(campo.value, [2, 2, 4]);
    campo.value = texto;
    (qual === 'de' ? this.textoDe : this.textoAte).set(texto);
    const iso = texto ? dataDeBr(texto) : '';
    if (iso === null) return;
    (qual === 'de' ? this.rascunhoDe : this.rascunhoAte).set(iso);
    this.pronto.set(prontoDe(this.rascunhoDe(), this.rascunhoAte()));
  }

  aplicar(): void {
    let [de, ate] = [this.rascunhoDe(), this.rascunhoAte()];
    if (de && ate && ate < de) [de, ate] = [ate, de];
    this.de.set(de);
    this.ate.set(ate);
    this.fechar();
    this.aplicado.emit();
  }

  limpar(): void {
    this.definirRascunho('', '');
    this.aplicar();
  }

  private definirRascunho(de: string, ate: string): void {
    this.rascunhoDe.set(de);
    this.rascunhoAte.set(ate);
    this.textoDe.set(dataBr(de));
    this.textoAte.set(dataBr(ate));
    this.pronto.set(prontoDe(de, ate));
  }
}
