import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener,
  OnChanges, ViewChild, input, output
} from '@angular/core';

let _modalIdSeq = 0;

/**
 * Modal padrão (PLANO-002): fundo, borda e cores `bo-*`. Trap de foco, Esc fecha,
 * `fecharNoFundo` controla clique fora. `role="dialog"`, `aria-modal`, `aria-labelledby`.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        (click)="fecharNoFundo() && fechar.emit()">
        <div #painel
          class="bo-card flex w-full flex-col outline-none" tabindex="-1"
          [style.max-width.px]="largura()"
          [style.max-height.vh]="85"
          role="dialog" aria-modal="true" [attr.aria-labelledby]="tituloId"
          (click)="$event.stopPropagation()"
          (keydown)="trapFoco($event)">
          <!-- Cabeçalho -->
          <div class="flex items-center justify-between border-b border-[#262626] px-5 py-4">
            <h2 [id]="tituloId" class="text-lg font-bold">{{ titulo() }}</h2>
            <button type="button" class="bo-campo-icone" style="position:static;transform:none"
              aria-label="Fechar" (click)="fechar.emit()">✕</button>
          </div>
          <!-- Corpo com rolagem -->
          <div class="flex-1 overflow-y-auto p-5">
            <ng-content />
          </div>
          <!-- Rodapé -->
          <div class="border-t border-[#262626] px-5 py-3">
            <ng-content select="[rodape]" />
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent implements OnChanges, AfterViewInit {
  readonly aberto = input(false);
  readonly titulo = input('');
  readonly tamanho = input<'sm' | 'md' | 'lg'>('md');
  readonly fecharNoFundo = input(true);
  readonly fechar = output<void>();

  @ViewChild('painel') painelRef?: ElementRef<HTMLElement>;

  readonly tituloId = `modal-titulo-${++_modalIdSeq}`;
  private _anteriorFoco: HTMLElement | null = null;

  largura(): number {
    return this.tamanho() === 'sm' ? 500 : this.tamanho() === 'lg' ? 800 : 600;
  }

  ngOnChanges(): void {
    if (this.aberto()) {
      this._anteriorFoco = document.activeElement as HTMLElement | null;
      // Foco no painel após render
      setTimeout(() => this.painelRef?.nativeElement.focus(), 0);
    } else if (this._anteriorFoco) {
      this._anteriorFoco.focus();
      this._anteriorFoco = null;
    }
  }

  ngAfterViewInit(): void {
    if (this.aberto() && this.painelRef) {
      this.painelRef.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    if (this.aberto()) this.fechar.emit();
  }

  trapFoco(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const fociveis = this.painelRef?.nativeElement.querySelectorAll<HTMLElement>(
      'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!fociveis?.length) return;
    const primeiro = fociveis[0];
    const ultimo = fociveis[fociveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primeiro.focus();
    }
  }
}
