import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {
  // Inicializa o serviço de temas e aplica variáveis CSS logo no carregamento
  private readonly tema = inject(ThemeService);
}
