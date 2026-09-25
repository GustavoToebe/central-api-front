import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Cliente } from '../../core/api/central.models';
import { iniciais } from '../comum/rotulos';

@Component({
  selector: 'app-clientes-list',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="bo-title">Clientes</h1>
          <p class="bo-sub">Quem paga. Cada cliente pode ter várias contratações, de aplicativos diferentes.</p>
        </div>
        <a routerLink="/clientes/novo" class="bo-btn">Novo cliente</a>
      </div>
      <input class="bo-field max-w-md" placeholder="Buscar por nome, documento ou cidade" [(ngModel)]="busca" name="busca">
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      <div class="bo-table-wrap">
        <table class="bo-table">
          <thead><tr><th>Cliente</th><th>Tipo</th><th>Documento</th><th>Cidade</th><th>Contato principal</th></tr></thead>
          <tbody>
            @for (c of filtrados(); track c.id) {
              <tr>
                <td>
                  <a [routerLink]="['/clientes', c.id]" class="flex items-center gap-3 font-semibold hover:text-[#ff4d47]">
                    <span class="bo-avatar h-8 w-8 text-[11px]">{{ iniciais(c.nome) }}</span>{{ c.nome }}
                  </a>
                </td>
                <td>{{ c.tipo }}</td>
                <td>{{ c.documento }}</td>
                <td>{{ c.cidade ? c.cidade + (c.uf ? '-' + c.uf : '') : '—' }}</td>
                <td>{{ principal(c) }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center text-neutral-500">{{ carregando ? 'Carregando...' : 'Nenhum cliente.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ClientesListComponent implements OnInit {
  private api = inject(CentralApiService);

  clientes: Cliente[] = [];
  busca = '';
  erro = '';
  carregando = true;
  iniciais = iniciais;

  ngOnInit(): void {
    this.api.clientes().subscribe({
      next: lista => { this.clientes = lista; this.carregando = false; },
      error: e => { this.erro = mensagemApi(e, 'Não foi possível listar os clientes.'); this.carregando = false; }
    });
  }

  filtrados(): Cliente[] {
    const termo = this.busca.trim().toLowerCase();
    if (!termo) return this.clientes;
    return this.clientes.filter(c =>
      [c.nome, c.documento, c.cidade ?? ''].some(v => v.toLowerCase().includes(termo)));
  }

  principal(c: Cliente): string {
    const p = c.contatos.find(ct => ct.principal) ?? c.contatos[0];
    return p ? [p.nome, p.email ?? p.telefone].filter(Boolean).join(' · ') : '—';
  }
}
