import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';
import { ConfirmacaoNavegacaoService } from './core/guards/confirmacao-navegacao.service';
import { ModalComponent } from './features/comum/modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent],
  template: `<router-outlet />
    <app-modal [aberto]="navegacao.aberto()" titulo="Alterações não salvas" tamanho="sm"
      [fecharNoFundo]="false" (fechar)="navegacao.responder(false)">
      <p>Você alterou esta página e ainda não salvou. Deseja sair e descartar as alterações?</p>
      <div rodape class="flex justify-between gap-3">
        <button type="button" class="bo-btn-ghost" (click)="navegacao.responder(false)">Continuar editando</button>
        <button type="button" class="bo-btn-danger" (click)="navegacao.responder(true)">Descartar e sair</button>
      </div>
    </app-modal>`
})
export class AppComponent {
  // Inicializa o serviço de temas e aplica variáveis CSS logo no carregamento
  private readonly tema = inject(ThemeService);
  readonly navegacao = inject(ConfirmacaoNavegacaoService);

  @HostListener('window:beforeunload', ['$event'])
  antesDeFechar(evento: BeforeUnloadEvent): void { this.navegacao.antesDeFechar(evento); }
}
