import { AjudaLinkComponent } from '../comum/ajuda-link.component';
import { NumeroComponent } from '../comum/numero.component';
import { Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { Cliente, ContratacaoResumo } from '../../core/api/central.models';
import { GradeContratacoesComponent } from '../contratacoes/grade-contratacoes.component';
import { rotuloTipoCliente } from '../comum/rotulos';

@Component({
  selector: 'app-cliente-detalhe',
  imports: [RouterLink, FormsModule, GradeContratacoesComponent, NumeroComponent, AjudaLinkComponent],
  template: `
    <div class="space-y-6">
      <a routerLink="/clientes" class="bo-link">← Clientes</a>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (cliente) {
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="bo-title">{{ cliente.nome }}<app-numero [numero]="cliente.sequencial" /></h1>
            <p class="bo-sub">{{ rotuloTipoCliente(cliente.tipo) }} · {{ cliente.documento }}</p>
            <div class="mt-2"><app-ajuda-link /></div>
          </div>
          <div class="flex gap-2">
            @if (elegiveis.length) {
              <button type="button" class="bo-btn-line" (click)="abrirAcesso()">Acessar aplicativo</button>
            }
            <a [routerLink]="['/clientes', cliente.id, 'editar']" class="bo-btn-ghost">Editar</a>
            <a routerLink="/contratacoes/nova" [queryParams]="{ clienteId: cliente.id }" class="bo-btn">Nova contratação</a>
          </div>
        </div>

        @if (acessoAberto) {
          <section class="bo-card space-y-3 p-5">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Acessar o aplicativo</h2>
            <p class="bo-sub">Escolha a contratação. A aba abre já autenticada, com o seu nome na auditoria.</p>
            <div class="space-y-2">
              @for (c of elegiveis; track c.id) {
                <label class="flex items-center gap-2 text-sm">
                  <input type="radio" name="contratacaoAcesso" [value]="c.id" [(ngModel)]="contratacaoEscolhida">
                  {{ c.produtoCodigo }} · {{ c.nomeInstancia || c.slugInstancia }}
                </label>
              }
            </div>
            <label class="block max-w-lg">
              <span class="bo-label">Motivo (fica na auditoria)</span>
              <input class="bo-field" name="motivoAcesso" [(ngModel)]="motivo" maxlength="500" placeholder="Por que está entrando">
            </label>
            <div class="flex gap-2">
              <button type="button" class="bo-btn" [disabled]="ocupado || !motivo.trim() || !contratacaoEscolhida" (click)="entrar()">Abrir</button>
              <button type="button" class="bo-btn-ghost" (click)="acessoAberto = false">Fechar</button>
            </div>
          </section>
        }

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
  acessoAberto = false;
  contratacaoEscolhida = '';
  motivo = '';
  ocupado = false;
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

  get elegiveis(): ContratacaoResumo[] {
    return this.contratacoes.filter(c => c.situacaoComercial !== 'CANCELADA' && c.situacaoProvisionamento === 'ATIVA');
  }

  abrirAcesso(): void {
    this.acessoAberto = true;
    this.erro = '';
    if (!this.elegiveis.some(c => c.id === this.contratacaoEscolhida)) {
      this.contratacaoEscolhida = this.elegiveis[0]?.id ?? '';
    }
  }

  /** A aba abre no clique; o navegador bloqueia se esperar a resposta da API. */
  entrar(): void {
    const motivo = this.motivo.trim();
    if (!this.contratacaoEscolhida || !motivo) return;
    const aba = window.open('about:blank', '_blank');
    this.ocupado = true;
    this.api.suporte(this.contratacaoEscolhida, motivo).subscribe({
      next: s => {
        this.ocupado = false;
        this.acessoAberto = false;
        this.motivo = '';
        if (aba) {
          aba.opener = null;
          aba.location.href = s.urlAcesso;
        }
      },
      error: e => {
        this.ocupado = false;
        aba?.close();
        this.erro = mensagemApi(e, 'Não foi possível abrir o aplicativo.');
      }
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
