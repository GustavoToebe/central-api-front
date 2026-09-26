import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Adicional, AlterarPlanoRequest, AtualizarProvisionamentoRequest, Cliente, CobrancaDetalhe, CobrancaLinha, Contratacao,
  ContratacaoResumo, CriarContratacaoRequest, ErroAplicativo, Financeiro, FiltroCobrancas, FiltroErros, NovoPrecoRequest, Plano, Produto, AdicionalContratado, Recurso,
  RecursoDoApp, RegistrarPagamentoRequest, SalvarAdicionalRequest, SalvarClienteRequest, SalvarPlanoRequest,
  SalvarProdutoRequest, SalvarRecursoRequest, Suporte
} from './central.models';

/** Todas as rotas do painel na API da Central. Bearer, cookie e XSRF ficam no interceptor. */
@Injectable({ providedIn: 'root' })
export class CentralApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---- Clientes
  clientes() { return this.http.get<Cliente[]>(`${this.api}/clientes`); }
  cliente(id: string) { return this.http.get<Cliente>(`${this.api}/clientes/${id}`); }
  criarCliente(corpo: SalvarClienteRequest) { return this.http.post<Cliente>(`${this.api}/clientes`, corpo); }
  atualizarCliente(id: string, corpo: SalvarClienteRequest) { return this.http.put<Cliente>(`${this.api}/clientes/${id}`, corpo); }

  // ---- Catálogo
  produtos() { return this.http.get<Produto[]>(`${this.api}/produtos`); }
  criarProduto(corpo: SalvarProdutoRequest) { return this.http.post<Produto>(`${this.api}/produtos`, corpo); }
  atualizarProduto(id: string, corpo: SalvarProdutoRequest) { return this.http.put<Produto>(`${this.api}/produtos/${id}`, corpo); }
  /** Limites e funcionalidades que o aplicativo do produto entende (a Central pergunta ao app). */
  recursosDoApp(produtoId: string) { return this.http.get<RecursoDoApp[]>(`${this.api}/produtos/${produtoId}/recursos-do-app`); }

  recursos(produtoId?: string) { return this.http.get<Recurso[]>(`${this.api}/recursos`, { params: filtroProduto(produtoId) }); }
  criarRecurso(corpo: SalvarRecursoRequest) { return this.http.post<Recurso>(`${this.api}/recursos`, corpo); }
  atualizarRecurso(id: string, corpo: SalvarRecursoRequest) { return this.http.put<Recurso>(`${this.api}/recursos/${id}`, corpo); }

  planos(produtoId?: string) { return this.http.get<Plano[]>(`${this.api}/planos`, { params: filtroProduto(produtoId) }); }
  criarPlano(corpo: SalvarPlanoRequest) { return this.http.post<Plano>(`${this.api}/planos`, corpo); }
  atualizarPlano(id: string, corpo: SalvarPlanoRequest) { return this.http.put<Plano>(`${this.api}/planos/${id}`, corpo); }
  adicionarPreco(planoId: string, corpo: NovoPrecoRequest) { return this.http.post<Plano>(`${this.api}/planos/${planoId}/precos`, corpo); }

  adicionais(produtoId?: string) { return this.http.get<Adicional[]>(`${this.api}/adicionais`, { params: filtroProduto(produtoId) }); }
  criarAdicional(corpo: SalvarAdicionalRequest) { return this.http.post<Adicional>(`${this.api}/adicionais`, corpo); }
  atualizarAdicional(id: string, corpo: SalvarAdicionalRequest) { return this.http.put<Adicional>(`${this.api}/adicionais/${id}`, corpo); }

  // ---- Contratações
  contratacoes() { return this.http.get<ContratacaoResumo[]>(`${this.api}/contratacoes`); }
  contratacao(id: string) { return this.http.get<Contratacao>(`${this.api}/contratacoes/${id}`); }
  criarContratacao(corpo: CriarContratacaoRequest) { return this.http.post<Contratacao>(`${this.api}/contratacoes`, corpo); }
  atualizarProvisionamento(id: string, corpo: AtualizarProvisionamentoRequest) {
    return this.http.put<Contratacao>(`${this.api}/contratacoes/${id}`, corpo);
  }
  alterarPlano(id: string, corpo: AlterarPlanoRequest) { return this.http.put<Contratacao>(`${this.api}/contratacoes/${id}/plano`, corpo); }
  substituirAdicionais(id: string, adicionais: AdicionalContratado[], motivo: string | null) {
    return this.http.put<Contratacao>(`${this.api}/contratacoes/${id}/adicionais`, { adicionais, motivo });
  }
  bloquear(id: string, motivo: string) { return this.http.post<Contratacao>(`${this.api}/contratacoes/${id}/bloquear`, { motivo }); }
  desbloquear(id: string, motivo: string | null) {
    return this.http.post<Contratacao>(`${this.api}/contratacoes/${id}/desbloquear`, motivo ? { motivo } : null);
  }
  cancelar(id: string, motivo: string | null) {
    return this.http.post<Contratacao>(`${this.api}/contratacoes/${id}/cancelar`, motivo ? { motivo } : null);
  }
  tentarProvisionamento(id: string) {
    return this.http.post<Contratacao>(`${this.api}/contratacoes/${id}/tentar-provisionamento`, {});
  }
  suporte(id: string, motivo: string) { return this.http.post<Suporte>(`${this.api}/contratacoes/${id}/suporte`, { motivo }); }

  // ---- Financeiro da contratação
  financeiro(id: string) { return this.http.get<Financeiro>(`${this.api}/contratacoes/${id}/financeiro`); }
  /** `de` e `ate` em `YYYY-MM`; `de` nulo = desde o início. Só cria as que faltam. */
  gerarAdiantadas(id: string, de: string | null, ate: string) {
    return this.http.post<Financeiro>(`${this.api}/contratacoes/${id}/cobrancas/adiantadas`, { de, ate });
  }
  registrarPagamento(id: string, corpo: RegistrarPagamentoRequest) {
    return this.http.post<Financeiro>(`${this.api}/contratacoes/${id}/pagamentos`, corpo);
  }
  estornar(id: string, cobrancaId: string) {
    return this.http.post<Financeiro>(`${this.api}/contratacoes/${id}/cobrancas/${cobrancaId}/estornar`, {});
  }
  isentar(id: string, cobrancaId: string, motivo: string | null) {
    return this.http.post<Financeiro>(`${this.api}/contratacoes/${id}/cobrancas/${cobrancaId}/isentar`, { motivo });
  }

  // ---- Cobranças (todas as contratações)
  cobrancas(filtro: FiltroCobrancas) { return this.http.get<CobrancaLinha[]>(`${this.api}/cobrancas`, { params: parametros(filtro) }); }
  cobranca(id: string) { return this.http.get<CobrancaDetalhe>(`${this.api}/cobrancas/${id}`); }
  pagarCobrancas(corpo: RegistrarPagamentoRequest) { return this.http.post<void>(`${this.api}/cobrancas/pagamentos`, corpo); }

  // ---- Logs de erro dos aplicativos
  erros(filtro: FiltroErros) { return this.http.get<ErroAplicativo[]>(`${this.api}/erros`, { params: parametros(filtro) }); }
}

/** Só os filtros preenchidos viram parâmetro. */
export function parametros(filtro: FiltroCobrancas | FiltroErros): HttpParams {
  let params = new HttpParams();
  for (const [chave, valor] of Object.entries(filtro)) {
    const texto = typeof valor === 'string' ? valor.trim() : '';
    if (texto) params = params.set(chave, texto);
  }
  return params;
}

function filtroProduto(produtoId?: string): HttpParams {
  return produtoId ? new HttpParams().set('produtoId', produtoId) : new HttpParams();
}
