import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PainelFlutuante } from './painel-flutuante';

export interface OpcaoSelectBusca {
  valor: string;
  rotulo: string;
  detalhe?: string;
}

const MAX_VISIVEIS = 50;

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Select com filtro interno (PLANO-002): substitui `<select>` em listas longas.
 * ControlValueAccessor compatível com `ngModel`; o painel abre no `body` (`PainelFlutuante`).
 */
@Component({
  selector: 'app-select-busca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectBuscaComponent), multi: true }],
  template: `
    <button type="button" data-ancora class="bo-field flex w-full items-center justify-between gap-2 text-left"
      [disabled]="desabilitado()" (click)="alternar()" [attr.aria-expanded]="aberto()">
      <span class="flex-1 truncate" [class.text-neutral-500]="!valorAtual()">{{ rotuloAtual() }}</span>
      <span class="flex shrink-0 items-center gap-2 text-neutral-400">
        @if (limpavel() && valorAtual()) {
          <span role="button" aria-label="Limpar" (click)="$event.stopPropagation(); limpar()">✕</span>
        }
        <span>▾</span>
      </span>
    </button>

    @if (aberto()) {
      <div #painel class="bo-flutuante w-[320px] p-2" role="listbox" aria-label="Selecionar opção"
        [style.left.px]="posicao().left" [style.top.px]="posicao().top" [style.bottom.px]="posicao().bottom">
        <input class="bo-field mb-2" placeholder="Buscar…" data-busca-opcao
          [value]="termo()" (input)="filtrar($any($event.target).value)" (keydown)="aoTeclado($event)" />
        <ul class="max-h-56 space-y-0.5 overflow-y-auto">
          @for (op of visiveis(); track op.valor; let i = $index) {
            <li role="option" [attr.aria-selected]="op.valor === valorAtual()"
              class="flex cursor-pointer flex-col rounded-lg px-3 py-2 text-sm hover:bg-white/5"
              [class.bg-white/10]="i === foco()" [class.text-[#ff4d47]]="op.valor === valorAtual()"
              (mouseenter)="foco.set(i)" (click)="escolher(op)">
              <span>{{ op.rotulo }}</span>
              @if (op.detalhe) { <span class="text-xs text-neutral-500">{{ op.detalhe }}</span> }
            </li>
          } @empty {
            <li class="px-3 py-2 text-xs text-neutral-500">Nenhum resultado.</li>
          }
          @if (filtradas().length > visiveis().length) {
            <li class="px-3 py-2 text-xs text-neutral-500">Refine a busca para ver mais opções.</li>
          }
        </ul>
      </div>
    }
  `
})
export class SelectBuscaComponent extends PainelFlutuante implements ControlValueAccessor {
  readonly opcoes = input<OpcaoSelectBusca[]>([]);
  readonly placeholder = input<string>('Escolha…');
  readonly limpavel = input<boolean>(true);

  protected readonly alturaPainel = 300;
  protected override readonly larguraPainel = 320;

  readonly termo = signal('');
  readonly foco = signal(0);
  readonly valorAtual = signal<string | null>(null);
  readonly desabilitado = signal(false);

  readonly filtradas = computed(() => {
    const t = semAcento(this.termo().trim());
    if (!t) return this.opcoes();
    return this.opcoes().filter(o => semAcento(o.rotulo).includes(t) || semAcento(o.detalhe ?? '').includes(t));
  });
  readonly visiveis = computed(() => this.filtradas().slice(0, MAX_VISIVEIS));
  readonly rotuloAtual = computed(() => {
    const v = this.valorAtual();
    if (!v) return this.placeholder();
    return this.opcoes().find(o => o.valor === v)?.rotulo ?? v;
  });

  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected override aoAbrir(): void {
    this.termo.set('');
    this.foco.set(0);
  }

  override alternar(): void {
    if (!this.desabilitado()) super.alternar();
  }

  filtrar(texto: string): void {
    this.termo.set(texto);
    this.foco.set(0);
  }

  escolher(op: OpcaoSelectBusca): void {
    this.valorAtual.set(op.valor);
    this.onChange(op.valor);
    this.onTouched();
    this.fechar();
  }

  limpar(): void {
    this.valorAtual.set(null);
    this.onChange(null);
    this.onTouched();
  }

  aoTeclado(e: KeyboardEvent): void {
    const lista = this.visiveis();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.foco.update(f => Math.min(f + 1, lista.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.foco.update(f => Math.max(f - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const op = lista[this.foco()];
      if (op) this.escolher(op);
    } else if (e.key === 'Escape') {
      this.fechar();
    }
  }

  writeValue(v: string | null): void { this.valorAtual.set(v ?? null); }
  registerOnChange(fn: (v: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.desabilitado.set(d); }
}
