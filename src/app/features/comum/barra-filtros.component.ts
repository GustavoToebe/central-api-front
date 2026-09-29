import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit,
  ViewChild, inject, input, model, output, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Item do menu Opções. */
export interface OpcaoMenu {
  id: string;
  rotulo: string;
  desabilitada?: boolean;
  dica?: string;
}

/** Filtro ativo exibido como chip. */
export interface FiltroAtivo {
  chave: string;
  rotulo: string;
}

/**
 * Barra de filtros padrão (PLANO-002): campo de busca + menu Opções + botão Buscar/Cancelar.
 * Painel de filtros avançados abre com a seta; chips de filtros ativos abaixo.
 */
@Component({
  selector: 'app-barra-filtros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-3">
      <!-- Linha principal -->
      <div class="flex items-center gap-2">
        @if (!semBusca()) {
          <input class="bo-field flex-1"
            [placeholder]="placeholder()"
            [ngModel]="termo()"
            (ngModelChange)="termo.set($event)"
            (keydown.enter)="emitirBuscar()"
            data-busca />
        }

        @if (opcoes().length) {
          <div class="relative">
            <button type="button" class="bo-btn-ghost" (click)="alternarOpcoes()" data-opcoes
              aria-haspopup="true" [attr.aria-expanded]="menuAberto()">
              Opções ⋮
            </button>
            @if (menuAberto()) {
              <div #painelOpcoes
                class="absolute right-0 top-full z-50 mt-1 min-w-[220px] space-y-1 rounded-xl border border-[#333] bg-black p-2 shadow-2xl"
                role="menu">
                @for (op of opcoes(); track op.id) {
                  <button type="button" role="menuitem"
                    class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#1a1a1a]"
                    [class.opacity-40]="op.desabilitada"
                    [class.cursor-not-allowed]="op.desabilitada"
                    [title]="op.dica ?? ''"
                    [attr.data-opcao]="op.id"
                    (click)="selecionarOpcao(op)">
                    {{ op.rotulo }}
                  </button>
                }
              </div>
            }
          </div>
        }

        <div class="flex">
          @if (painelAberto()) {
            <button type="button" class="bo-btn-ghost" [class.rounded-r-none]="temFiltros()" (click)="painelAberto.set(false)" data-buscar>Cancelar</button>
          } @else {
            <button type="button" class="bo-btn" [class.rounded-r-none]="temFiltros()" (click)="emitirBuscar()" data-buscar>Buscar</button>
          }
          @if (temFiltros()) {
            <button type="button" class="border-l border-black/30 !px-3" [class]="painelAberto() ? 'bo-btn-ghost rounded-l-none' : 'bo-btn rounded-l-none'"
              (click)="alternarPainel()" data-alternar-filtros [attr.aria-expanded]="painelAberto()" aria-label="Filtros avançados">
              {{ painelAberto() ? '▴' : '▾' }}
            </button>
          }
        </div>
      </div>

      <!-- Painel de filtros avançados -->
      @if (painelAberto()) {
        <div class="bo-card p-4">
          <div class="grid gap-3 md:grid-cols-12">
            <ng-content />
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="bo-btn" (click)="buscarDoPanel()" data-buscar-painel>
              Buscar
            </button>
          </div>
        </div>
      }

      <!-- Filtros ativos -->
      @if (filtrosAtivos().length) {
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-neutral-400">Filtrado por:</span>
          @for (f of filtrosAtivos(); track f.chave) {
            <span class="bo-chip text-neutral-300">
              {{ f.rotulo }}
              <button type="button" class="ml-1 opacity-60 hover:opacity-100"
                [attr.data-remover-filtro]="f.chave"
                (click)="removerFiltro.emit(f.chave)">×</button>
            </span>
          }
          <button type="button" class="bo-link" (click)="removerTodos.emit()" data-remover-filtros>
            Remover filtros
          </button>
        </div>
      }
    </div>
  `
})
export class BarraFiltrosComponent implements OnDestroy {
  readonly termo = model<string>('');
  readonly placeholder = input<string>('Buscar…');
  readonly semBusca = input<boolean>(false);
  readonly temFiltros = input<boolean>(true);
  readonly opcoes = input<OpcaoMenu[]>([]);
  readonly filtrosAtivos = input<FiltroAtivo[]>([]);

  readonly buscar = output<void>();
  readonly opcao = output<string>();
  readonly removerFiltro = output<string>();
  readonly removerTodos = output<void>();

  readonly painelAberto = signal(false);
  readonly menuAberto = signal(false);

  private readonly onDocClick = (e: MouseEvent) => {
    const el = e.target as Node;
    if (!this._host.nativeElement.contains(el)) { this.menuAberto.set(false); this.removerListeners(); }
  };

  private readonly onDocKeyEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { this.menuAberto.set(false); this.removerListeners(); }
  };

  private _host = inject(ElementRef<HTMLElement>);

  alternarPainel(): void {
    this.painelAberto.update(v => !v);
  }

  alternarOpcoes(): void {
    const abrindo = !this.menuAberto();
    this.menuAberto.set(abrindo);
    if (abrindo) {
      document.addEventListener('mousedown', this.onDocClick);
      document.addEventListener('keydown', this.onDocKeyEsc);
    } else {
      this.removerListeners();
    }
  }

  private removerListeners(): void {
    document.removeEventListener('mousedown', this.onDocClick);
    document.removeEventListener('keydown', this.onDocKeyEsc);
  }

  selecionarOpcao(op: OpcaoMenu): void {
    if (op.desabilitada) return;
    this.menuAberto.set(false);
    this.removerListeners();
    this.opcao.emit(op.id);
  }

  emitirBuscar(): void {
    this.buscar.emit();
  }

  buscarDoPanel(): void {
    this.painelAberto.set(false);
    this.buscar.emit();
  }

  ngOnDestroy(): void {
    this.removerListeners();
  }
}
