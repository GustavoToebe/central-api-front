import { Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Cliente, ContratacaoResumo } from '../../core/api/central.models';
import { GradeContratacoesComponent } from '../contratacoes/grade-contratacoes.component';
import { rotuloTipoCliente } from '../comum/rotulos';

@Component({
  selector: 'app-cliente-detalhe',
  imports: [RouterLink, GradeContratacoesComponent],
  template: `
    <div class="space-y-6">
      <a routerLink="/clientes" class="bo-link">← Clientes</a>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (cliente) {
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="bo-title">{{ cliente.nome }}</h1>
            <p class="bo-sub">{{ rotuloTipoCliente(cliente.tipo) }} · {{ cliente.documento }}</p>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/clientes', cliente.id, 'editar']" class="bo-btn-ghost">Editar</a>
            <a routerLink="/contratacoes/nova" [queryParams]="{ clienteId: cliente.id }" class="bo-btn">Nova contratação</a>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <section class="bo-card p-5">
            <h2 class="mb-3 text-sm font-extrabold uppercase tracking-wider text-neutral-400">Endereço</h2>
            <p>{{ endereco() || '—' }}</p>
          </section>
          <section class="bo-card p-5">
            <h2 class="mb-3 text-sm font-extrabold uppercase tracking-wider text-neutral-400">Contatos</h2>
            @for (c of cliente.contatos; track c.id) {
              <p class="mb-1">{{ c.nome }} @if (c.principal) { <span class="bo-ok text-xs">· principal</span> }
                <span class="block text-sm text-neutral-400">{{ contatoLinha(c.email, c.telefone) }}</span></p>
            } @empty { <p class="bo-sub">Nenhum contato.</p> }
          </section>
        </div>

        <section class="space-y-3">
          <h2 class="text-lg font-extrabold">Contratações</h2>
          <app-grade-contratacoes [contratacoes]="contratacoes" (alterou)="carregarContratacoes()"
            vazio="Este cliente ainda não contratou nenhum aplicativo." />
        </section>
      }
    </div>
  `
})
export class ClienteDetalheComponent implements OnInit {
  private api = inject(CentralApiService);

  readonly id = input.required<string>();
  cliente: Cliente | null = null;
  contratacoes: ContratacaoResumo[] = [];
  erro = '';
  readonly rotuloTipoCliente = rotuloTipoCliente;

  ngOnInit(): void {
    this.api.cliente(this.id()).subscribe({
      next: c => this.cliente = c,
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar o cliente.')
    });
    this.carregarContratacoes();
  }

  carregarContratacoes(): void {
    this.api.contratacoes().subscribe({
      next: lista => this.contratacoes = lista.filter(c => c.clienteId === this.id()),
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar as contratações.')
    });
  }

  contatoLinha(email: string | null, telefone: string | null): string {
    return [email, telefone].filter(v => !!v).join(' · ') || '—';
  }

  endereco(): string {
    const c = this.cliente;
    if (!c) return '';
    const linha1 = [c.logradouro, c.numero, c.complemento].filter(Boolean).join(', ');
    const linha2 = [c.bairro, c.cidade && c.uf ? `${c.cidade}-${c.uf}` : c.cidade, c.cep].filter(Boolean).join(' · ');
    return [linha1, linha2].filter(Boolean).join(' — ');
  }
}
