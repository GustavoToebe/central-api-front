import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { iniciais } from '../../features/comum/rotulos';

interface ItemMenu {
  rotulo: string;
  url: string;
  icone: 'clientes' | 'contratos' | 'cobrancas' | 'logs' | 'produto' | 'recurso' | 'plano' | 'adicional' | 'ajustes';
}

const CHAVE_RECOLHIDO = 'central.menuRecolhido';

function ehDesktop(): boolean {
  return typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 1024px)').matches;
}

function lerRecolhido(): boolean {
  try { return localStorage.getItem(CHAVE_RECOLHIDO) === 'true'; } catch { return false; }
}

function gravarRecolhido(v: boolean): void {
  try { if (v) localStorage.setItem(CHAVE_RECOLHIDO, 'true'); else localStorage.removeItem(CHAVE_RECOLHIDO); } catch { /* noop */ }
}

/** Moldura do painel: barra preta com filete da marca e menu lateral. */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="bo min-h-screen">
      <header class="bo-top fixed inset-x-0 top-0 z-40 flex items-center gap-3 px-4 backdrop-blur-md">
        <button class="rounded-lg p-2 text-neutral-300 hover:bg-white/5 lg:hidden" (click)="menuAberto = !menuAberto" aria-label="Abrir menu">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
        <a routerLink="/clientes" class="flex items-center gap-2 font-extrabold tracking-tight">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white shadow-xs" [style.background]="'var(--brand)'">C</span>
          <span class="text-white tracking-wider">CENTRAL</span>
        </a>
        <span class="hidden text-xs font-medium text-neutral-400 sm:block">Gestão comercial dos aplicativos</span>
        
        <div class="ml-auto flex items-center gap-2">
          <a routerLink="/ajustes" class="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition" title="Ajustes visuais">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span class="hidden sm:inline">Ajustes</span>
          </a>
          <a routerLink="/meu-perfil" class="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-white/5 transition" title="Meu perfil">
            <div class="hidden text-right leading-tight sm:block">
              <div class="text-sm font-semibold text-white">{{ operadorNome }}</div>
              <div class="text-[11px] text-neutral-400">{{ operadorEmail }}</div>
            </div>
            <div class="bo-avatar h-9 w-9 text-xs ring-2" [style.ring-color]="'var(--brand)'">{{ marca }}</div>
          </a>
        </div>
      </header>

      <aside
        [class.recolhido]="compacto()"
        class="bo-rail fixed bottom-0 left-0 top-14 z-30 flex flex-col gap-1 overflow-hidden lg:translate-x-0"
        [class.-translate-x-full]="!menuAberto" [class.translate-x-0]="menuAberto">
        @for (grupo of grupos; track grupo.titulo) {
          @if (!compacto()) {
            <div class="px-3 pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">{{ grupo.titulo }}</div>
          } @else {
            <div class="pt-3"></div>
          }
          @for (item of grupo.itens; track item.url) {
            <a [routerLink]="item.url" routerLinkActive="active" (click)="menuAberto = false"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
              [title]="compacto() ? item.rotulo : ''">
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
                  @case ('ajustes') { <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/> }
                }
              </svg>
              @if (!compacto()) { <span>{{ item.rotulo }}</span> }
            </a>
          }
        }

        <div class="mt-auto space-y-1">
          <a routerLink="/ajustes" routerLinkActive="active" (click)="menuAberto = false"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            [title]="compacto() ? 'Ajustes visuais' : ''">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            @if (!compacto()) { <span>Ajustes visuais</span> }
          </a>
          <a routerLink="/meu-perfil" routerLinkActive="active" (click)="menuAberto = false"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            [title]="compacto() ? 'Meu perfil' : ''">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>
            @if (!compacto()) { <span>Meu perfil</span> }
          </a>
          <button class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-400 hover:bg-[#161616] hover:text-white transition cursor-pointer"
            [title]="compacto() ? 'Sair' : ''" (click)="sair()">
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/><path d="M13 16l4-4-4-4"/><path d="M17 12H9"/></svg>
            @if (!compacto()) { <span>Sair</span> }
          </button>
        </div>

        <!-- Botão recolher/expandir (só desktop) -->
        <button type="button"
          class="hidden lg:flex items-center justify-center rounded-xl px-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
          [attr.aria-label]="recolhido() ? 'Expandir menu' : 'Recolher menu'"
          data-menu="recolher"
          (click)="alternarRecolhido()">
          {{ recolhido() ? '»' : '«' }}
        </button>
      </aside>

      @if (menuAberto) {
        <div class="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden" (click)="menuAberto = false"></div>
      }

      <main class="bo-main" [class.recolhido]="compacto()"><router-outlet /></main>
    </div>
  `
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  menuAberto = false;

  @HostListener('window:resize')
  aoRedimensionar(): void {
    this.desktop.set(ehDesktop());
  }

  readonly recolhido = signal(lerRecolhido());
  readonly desktop = signal(ehDesktop());
  readonly compacto = computed(() => this.recolhido() && this.desktop());

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

  alternarRecolhido(): void {
    const novo = !this.recolhido();
    this.recolhido.set(novo);
    gravarRecolhido(novo);
  }

  larguraMenu(): number {
    return this.compacto() ? 64 : 220;
  }

  async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
