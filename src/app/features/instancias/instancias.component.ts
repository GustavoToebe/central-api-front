import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { mensagemApi } from '../../core/api/api-error';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { NivelInstancia, PaginaInstancias } from './instancias.models';

/**
 * Painel conjunto das instâncias (F06/F26): último resumo de consumo guardado de cada contratação provisionada,
 * do mais grave ao mais tranquilo. Não consulta os aplicativos ao abrir; "Atualizar" consulta poucas por vez,
 * começando pelas sem dado ou mais antigas. Ausência de resumo nunca é mostrada como consumo zero.
 */
@Component({
  selector: 'app-instancias',
  imports: [CommonModule, RouterLink, CabecalhoPaginaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <app-cabecalho-pagina titulo="Instâncias" subtitulo="Último resumo de consumo guardado de cada paróquia provisionada.">
        <div acoes><button class="bo-btn" type="button" [disabled]="atualizando() || carregando()" (click)="atualizar()" data-atualizar>
          {{ atualizando() ? 'Consultando…' : 'Atualizar as mais antigas' }}</button></div>
      </app-cabecalho-pagina>
      @if (erro()) { <div class="bo-erro" role="alert" data-erro>{{ erro() }}</div> }
      @if (mensagem()) { <div class="bo-card p-4" role="status" data-mensagem>{{ mensagem() }}</div> }
      @if (dados(); as d) {
        <section class="grid gap-3 sm:grid-cols-4">
          @for (n of niveis; track n) {
            <button type="button" class="bo-card p-4 text-left" [class.ring-2]="filtro === n" (click)="filtrar(n)" [attr.data-nivel]="n">
              <p class="bo-label">{{ rotuloNivel(n) }}</p><p class="text-2xl font-black">{{ d.porNivel[n] }}</p>
            </button>
          }
        </section>
        <p class="bo-sub">{{ d.defasadas }} instância(s) sem consulta nas últimas 48 horas.
          @if (filtro) { <button type="button" class="bo-link" (click)="filtrar(filtro)">Limpar filtro</button> }</p>
        <div class="bo-card bo-table-rolagem">
          <table class="bo-table w-full">
            <thead><tr><th>Cliente</th><th>Instância</th><th>Plano</th><th>Situação</th><th>Nível</th><th>Último resumo</th><th></th></tr></thead>
            <tbody>
              @for (i of d.itens; track i.contratacaoId) {
                <tr>
                  <td>{{ i.cliente }}</td><td>{{ i.instancia }}</td><td>{{ i.plano }}</td><td>{{ i.situacaoComercial }}</td>
                  <td><span class="bo-chip" [ngClass]="tom(i.nivel)">{{ rotuloNivel(i.nivel) }}</span>
                    @for (a of i.alertas; track a.codigo) { <div class="bo-sub">{{ a.nome }}: {{ rotuloEstado(a.estado) }}</div> }</td>
                  <td>@if (i.consultadoEm) { {{ i.consultadoEm | date: 'dd/MM/yyyy HH:mm' }}
                    @if (i.defasado) { <span class="bo-chip bo-warn">defasado</span> } } @else { <span class="bo-sub">sem consulta</span> }</td>
                  <td><a class="bo-link" [routerLink]="['/contratacoes', i.contratacaoId, 'consumo']">Ver consumo</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (!d.itens.length && !carregando()) { <p class="bo-sub">Nenhuma instância neste filtro.</p> }
        <div class="flex items-center gap-3">
          <button type="button" class="bo-btn-line" [disabled]="pagina === 0 || carregando()" (click)="paginar(-1)">Anterior</button>
          <span>{{ d.total }} instâncias · Página {{ pagina + 1 }}</span>
          <button type="button" class="bo-btn-line" [disabled]="(pagina + 1) * d.tamanho >= d.total || carregando()" (click)="paginar(1)">Próxima</button>
        </div>
        <p class="bo-sub">Resumo mais recente de cada instância; um resumo antigo não representa o consumo de agora. Limite de 500 instâncias por painel.</p>
      }
    </div>
  `
})
export class InstanciasComponent implements OnInit, OnDestroy {
  private readonly api = inject(CentralApiService);

  readonly niveis: NivelInstancia[] = ['CRITICO', 'ATENCAO', 'OK', 'SEM_DADOS'];
  private readonly estados: Record<string, string> = {
    DISPONIVEL: 'disponível', ATINGIDO: 'atingido', ATENCAO: 'atenção', EXCEDIDO: 'excedido',
    INVENTARIO_PENDENTE: 'inventário pendente', SEM_LIMITE_CONFIGURADO: 'sem limite configurado'
  };
  /** Estado do recurso em português; código desconhecido aparece como veio, nunca em branco. */
  rotuloEstado(estado: string): string { return this.estados[estado] ?? estado; }
  readonly dados = signal<PaginaInstancias | null>(null);
  readonly carregando = signal(false);
  readonly atualizando = signal(false);
  readonly erro = signal('');
  readonly mensagem = signal('');
  filtro: NivelInstancia | null = null;
  pagina = 0;
  private leitura?: Subscription;
  private escrita?: Subscription;

  ngOnInit() { this.carregar(); }

  rotuloNivel(n: NivelInstancia) {
    return ({ CRITICO: 'Crítico', ATENCAO: 'Atenção', OK: 'Em ordem', SEM_DADOS: 'Sem dados' })[n];
  }

  tom(n: NivelInstancia) {
    return ({ CRITICO: 'bo-bad', ATENCAO: 'bo-warn', OK: 'bo-ok', SEM_DADOS: 'bo-mute' })[n];
  }

  filtrar(n: NivelInstancia) { this.filtro = this.filtro === n ? null : n; this.pagina = 0; this.carregar(); }
  paginar(delta: number) { this.pagina += delta; this.carregar(); }

  carregar() {
    this.leitura?.unsubscribe();
    this.carregando.set(true);
    this.erro.set('');
    this.leitura = this.api.instancias(this.filtro, this.pagina).subscribe({
      next: d => { this.dados.set(d); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.erro.set(mensagemApi(e, 'Não foi possível consultar as instâncias.')); }
    });
  }

  atualizar() {
    if (this.atualizando()) return;
    this.atualizando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    this.escrita = this.api.atualizarInstancias().subscribe({
      next: r => {
        this.atualizando.set(false);
        this.mensagem.set(`${r.consultadas} consultadas, ${r.falhas} com falha. ${r.restantesSemDadosOuDefasadas} ainda aguardam atualização.`);
        this.carregar();
      },
      error: e => { this.atualizando.set(false); this.erro.set(mensagemApi(e, 'Não foi possível atualizar as instâncias.')); }
    });
  }

  ngOnDestroy() {
    this.leitura?.unsubscribe();
    this.escrita?.unsubscribe();
  }
}
