import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ContratacaoResumo, SituacaoComercial } from '../../core/api/central.models';
import { GradeContratacoesComponent } from './grade-contratacoes.component';

@Component({
  selector: 'app-contratacoes-list',
  imports: [FormsModule, RouterLink, GradeContratacoesComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Contratações</h1>
          <p class="bo-sub">Cada contratação é uma instância de um aplicativo (no Servire, uma paróquia).</p>
        </div>
        <a routerLink="/contratacoes/nova" class="bo-btn">Nova contratação</a>
      </div>
      <div class="flex flex-wrap gap-3">
        <input class="bo-field max-w-sm" placeholder="Buscar cliente, instância, slug ou número" name="busca" [(ngModel)]="busca">
        <select class="bo-field max-w-[14rem]" name="situacao" [(ngModel)]="situacao">
          <option value="">Todas as situações</option>
          <option value="TRIAL">Teste</option>
          <option value="ATIVA">Ativa</option>
          <option value="INADIMPLENTE">Inadimplente</option>
          <option value="BLOQUEADA">Bloqueada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="soErro" [(ngModel)]="soErro"> Só provisionamento com erro
        </label>
      </div>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <app-grade-contratacoes [contratacoes]="filtradas()" [mostrarCliente]="true" (alterou)="carregar()"
        [vazio]="carregando ? 'Carregando...' : 'Nenhuma contratação.'" />
    </div>
  `
})
export class ContratacoesListComponent implements OnInit {
  private api = inject(CentralApiService);

  contratacoes: ContratacaoResumo[] = [];
  busca = '';
  situacao: SituacaoComercial | '' = '';
  soErro = false;
  erro = '';
  carregando = true;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.contratacoes().subscribe({
      next: lista => { this.contratacoes = lista; this.carregando = false; },
      error: e => { this.erro = mensagemApi(e, 'Não foi possível listar as contratações.'); this.carregando = false; }
    });
  }

  filtradas(): ContratacaoResumo[] {
    const termo = this.busca.trim().toLowerCase();
    return this.contratacoes.filter(c =>
      (!this.situacao || c.situacaoComercial === this.situacao)
      && (!this.soErro || c.situacaoProvisionamento === 'ERRO')
      && (!termo || String(c.sequencial) === termo
        || [c.clienteNome, c.nomeInstancia, c.slugInstancia].some(v => v.toLowerCase().includes(termo))));
  }
}
