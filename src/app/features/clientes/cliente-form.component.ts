import { Component, OnInit, ViewChild, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemApi } from '../../core/api/api-error';
import { CentralApiService } from '../../core/api/central-api.service';
import { CepService } from '../comum/cep.service';
import { UFS, cepValido, cnpjValido, cpfValido, emailValido, telefoneValido } from '../comum/formatos';
import { MascaraDirective } from '../comum/mascara.directive';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { RodapeFormComponent } from '../comum/rodape-form.component';
import {
  ClienteForm, clienteFormDe, clienteFormVazio, formatarDocumento, montarClienteRequest, problemaNoCliente
} from './cliente.form';

@Component({
  selector: 'app-cliente-form',
  imports: [FormsModule, RouterLink, MascaraDirective, CabecalhoPaginaComponent, RodapeFormComponent],
  template: `
    <div class="w-full min-w-0 space-y-6">
      <app-cabecalho-pagina [titulo]="id() ? 'Editar cliente' : 'Novo cliente'">
        <a [routerLink]="voltar()" class="bo-link" acoes>← Voltar</a>
      </app-cabecalho-pagina>
      @if (erro) { <div class="bo-erro">{{ erro }}</div> }
      @if (form) {
        <form #formulario="ngForm" class="space-y-6" (ngSubmit)="salvar()">
          <section class="bo-card grid gap-4 p-5 md:grid-cols-4">
            <label class="md:col-span-1"><span class="bo-label">Tipo *</span>
              <select class="bo-field" name="tipo" [(ngModel)]="form.tipo" (ngModelChange)="trocarTipo()">
                <option value="PJ">Pessoa jurídica</option>
                <option value="PF">Pessoa física</option>
              </select>
            </label>
            <label class="md:col-span-1"><span class="bo-label">{{ form.tipo === 'PJ' ? 'CNPJ' : 'CPF' }} *</span>
              <input class="bo-field" name="documento" [(ngModel)]="form.documento" required #docCampo="ngModel"
                [appMascara]="form.tipo === 'PJ' ? 'cnpj' : 'cpf'" [placeholder]="form.tipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'">
              @if (docCampo.touched && form.documento.trim() && !documentoValido()) {
                <span class="mt-1 block text-xs text-red-400">{{ form.tipo === 'PJ' ? 'CNPJ' : 'CPF' }} inválido.</span>
              }
            </label>
            <label class="md:col-span-2"><span class="bo-label">{{ form.tipo === 'PJ' ? 'Razão social' : 'Nome completo' }} *</span>
              <input class="bo-field" name="nome" [(ngModel)]="form.nome" required>
            </label>
          </section>

          <section class="bo-card grid gap-4 p-5 md:grid-cols-6">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400 md:col-span-6">Endereço</h2>
            <label class="md:col-span-2"><span class="bo-label">CEP</span>
              <input class="bo-field" name="cep" [(ngModel)]="form.cep" #cepCampo="ngModel" appMascara="cep" inputmode="numeric"
                placeholder="00000-000" (input)="buscarCep($any($event.target).value)">
              @if (cepCampo.touched && form.cep.trim() && !cepValido(form.cep)) {
                <span class="mt-1 block text-xs text-red-400">CEP deve ter 8 números.</span>
              } @else if (avisoCep) {
                <span class="mt-1 block text-xs text-neutral-400">{{ avisoCep }}</span>
              }
            </label>
            <label class="md:col-span-3"><span class="bo-label">Logradouro</span><input class="bo-field" name="logradouro" [(ngModel)]="form.logradouro"></label>
            <label class="md:col-span-1"><span class="bo-label">Número</span><input class="bo-field" name="numero" [(ngModel)]="form.numero"></label>
            <label class="md:col-span-2"><span class="bo-label">Complemento</span><input class="bo-field" name="complemento" [(ngModel)]="form.complemento"></label>
            <label class="md:col-span-2"><span class="bo-label">Bairro</span><input class="bo-field" name="bairro" [(ngModel)]="form.bairro"></label>
            <label class="md:col-span-1"><span class="bo-label">Cidade</span><input class="bo-field" name="cidade" [(ngModel)]="form.cidade"></label>
            <label class="md:col-span-1"><span class="bo-label">UF</span>
              <select class="bo-field" name="uf" [(ngModel)]="form.uf">
                <option value="">—</option>
                @for (uf of ufs; track uf) { <option [value]="uf">{{ uf }}</option> }
              </select>
            </label>
          </section>

          <section class="bo-card space-y-3 p-5">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-extrabold uppercase tracking-wider text-neutral-400">Contatos</h2>
              <button type="button" class="bo-btn-line" (click)="adicionarContato()">+ Contato</button>
            </div>
            @for (c of form.contatos; track $index; let i = $index) {
              <div class="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                <label><span class="bo-label">Nome</span><input class="bo-field" [name]="'ctNome' + i" [(ngModel)]="c.nome"></label>
                <label><span class="bo-label">E-mail</span>
                  <input class="bo-field" type="email" [name]="'ctEmail' + i" [(ngModel)]="c.email" #emailCampo="ngModel" placeholder="nome@exemplo.com">
                  @if (emailCampo.touched && c.email.trim() && !emailValido(c.email)) {
                    <span class="mt-1 block text-xs text-red-400">E-mail inválido.</span>
                  }
                </label>
                <label><span class="bo-label">Telefone</span>
                  <input class="bo-field" [name]="'ctTel' + i" [(ngModel)]="c.telefone" #telCampo="ngModel" appMascara="telefone"
                    inputmode="tel" placeholder="(00) 00000-0000">
                  @if (telCampo.touched && c.telefone.trim() && !telefoneValido(c.telefone)) {
                    <span class="mt-1 block text-xs text-red-400">Telefone inválido.</span>
                  }
                </label>
                <label class="flex items-center gap-2 pb-3 text-sm">
                  <input type="radio" name="ctPrincipal" [checked]="c.principal" (change)="marcarPrincipal(i)"> Principal
                </label>
                <button type="button" class="bo-link pb-3" (click)="removerContato(i)">Excluir</button>
              </div>
            } @empty {
              <p class="bo-sub">Nenhum contato.</p>
            }
          </section>

          <app-rodape-form [voltarUrl]="voltar()" rotuloSalvar="Salvar cliente" [carregando]="salvando"
            [desabilitado]="!form.nome.trim() || !form.documento.trim()" />
        </form>
      }
    </div>
  `
})
export class ClienteFormComponent implements OnInit {
  @ViewChild('formulario') formulario?: NgForm;
  private salvo = false;
  hasPendingChanges(): boolean { return !this.salvo && (this.salvando || !!this.formulario?.dirty); }
  voltar(): string[] {
    const id = this.id();
    return id ? ['/clientes', id] : ['/clientes'];
  }

  private api = inject(CentralApiService);
  private router = inject(Router);
  private cepService = inject(CepService);
  readonly ufs = UFS;
  readonly cepValido = cepValido;
  readonly emailValido = emailValido;
  readonly telefoneValido = telefoneValido;
  avisoCep = '';

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
    this.formulario?.form.markAsDirty();
  }

  removerContato(i: number): void {
    this.form?.contatos.splice(i, 1);
    this.formulario?.form.markAsDirty();
  }

  documentoValido(): boolean {
    return !!this.form && (this.form.tipo === 'PJ' ? cnpjValido(this.form.documento) : cpfValido(this.form.documento));
  }

  /** PF e PJ têm máscaras diferentes: reformata o que já foi digitado. */
  trocarTipo(): void {
    if (this.form) this.form.documento = formatarDocumento(this.form.tipo, this.form.documento);
  }

  /** CEP completo preenche logradouro, bairro, cidade e UF (o número fica com o operador). */
  async buscarCep(valor: string): Promise<void> {
    this.avisoCep = '';
    if (!this.form || !cepValido(valor)) return;
    this.avisoCep = 'Buscando endereço…';
    const endereco = await this.cepService.buscar(valor);
    if (!endereco) {
      this.avisoCep = 'CEP não encontrado. Preencha o endereço.';
      return;
    }
    this.avisoCep = '';
    if (endereco.logradouro) this.form.logradouro = endereco.logradouro;
    if (endereco.bairro) this.form.bairro = endereco.bairro;
    if (endereco.cidade) this.form.cidade = endereco.cidade;
    if (endereco.uf) this.form.uf = endereco.uf;
    this.formulario?.form.markAsDirty();
  }

  marcarPrincipal(i: number): void {
    this.form?.contatos.forEach((c, j) => c.principal = j === i);
    this.formulario?.form.markAsDirty();
  }

  salvar(): void {
    if (!this.form) return;
    this.erro = problemaNoCliente(this.form) ?? '';
    if (this.erro) return;
    this.salvando = true;
    const corpo = montarClienteRequest(this.form);
    const id = this.id();
    const chamada = id ? this.api.atualizarCliente(id, corpo) : this.api.criarCliente(corpo);
    chamada.subscribe({
      next: c => { this.salvo = true; void this.router.navigate(['/clientes', c.id]); },
      error: e => { this.salvando = false; this.erro = mensagemApi(e, 'Não foi possível salvar o cliente.'); }
    });
  }
}
