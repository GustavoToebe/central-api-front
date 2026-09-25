import { Component, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { ClienteForm, clienteFormDe, clienteFormVazio, montarClienteRequest } from './cliente.form';

@Component({
  selector: 'app-cliente-form',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <div>
        <a [routerLink]="id() ? ['/clientes', id()] : ['/clientes']" class="bo-link">← Voltar</a>
        <h1 class="bo-title mt-2">{{ id() ? 'Editar cliente' : 'Novo cliente' }}</h1>
      </div>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (form) {
        <form class="space-y-6" (ngSubmit)="salvar()">
          <section class="bo-card grid gap-4 p-5 md:grid-cols-4">
            <label class="md:col-span-1"><span class="bo-label">Tipo *</span>
              <select class="bo-field" name="tipo" [(ngModel)]="form.tipo">
                <option value="PJ">Pessoa jurídica</option>
                <option value="PF">Pessoa física</option>
              </select>
            </label>
            <label class="md:col-span-1"><span class="bo-label">{{ form.tipo === 'PJ' ? 'CNPJ' : 'CPF' }} *</span>
              <input class="bo-field" name="documento" [(ngModel)]="form.documento" required>
            </label>
            <label class="md:col-span-2"><span class="bo-label">{{ form.tipo === 'PJ' ? 'Razão social' : 'Nome completo' }} *</span>
              <input class="bo-field" name="nome" [(ngModel)]="form.nome" required>
            </label>
          </section>

          <section class="bo-card grid gap-4 p-5 md:grid-cols-6">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400 md:col-span-6">Endereço</h2>
            <label class="md:col-span-2"><span class="bo-label">CEP</span><input class="bo-field" name="cep" [(ngModel)]="form.cep"></label>
            <label class="md:col-span-3"><span class="bo-label">Logradouro</span><input class="bo-field" name="logradouro" [(ngModel)]="form.logradouro"></label>
            <label class="md:col-span-1"><span class="bo-label">Número</span><input class="bo-field" name="numero" [(ngModel)]="form.numero"></label>
            <label class="md:col-span-2"><span class="bo-label">Complemento</span><input class="bo-field" name="complemento" [(ngModel)]="form.complemento"></label>
            <label class="md:col-span-2"><span class="bo-label">Bairro</span><input class="bo-field" name="bairro" [(ngModel)]="form.bairro"></label>
            <label class="md:col-span-1"><span class="bo-label">Cidade</span><input class="bo-field" name="cidade" [(ngModel)]="form.cidade"></label>
            <label class="md:col-span-1"><span class="bo-label">UF</span><input class="bo-field" name="uf" maxlength="2" [(ngModel)]="form.uf"></label>
          </section>

          <section class="bo-card space-y-3 p-5">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Contatos</h2>
              <button type="button" class="bo-btn-line" (click)="adicionarContato()">+ Contato</button>
            </div>
            @for (c of form.contatos; track $index; let i = $index) {
              <div class="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                <label><span class="bo-label">Nome</span><input class="bo-field" [name]="'ctNome' + i" [(ngModel)]="c.nome"></label>
                <label><span class="bo-label">E-mail</span><input class="bo-field" type="email" [name]="'ctEmail' + i" [(ngModel)]="c.email"></label>
                <label><span class="bo-label">Telefone</span><input class="bo-field" [name]="'ctTel' + i" [(ngModel)]="c.telefone"></label>
                <label class="flex items-center gap-2 pb-3 text-sm">
                  <input type="radio" name="ctPrincipal" [checked]="c.principal" (change)="marcarPrincipal(i)"> Principal
                </label>
                <button type="button" class="bo-link pb-3" (click)="form.contatos.splice(i, 1)">Excluir</button>
              </div>
            } @empty {
              <p class="bo-sub">Nenhum contato.</p>
            }
          </section>

          <div class="flex justify-end gap-3">
            <a [routerLink]="id() ? ['/clientes', id()] : ['/clientes']" class="bo-btn-ghost">Cancelar</a>
            <button class="bo-btn" type="submit" [disabled]="salvando || !form.nome.trim() || !form.documento.trim()">Salvar cliente</button>
          </div>
        </form>
      }
    </div>
  `
})
export class ClienteFormComponent implements OnInit {
  private api = inject(CentralApiService);
  private router = inject(Router);

  readonly id = input<string>();
  form: ClienteForm | null = null;
  erro = '';
  salvando = false;

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.form = clienteFormVazio();
      return;
    }
    this.api.cliente(id).subscribe({
      next: c => this.form = clienteFormDe(c),
      error: e => this.erro = mensagemApi(e, 'Não foi possível carregar o cliente.')
    });
  }

  adicionarContato(): void {
    this.form?.contatos.push({ nome: '', email: '', telefone: '', principal: !this.form.contatos.length });
  }

  marcarPrincipal(i: number): void {
    this.form?.contatos.forEach((c, j) => c.principal = j === i);
  }

  salvar(): void {
    if (!this.form) return;
    this.salvando = true;
    this.erro = '';
    const corpo = montarClienteRequest(this.form);
    const id = this.id();
    const chamada = id ? this.api.atualizarCliente(id, corpo) : this.api.criarCliente(corpo);
    chamada.subscribe({
      next: c => void this.router.navigate(['/clientes', c.id]),
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o cliente.'); }
    });
  }
}
