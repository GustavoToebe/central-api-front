import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Cliente } from '../../core/api/central.models';
import { iniciais } from '../comum/rotulos';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent } from '../comum/barra-filtros.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CabecalhoPaginaComponent, BarraFiltrosComponent, EstadoListaComponent],
  template: `
    <div class="space-y-4">
      <app-cabecalho-pagina titulo="Clientes" [exportacao]="dadosExportacao" [exportacaoOcupada]="carregando"
        subtitulo="Quem paga. Cada cliente pode ter várias contratações, de aplicativos diferentes.">
        <a routerLink="/clientes/novo" class="bo-btn" acoes>Novo cliente</a>
      </app-cabecalho-pagina>

      <app-barra-filtros [termo]="busca" (termoChange)="busca = $event; atualizarFiltro()"
        placeholder="Buscar por nome, número, documento ou cidade" [temFiltros]="false" (buscar)="atualizarFiltro()">
      </app-barra-filtros>

      @if (erro) { <div class="bo-erro">{{ erro }}</div> }

      <div class="bo-table-wrap">
        <div class="bo-table-rolagem">
          <table class="bo-table">
            <thead>
              <tr>
                <th>Cliente</th><th>Tipo</th><th>Documento</th><th>Cidade</th><th>Contato principal</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filtradosCache; track c.id) {
                <tr class="clicavel" tabindex="0"
                  (click)="abrirCliente(c.id)"
                  (keydown.enter)="abrirCliente(c.id)">
                  <td>
                    <span class="flex items-center gap-3 font-semibold">
                      <span class="bo-avatar h-8 w-8 text-[11px]">{{ iniciais(c.nome) }}</span>
                      {{ c.nome }}
                    </span>
                  </td>
                  <td>{{ c.tipo }}</td>
                  <td>{{ c.documento }}</td>
                  <td>{{ c.cidade ? c.cidade + (c.uf ? '-' + c.uf : '') : '—' }}</td>
                  <td>{{ principal(c) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-estado-lista [carregando]="carregando" [vazio]="!carregando && filtradosCache.length === 0"
          mensagemVazio="Nenhum cliente encontrado." />
      </div>
    </div>
  `
})
export class ClientesListComponent implements OnInit {
  readonly dadosExportacao = () => ({ nome: 'clientes', titulo: 'Central · Clientes', colunas: ['Nome', 'Tipo', 'Documento'], linhas: this.filtradosCache.map(c => [c.nome, c.tipo, c.documento]) });
  private api = inject(CentralApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  busca = '';
  filtradosCache: Cliente[] = [];
  erro = '';
  carregando = true;
  iniciais = iniciais;

  ngOnInit(): void {
    this.api.clientes().subscribe({
      next: lista => {
        this.clientes = lista;
        this.atualizarFiltro();
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = mensagemApi(e, 'Não foi possível listar os clientes.');
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  atualizarFiltro(): void {
    const termo = this.busca.trim().toLowerCase();
    if (!termo) {
      this.filtradosCache = this.clientes;
    } else {
      this.filtradosCache = this.clientes.filter(c =>
        String(c.sequencial) === termo || [c.nome, c.documento, c.cidade ?? ''].some(v => v.toLowerCase().includes(termo)));
    }
    this.cdr.markForCheck();
  }

  abrirCliente(id: string): void {
    void this.router.navigate(['/clientes', id]);
  }

  principal(c: Cliente): string {
    const p = c.contatos.find(ct => ct.principal) ?? c.contatos[0];
    return p ? [p.nome, p.email ?? p.telefone].filter(Boolean).join(' · ') : '—';
  }
}
