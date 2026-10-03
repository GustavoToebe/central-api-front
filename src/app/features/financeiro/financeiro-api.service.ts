import { Injectable, inject } from '@angular/core';
import { CentralApiService } from '../../core/api/central-api.service';
import { Observable, firstValueFrom } from 'rxjs';
import { mensagemApi } from '../../core/api/api-error';
import { Categoria, CategoriaRequest, Conta, Filtros, Movimento, MovimentoRequest, Pagina, Resumo } from './financeiro.models';

@Injectable({ providedIn: 'root' })
export class FinanceiroApiService {
  private readonly api = inject(CentralApiService);
  contas() { return this.chamar(this.api.contasFinanceiras()); }
  categorias() { return this.chamar(this.api.categoriasFinanceiras()); }
  listar(filtro: Filtros) { return this.chamar(this.api.movimentosFinanceiros(filtro)); }
  resumo(de: string, ate: string) { return this.chamar(this.api.resumoOperacional(de, ate)); }
  salvarConta(id: string | null, dados: Omit<Conta, 'id'>) { return this.chamar(this.api.salvarContaFinanceira(id, dados)); }
  salvarCategoria(id: string | null, dados: CategoriaRequest) { return this.chamar(this.api.salvarCategoriaFinanceira(id, dados)); }
  salvarMovimento(id: string | null, dados: MovimentoRequest) { return this.chamar(this.api.salvarMovimentoFinanceiro(id, dados)); }
  baixar(m: Movimento, data: string) { return this.chamar(this.api.baixarMovimentoFinanceiro(m, data)); }
  acao(m: Movimento, acao: 'estornar' | 'cancelar') { return this.chamar(this.api.acaoMovimentoFinanceiro(m, acao)); }
  private async chamar<T>(pedido: Observable<T>): Promise<T> {
    try { return await firstValueFrom(pedido); }
    catch (erro) { throw new Error(mensagemApi(erro, 'Não foi possível completar a operação financeira.')); }
  }
}
