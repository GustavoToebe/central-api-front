import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { CATALOGO_RELATORIOS, RelatorioCatalogo } from './relatorios.models';

/** Central de relatórios: cartões por categoria, com pesquisa por título e descrição. Cada cartão abre `/relatorios/:id`. */
@Component({
  selector: 'app-relatorios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, CabecalhoPaginaComponent],
  template: `
    <div class="space-y-5">
      <app-cabecalho-pagina titulo="Relatórios" subtitulo="Escolha um relatório, informe o período e imprima ou baixe em planilha (CSV).">
      </app-cabecalho-pagina>
      <div>
        <label class="bo-label" for="busca-relatorio">Pesquisar relatório</label>
        <input id="busca-relatorio" class="bo-field" type="search" placeholder="Ex.: despesas, banco, resultado" [ngModel]="busca()" (ngModelChange)="busca.set($event)" data-busca-relatorio>
      </div>
      @for (secao of secoes(); track secao.categoria) {
        <section class="bo-card space-y-3 p-4" [attr.data-categoria]="secao.categoria">
          <button type="button" class="flex w-full items-center justify-between text-left" [attr.aria-expanded]="!recolhidas().has(secao.categoria)" (click)="alternar(secao.categoria)">
            <h2 class="text-lg font-bold">{{ secao.categoria }}</h2>
            <span aria-hidden="true" class="text-neutral-400">{{ recolhidas().has(secao.categoria) ? '▾' : '▴' }}</span>
          </button>
          @if (!recolhidas().has(secao.categoria)) {
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              @for (r of secao.itens; track r.id) {
                <a [routerLink]="['/relatorios', r.id]" data-relatorio class="block rounded-xl border border-[#26262c] bg-white/5 p-4 transition hover:border-[var(--brand)]">
                  <strong>{{ r.titulo }}</strong>
                  <p class="mt-2 text-sm text-neutral-400">{{ r.descricao }}</p>
                </a>
              }
            </div>
          }
        </section>
      } @empty {
        <p class="bo-card p-4 text-neutral-400" data-sem-resultado>Nenhum relatório encontrado para “{{ busca() }}”.</p>
      }
    </div>
  `
})
export class RelatoriosComponent {
  readonly busca = signal('');
  readonly recolhidas = signal<ReadonlySet<string>>(new Set());

  private static normalizar(t: string) { return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

  readonly secoes = computed(() => {
    const termo = RelatoriosComponent.normalizar(this.busca());
    const itens = CATALOGO_RELATORIOS.filter(r => !termo || RelatoriosComponent.normalizar(`${r.titulo} ${r.descricao} ${r.categoria}`).includes(termo));
    const porCategoria = new Map<string, RelatorioCatalogo[]>();
    for (const r of itens) porCategoria.set(r.categoria, [...(porCategoria.get(r.categoria) ?? []), r]);
    return [...porCategoria].map(([categoria, lista]) => ({ categoria, itens: lista }));
  });

  alternar(categoria: string) {
    const novo = new Set(this.recolhidas());
    if (!novo.delete(categoria)) novo.add(categoria);
    this.recolhidas.set(novo);
  }
}
