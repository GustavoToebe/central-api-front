import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { iniciais } from '../../features/comum/rotulos';

interface ItemMenu {
  rotulo: string;
  url: string;
  icone: 'clientes' | 'contratos' | 'cobrancas' | 'logs' | 'produto' | 'recurso' | 'plano' | 'adicional';
}

/** Moldura do painel: barra preta com filete vermelho e menu lateral (backoffice antigo do Servire). */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="bo min-h-screen">
      <header class="bo-top fixed inset-x-0 top-0 z-40 flex items-center gap-3 px-4">
        <button class="rounded-lg p-2 text-neutral-300 hover:bg-white/5 lg:hidden" (click)="menuAberto = !menuAberto" aria-label="Abrir menu">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
        <a routerLink="/clientes" class="flex items-center gap-2 font-extrabold tracking-tight">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e10600] text-sm text-white">C</span>
          <span>CENTRAL</span>
        </a>
        <span class="hidden text-xs font-medium text-neutral-500 sm:block">Gestão comercial dos aplicativos</span>
        <div class="ml-auto flex items-center gap-3">
          <div class="hidden text-right leading-tight sm:block">
            <div class="text-sm font-semibold">{{ operadorNome }}</div>
            <div class="text-[11px] text-neutral-500">{{ operadorEmail }}</div>
          </div>
          <div class="bo-avatar h-9 w-9 text-xs ring-2 ring-[#e10600]">{{ marca }}</div>
        </div>
      </header>

      <aside class="bo-rail fixed bottom-0 left-0 top-14 z-30 flex flex-col gap-1 p-3 transition-transform lg:translate-x-0"
        [class.-translate-x-full]="!menuAberto" [class.translate-x-0]="menuAberto">
        @for (grupo of grupos; track grupo.titulo) {
          <div class="px-3 pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">{{ grupo.titulo }}</div>
          @for (item of grupo.itens; track item.url) {
            <a [routerLink]="item.url" routerLinkActive="active" (click)="menuAberto = false"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold">
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                @switch (item.icone) {
                  @case ('clientes') { <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="8" r="3"/><path d="M20 19v-1a3.5 3.5 0 0 0-2.5-3.35"/><path d="M16.5 5.1a3 3 0 0 1 0 5.8"/> }
                  @case ('contratos') { <path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h6"/> }
                  @case ('cobrancas') { <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M15 15h3"/> }
                  @case ('logs') { <path d="M12 3l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/> }
                  @case ('produto') { <rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/> }
                  @case ('recurso') { <path d="M4 7h16M4 12h10M4 17h6"/> }
                  @case ('plano') { <rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/> }
                  @case ('adicional') { <circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/> }
                }
              </svg>
              <span>{{ item.rotulo }}</span>
            </a>
          }
        }
        <button class="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-400 hover:bg-[#161616] hover:text-white" (click)="sair()">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/><path d="M13 16l4-4-4-4"/><path d="M17 12H9"/></svg>
          Sair
        </button>
      </aside>

      @if (menuAberto) {
        <div class="fixed inset-0 z-20 bg-black/60 lg:hidden" (click)="menuAberto = false"></div>
      }
      <main class="bo-main"><router-outlet /></main>
    </div>
  `
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuAberto = false;
  operadorNome = this.auth.operador()?.nome ?? 'Operador';
  operadorEmail = this.auth.operador()?.email ?? '';
  marca = iniciais(this.operadorNome);

  grupos: { titulo: string; itens: ItemMenu[] }[] = [
    {
      titulo: 'Comercial',
      itens: [
        { rotulo: 'Clientes', url: '/clientes', icone: 'clientes' },
        { rotulo: 'Contratações', url: '/contratacoes', icone: 'contratos' },
        { rotulo: 'Cobranças', url: '/cobrancas', icone: 'cobrancas' },
        { rotulo: 'Logs', url: '/logs', icone: 'logs' }
      ]
    },
    {
      titulo: 'Catálogo',
      itens: [
        { rotulo: 'Produtos', url: '/catalogo/produtos', icone: 'produto' },
        { rotulo: 'Recursos', url: '/catalogo/recursos', icone: 'recurso' },
        { rotulo: 'Planos e preços', url: '/catalogo/planos', icone: 'plano' },
        { rotulo: 'Adicionais', url: '/catalogo/adicionais', icone: 'adicional' }
      ]
    }
  ];

  async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
