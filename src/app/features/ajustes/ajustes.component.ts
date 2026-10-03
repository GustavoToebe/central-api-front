import { AjudaLinkComponent } from '../comum/ajuda-link.component';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTRASTES_CENTRAL, FONTES_CENTRAL, PALETAS_CENTRAL, ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-ajustes',
  imports: [RouterLink, AjudaLinkComponent],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <div>
        <div class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs" [style.background]="'var(--brand)'">
          Preferências
        </div>
        <h1 class="mt-3 text-2xl font-black text-white">Ajustes visuais</h1>
        <div class="mt-2"><app-ajuda-link /></div>
        <p class="text-sm text-neutral-400">
          Personalize a cor de destaque, a escala do texto e a ergonomia do painel. As preferências ficam salvas neste navegador.
        </p>
      </div>

      <!-- Paletas de Cores Dark -->
      <section class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="rounded-md px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-neutral-300 bg-neutral-800 border border-neutral-700">Tema Dark</span>
          <h2 class="text-lg font-black text-white">Cores de destaque</h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          @for (paleta of paletas; track paleta.id) {
            <button
              type="button"
              class="bo-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-[var(--brand)] cursor-pointer"
              [class.ring-2]="tema.paleta() === paleta.id"
              [style.ring-color]="tema.paleta() === paleta.id ? paleta.brand : 'transparent'"
              (click)="tema.escolherPaleta(paleta.id)">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white shadow-md" [style.background]="paleta.brand">
                {{ paleta.nome.slice(0, 1) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-bold text-white text-sm">{{ paleta.nome }}</span>
                <span class="block text-xs text-neutral-400 mt-0.5 leading-snug">{{ paleta.descricao }}</span>
              </span>
              @if (tema.paleta() === paleta.id) {
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-xs" [style.background]="paleta.brand">
                  ✓
                </span>
              }
            </button>
          }
        </div>
      </section>

      <!-- Contraste das bordas: Padrão ou Forte -->
      <section class="bo-card p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-black text-white">Contraste das bordas</h2>
            <p class="text-xs text-neutral-400">Deixa as bordas de cartões, campos e divisões mais nítidas.</p>
          </div>
          <div class="inline-flex rounded-xl border border-[#2e2e2e] bg-[#181818] p-1" role="group" aria-label="Contraste das bordas" data-contraste>
            @for (c of contrastes; track c.id) {
              <button type="button"
                class="cursor-pointer rounded-lg px-4 py-1.5 text-sm font-bold transition-colors"
                [class.bg-[var(--brand)]]="tema.contraste() === c.id"
                [class.text-white]="tema.contraste() === c.id"
                [class.text-neutral-300]="tema.contraste() !== c.id"
                [attr.aria-pressed]="tema.contraste() === c.id"
                (click)="tema.definirContraste(c.id)">{{ c.rotulo }}</button>
            }
          </div>
        </div>
      </section>

      <!-- Escala de Texto -->
      <section class="bo-card p-5 space-y-4">
        <div class="flex items-center gap-2">
          <span class="rounded-md px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-emerald-400 bg-emerald-950/60 border border-emerald-800">Tipografia</span>
          <h2 class="text-lg font-black text-white">Tamanho do texto</h2>
        </div>
        <p class="text-xs text-neutral-400">
          Ajuste a densidade visual e o conforto visual para longas sessões de operação.
        </p>

        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          @for (fonte of fontes; track fonte.id) {
            <button
              type="button"
              class="rounded-xl border p-3 text-center transition-all cursor-pointer"
              [class.bg-[var(--brand)]]="tema.fonte() === fonte.id"
              [class.text-white]="tema.fonte() === fonte.id"
              [class.border-[var(--brand)]]="tema.fonte() === fonte.id"
              [class.bg-[#181818]]="tema.fonte() !== fonte.id"
              [class.text-neutral-300]="tema.fonte() !== fonte.id"
              [class.border-[#2e2e2e]]="tema.fonte() !== fonte.id"
              (click)="tema.definirFonte(fonte.id)">
              <span class="block text-base font-black">{{ fonte.rotulo }}</span>
              <span class="block text-[11px] font-semibold opacity-85 mt-0.5">{{ fonte.detalhe }}</span>
            </button>
          }
        </div>

        <!-- Demonstração em Tempo Real -->
        <div class="rounded-xl border border-neutral-800 bg-[#0c0c0e] p-4">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Prévia em tempo real</span>
            <span class="bo-ok">Instância ativa</span>
          </div>
          <div class="mt-2 text-base font-extrabold text-white">Paróquia São Francisco de Assis</div>
          <div class="text-xs text-neutral-400 mt-0.5">Contratação #2108 · Plano Diocesano Plus · 12 usuários simultâneos</div>
        </div>
      </section>

      <!-- Feedback Háptico / Resposta ao Toque -->
      <section class="bo-card flex items-center justify-between gap-4 p-5">
        <div>
          <h2 class="text-base font-black text-white">Resposta ao toque</h2>
          <p class="mt-1 text-xs text-neutral-400">Vibração curta ao alternar opções visuais em dispositivos móveis compatíveis.</p>
        </div>
        <button
          type="button"
          class="bo-switch cursor-pointer"
          [class.on]="tema.vibrar()"
          (click)="tema.definirVibrar(!tema.vibrar())"
          [attr.aria-pressed]="tema.vibrar()"
          aria-label="Alternar resposta ao toque">
          <span></span>
        </button>
      </section>

      <!-- Dica Operacional -->
      <div class="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-200 leading-relaxed">
        <strong class="text-amber-100 font-black">💡 Dica de operação:</strong><br>
        O tema e a escala selecionados são gravados de forma isolada em seu navegador atual e não interferem na visualização dos outros operadores do painel.
      </div>

      <!-- Ações do Rodapé -->
      <div class="flex items-center justify-between pt-2">
        <button type="button" class="bo-btn-ghost cursor-pointer" (click)="tema.restaurar()">
          Restaurar padrões
        </button>
        <a routerLink="/clientes" class="bo-btn cursor-pointer">
          Concluir ajustes
        </a>
      </div>
    </div>
  `
})
export class AjustesComponent {
  tema = inject(ThemeService);
  paletas = PALETAS_CENTRAL;
  fontes = FONTES_CENTRAL;
  contrastes = CONTRASTES_CENTRAL;
}
