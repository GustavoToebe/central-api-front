import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { iniciais } from '../../features/comum/rotulos';

interface ItemMenu {
  rotulo: string;
  url: string;
  icone: 'clientes' | 'contratos' | 'cobrancas' | 'logs' | 'produto' | 'recurso' | 'plano' | 'adicional' | 'ajustes' | 'ajuda';
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
      <header class="bo-top fixed inset-x-0 top-0 z-40 flex h-16 md:h-20 items-center justify-between gap-3 px-4 md:px-8 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <button class="rounded-lg p-2 text-neutral-300 hover:bg-white/5 lg:hidden" (click)="menuAberto = !menuAberto" aria-label="Abrir menu">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <a routerLink="/clientes" class="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl text-sm text-white shadow-xs" [style.background]="'var(--brand)'">C</span>
            <span class="text-white tracking-wider text-base">CENTRAL</span>
          </a>
          <span class="hidden text-xs font-medium text-neutral-400 sm:block">Gestão comercial dos aplicativos</span>
        </div>
        
        <div class="relative">
          <button type="button" id="perfil-menu" class="text-right flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-white/5 transition"
            aria-haspopup="menu" [attr.aria-expanded]="usuarioAberto" (click)="usuarioAberto = !usuarioAberto">
            <div class="hidden text-right leading-tight sm:block">
              <div class="text-sm font-semibold text-white">{{ operadorNome }}</div>
              <div class="text-xs text-neutral-400">Suporte</div>
            </div>
            <div class="bo-avatar h-9 w-9 text-xs ring-2" [style.ring-color]="'var(--brand)'">{{ marca }}</div>
            <svg class="h-4 w-4 text-neutral-400 transition-transform duration-200" [class.rotate-180]="usuarioAberto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          @if (usuarioAberto) {
            <div id="perfil-dropdown" role="menu" aria-labelledby="perfil-menu" class="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#141417] p-2 shadow-2xl border border-[#26262c] z-50">
              <a routerLink="/meu-perfil" role="menuitem" (click)="usuarioAberto = false" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Meus dados
              </a>
              <a routerLink="/ajustes" role="menuitem" (click)="usuarioAberto = false" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Ajustes
              </a>
              <div class="my-1 border-t border-[#26262c]"></div>
              <button type="button" role="menuitem" (click)="sair()" class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sair
              </button>
            </div>
          }
        </div>
      </header>

      <aside
        [class.recolhido]="compacto()"
        class="bo-rail fixed bottom-0 left-0 top-16 md:top-20 z-30 flex flex-col gap-1 overflow-hidden lg:translate-x-0"
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
                  @case ('ajuda') { <circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/> }
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

        <!-- Botão recolher/expandir (só desktop) -->
        <div class="mt-auto w-full shrink-0 border-t border-[#26262c] p-3" [class.px-2]="compacto()" [class.px-4]="!compacto()">
          <button type="button"
            class="hidden lg:flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer transition"
            [class.justify-center]="compacto()"
            [class.px-0]="compacto()"
            [attr.aria-label]="recolhido() ? 'Expandir menu' : 'Recolher menu'"
            data-menu="recolher"
            (click)="alternarRecolhido()">
            <span class="text-xl font-bold">{{ recolhido() ? '»' : '«' }}</span>
          </button>
        </div>
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
  usuarioAberto = false;

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    this.usuarioAberto = false;
  }

  // O header tem backdrop-filter, que prende elementos fixed dentro dele: por isso o clique fora é tratado no documento.
  @HostListener('document:click', ['$event'])
  aoClicarNoDocumento(e: Event): void {
    if (this.usuarioAberto && !(e.target as HTMLElement | null)?.closest('#perfil-menu, #perfil-dropdown')) {
      this.usuarioAberto = false;
    }
  }

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
        { rotulo: 'Instâncias', url: '/instancias', icone: 'logs' },
        { rotulo: 'Cobranças', url: '/cobrancas', icone: 'cobrancas' },
        { rotulo: 'Financeiro', url: '/financeiro', icone: 'cobrancas' },
        { rotulo: 'Logs', url: '/logs', icone: 'logs' }
      ]
    },
    {titulo: 'Orientações',itens: [{rotulo: 'Ajuda',url: '/ajuda',icone: 'ajuda'}]},
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
    this.usuarioAberto = false;
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
