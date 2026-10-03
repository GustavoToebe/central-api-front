import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ContratacaoResumo, SituacaoComercial } from '../../core/api/central.models';
import { GradeContratacoesComponent } from './grade-contratacoes.component';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent } from '../comum/barra-filtros.component';
import { EstadoListaComponent } from '../comum/estado-lista.component';

@Component({
  selector: 'app-contratacoes-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, GradeContratacoesComponent, CabecalhoPaginaComponent, BarraFiltrosComponent, EstadoListaComponent],
  template: `
    <div class="space-y-4">
      <app-cabecalho-pagina titulo="Contratações" [exportacao]="dadosExportacao" [exportacaoOcupada]="carregando"
        subtitulo="Cada contratação é uma instância de um aplicativo (no Servirea, uma paróquia).">
        <a routerLink="/contratacoes/nova" class="bo-btn" acoes>Nova contratação</a>
      </app-cabecalho-pagina>

      <app-barra-filtros [(termo)]="busca" placeholder="Buscar cliente, instância, slug ou número"
        (buscar)="atualizarFiltro()">
        <!-- Filtros avançados no painel -->
        <div class="md:col-span-6">
          <label><span class="bo-label">Situação</span>
            <select class="bo-field" name="situacao" [(ngModel)]="situacao">
              <option value="">Todas as situações</option>
              <option value="TRIAL">Teste</option>
              <option value="ATIVA">Ativa</option>
              <option value="INADIMPLENTE">Inadimplente</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>
        </div>
        <div class="md:col-span-6">
          <label class="flex items-center gap-2 text-sm text-neutral-300 mt-6">
            <input type="checkbox" name="soErro" [(ngModel)]="soErro"> Só provisionamento com erro
          </label>
        </div>
      </app-barra-filtros>

      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <app-grade-contratacoes [contratacoes]="filtradosCache" [mostrarCliente]="true" (alterou)="carregar()" />
      <app-estado-lista [carregando]="carregando" [vazio]="!carregando && filtradosCache.length === 0" />
    </div>
  `
})
export class ContratacoesListComponent implements OnInit {
  readonly dadosExportacao = () => ({ nome: 'contratacoes', titulo: 'Central · Contratações', colunas: ['Cliente', 'Instância', 'Produto', 'Plano', 'Periodicidade', 'Valor (R$)', 'Situação'], linhas: this.filtradosCache.map(c => [c.clienteNome, c.nomeInstancia, c.produtoCodigo, c.planoCodigo, c.periodicidade, c.valor, c.situacaoComercial]) });
  private api = inject(CentralApiService);
  private cdr = inject(ChangeDetectorRef);

  contratacoes: ContratacaoResumo[] = [];
  busca = '';
  situacao: SituacaoComercial | '' = '';
  soErro = false;
  filtradosCache: ContratacaoResumo[] = [];
  erro = '';
  carregando = true;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.api.contratacoes().subscribe({
      next: lista => {
        this.contratacoes = lista;
        this.atualizarFiltro();
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = mensagemApi(e, 'Não foi possível listar as contratações.');
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  atualizarFiltro(): void {
    const termo = this.busca.trim().toLowerCase();
    this.filtradosCache = this.contratacoes.filter(c =>
      (!this.situacao || c.situacaoComercial === this.situacao)
      && (!this.soErro || c.situacaoProvisionamento === 'ERRO')
      && (!termo || String(c.sequencial) === termo
        || [c.clienteNome, c.nomeInstancia, c.slugInstancia].some(v => v.toLowerCase().includes(termo))));
    this.cdr.markForCheck();
  }
}
