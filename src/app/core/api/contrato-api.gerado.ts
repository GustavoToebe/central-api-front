// GERADO por scripts/gerar-tipos-api.py a partir de central-api-back/docs/contrato-api.json. Não edite à mão.
/* eslint-disable */

export interface CatalogoDtos_AdicionalResponse {
  ativo: boolean;
  codigo?: string | null;
  id?: string | null;
  nome?: string | null;
  preco?: number | null;
  produtoId?: string | null;
  quantidade?: number | null;
  recursoCodigo?: string | null;
  recursoId?: string | null;
  sequencial?: number | null;
}

export interface CatalogoDtos_NovoPrecoRequest {
  periodicidade?: Periodicidade | null;
  valor?: number | null;
  vigenteDesde?: string | null;
}

export interface CatalogoDtos_PlanoResponse {
  ativo: boolean;
  codigo?: string | null;
  id?: string | null;
  nome?: string | null;
  precos?: CatalogoDtos_PrecoResponse[] | null;
  precosVigentes?: CatalogoDtos_PrecoVigenteResponse[] | null;
  produtoId?: string | null;
  recursos?: CatalogoDtos_RecursoDoPlanoResponse[] | null;
  sequencial?: number | null;
}

export interface CatalogoDtos_PrecoDoPlanoRequest {
  periodicidade?: Periodicidade | null;
  valor?: number | null;
}

export interface CatalogoDtos_PrecoResponse {
  id?: string | null;
  periodicidade?: Periodicidade | null;
  valor?: number | null;
  vigenteDesde?: string | null;
}

export interface CatalogoDtos_PrecoVigenteResponse {
  periodicidade?: Periodicidade | null;
  valor?: number | null;
}

export interface CatalogoDtos_ProdutoResponse {
  ativo: boolean;
  codigo?: string | null;
  id?: string | null;
  nome?: string | null;
  sequencial?: number | null;
  urlBaseIntegracao?: string | null;
}

export interface CatalogoDtos_RecursoDoPlanoRequest {
  recursoId?: string | null;
  valor?: number | null;
}

export interface CatalogoDtos_RecursoDoPlanoResponse {
  codigo?: string | null;
  recursoId?: string | null;
  tipo?: TipoRecurso | null;
  valor?: number | null;
}

export interface CatalogoDtos_RecursoResponse {
  codigo?: string | null;
  id?: string | null;
  nome?: string | null;
  produtoId?: string | null;
  sequencial?: number | null;
  tipo?: TipoRecurso | null;
  unidade?: string | null;
  valorPadrao?: number | null;
}

export interface CatalogoDtos_SalvarAdicionalRequest {
  ativo?: boolean | null;
  codigo?: string | null;
  nome?: string | null;
  preco?: number | null;
  produtoId?: string | null;
  quantidade?: number | null;
  recursoId?: string | null;
}

export interface CatalogoDtos_SalvarPlanoRequest {
  ativo?: boolean | null;
  codigo?: string | null;
  nome?: string | null;
  precos?: CatalogoDtos_PrecoDoPlanoRequest[] | null;
  produtoId?: string | null;
  recursos?: CatalogoDtos_RecursoDoPlanoRequest[] | null;
}

export interface CatalogoDtos_SalvarProdutoRequest {
  ativo?: boolean | null;
  codigo?: string | null;
  nome?: string | null;
  urlBaseIntegracao?: string | null;
}

export interface CatalogoDtos_SalvarRecursoRequest {
  codigo?: string | null;
  nome?: string | null;
  produtoId?: string | null;
  tipo?: TipoRecurso | null;
  unidade?: string | null;
  valorPadrao?: number | null;
}

export interface CheckoutMercadoPagoService_Link {
  situacao?: string | null;
  tentativaId?: string | null;
  url?: string | null;
}

export interface ClienteDtos_ClienteResponse {
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  complemento?: string | null;
  contatos?: ClienteDtos_ContatoResponse[] | null;
  documento?: string | null;
  id?: string | null;
  logradouro?: string | null;
  nome?: string | null;
  numero?: string | null;
  sequencial?: number | null;
  tipo?: TipoCliente | null;
  uf?: string | null;
}

export interface ClienteDtos_ContatoRequest {
  email?: string | null;
  nome?: string | null;
  principal: boolean;
  telefone?: string | null;
}

export interface ClienteDtos_ContatoResponse {
  email?: string | null;
  id?: string | null;
  nome?: string | null;
  principal: boolean;
  telefone?: string | null;
}

export interface ClienteDtos_SalvarClienteRequest {
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  complemento?: string | null;
  contatos?: ClienteDtos_ContatoRequest[] | null;
  documento?: string | null;
  logradouro?: string | null;
  nome?: string | null;
  numero?: string | null;
  tipo?: TipoCliente | null;
  uf?: string | null;
}

export type CobrancaItem_Tipo = 'PLANO' | 'ADICIONAL';

export type Cobranca_Status = 'ABERTA' | 'PAGA' | 'CANCELADA' | 'ISENTA';

export interface ConsumoCentralService_Consumo {
  consultadoEm?: string | null;
  direitosConfirmadosEm?: string | null;
  itens?: ConsumoCentralService_Item[] | null;
  planoNome?: string | null;
  versaoDireitos?: number | null;
}

export interface ConsumoCentralService_Item {
  codigo?: string | null;
  competencia?: string | null;
  disponivel?: number | null;
  estado?: string | null;
  limite?: number | null;
  nome?: string | null;
  pendentes: number;
  unidade?: string | null;
  usado: number;
}

export interface ConsumoCentralService_Resposta {
  consumo?: ConsumoCentralService_Consumo | null;
  contratacaoId?: string | null;
  funcionalidades?: string[] | null;
}

export interface ConsumoHistoricoService_Ponto {
  consumo?: ConsumoCentralService_Consumo | null;
  dia?: string | null;
}

export interface ContratacaoDtos_AdicionalContratadoRequest {
  adicionalId?: string | null;
  quantidade?: number | null;
}

export interface ContratacaoDtos_AdicionalContratadoResponse {
  adicionalId?: string | null;
  codigo?: string | null;
  quantidade?: number | null;
  quantidadeUnitaria?: number | null;
  recursoCodigo?: string | null;
}

export interface ContratacaoDtos_AlterarPlanoRequest {
  aPartirDe?: string | null;
  diaVencimento?: number | null;
  motivo?: string | null;
  periodicidade?: Periodicidade | null;
  planoId?: string | null;
  valor?: number | null;
}

export interface ContratacaoDtos_AtualizarProvisionamentoRequest {
  adminEmail?: string | null;
  adminNome?: string | null;
  nomeInstancia?: string | null;
  slugInstancia?: string | null;
}

export interface ContratacaoDtos_ContratacaoResponse {
  adicionais?: ContratacaoDtos_AdicionalContratadoResponse[] | null;
  adminEmail?: string | null;
  adminNome?: string | null;
  clienteId?: string | null;
  diaVencimento: number;
  direitos?: DireitosInstancia | null;
  historico?: ContratacaoDtos_HistoricoResponse[] | null;
  id?: string | null;
  idExterno?: string | null;
  idempotencyKey?: string | null;
  inicio?: string | null;
  isencaoMotivo?: string | null;
  isenta: boolean;
  isentaAte?: string | null;
  nomeInstancia?: string | null;
  periodicidade?: Periodicidade | null;
  planoCodigo?: string | null;
  planoId?: string | null;
  planoNome?: string | null;
  produtoCodigo?: string | null;
  produtoId?: string | null;
  provisionamentoEditavel: boolean;
  sequencial?: number | null;
  situacaoComercial?: SituacaoComercial | null;
  situacaoProvisionamento?: SituacaoProvisionamento | null;
  slugInstancia?: string | null;
  valor?: number | null;
  versaoDireitos: number;
  vigenteAte?: string | null;
}

export interface ContratacaoDtos_ContratacaoResumo {
  acessoLiberado: boolean;
  clienteId?: string | null;
  clienteNome?: string | null;
  diaVencimento: number;
  id?: string | null;
  nomeInstancia?: string | null;
  periodicidade?: Periodicidade | null;
  planoCodigo?: string | null;
  planoId?: string | null;
  produtoCodigo?: string | null;
  produtoId?: string | null;
  sequencial?: number | null;
  situacaoComercial?: SituacaoComercial | null;
  situacaoProvisionamento?: SituacaoProvisionamento | null;
  slugInstancia?: string | null;
  valor?: number | null;
  versaoDireitos: number;
  vigenteAte?: string | null;
}

export interface ContratacaoDtos_CriarContratacaoRequest {
  adicionais?: ContratacaoDtos_AdicionalContratadoRequest[] | null;
  adminEmail?: string | null;
  adminNome?: string | null;
  clienteId?: string | null;
  diaVencimento?: number | null;
  inicio?: string | null;
  nomeInstancia?: string | null;
  observacoes?: string | null;
  periodicidade?: Periodicidade | null;
  planoId?: string | null;
  produtoId?: string | null;
  situacaoComercial?: SituacaoComercial | null;
  slugInstancia?: string | null;
  valor?: number | null;
}

export interface ContratacaoDtos_HistoricoResponse {
  acao?: string | null;
  criadoEm?: string | null;
  id?: string | null;
  motivo?: string | null;
  operadorId?: string | null;
  versaoDireitos: number;
}

export interface ContratacaoDtos_MotivoRequest {
  motivo?: string | null;
}

export interface ContratacaoDtos_SubstituirAdicionaisRequest {
  adicionais?: ContratacaoDtos_AdicionalContratadoRequest[] | null;
  motivo?: string | null;
}

export interface DireitosInstancia {
  acessoLiberado: boolean;
  clienteId?: string | null;
  contratacaoId?: string | null;
  funcionalidades?: string[] | null;
  geradoEm?: string | null;
  limites?: Record<string, number> | null;
  motivoBloqueio?: string | null;
  plano?: DireitosInstancia_PlanoResumo | null;
  produto?: string | null;
  situacao?: string | null;
  tenantId?: string | null;
  versao: number;
  vigenteAte?: string | null;
}

export interface DireitosInstancia_PlanoResumo {
  codigo?: string | null;
  nome?: string | null;
}

export interface FinanceiroDtos_BaixaRequest {
  dataPagamento?: string | null;
  versao?: number | null;
}

export interface FinanceiroDtos_CategoriaRequest {
  ativo: boolean;
  nome?: string | null;
}

export interface FinanceiroDtos_CategoriaResponse {
  ativo: boolean;
  id?: string | null;
  nome?: string | null;
}

export interface FinanceiroDtos_CobrancaDetalhe {
  cobranca?: FinanceiroDtos_CobrancaLinha | null;
  itens?: FinanceiroDtos_CobrancaItemResponse[] | null;
  observacao?: string | null;
}

export interface FinanceiroDtos_CobrancaItemResponse {
  descricao?: string | null;
  meses: number;
  quantidade?: number | null;
  tipo?: CobrancaItem_Tipo | null;
  valor?: number | null;
  valorUnitario?: number | null;
}

export interface FinanceiroDtos_CobrancaLinha {
  clienteId?: string | null;
  clienteNome?: string | null;
  competenciaFim?: string | null;
  competenciaInicio?: string | null;
  contratacaoId?: string | null;
  formaPagamento?: FormaPagamento | null;
  id?: string | null;
  nomeInstancia?: string | null;
  pagoEm?: string | null;
  periodicidade?: Periodicidade | null;
  planoNome?: string | null;
  produtoCodigo?: string | null;
  sequencial?: number | null;
  status?: Cobranca_Status | null;
  valor?: number | null;
  valorPago?: number | null;
  vencida: boolean;
  vencimento?: string | null;
}

export interface FinanceiroDtos_CobrancaResponse {
  competenciaFim?: string | null;
  competenciaInicio?: string | null;
  contratacaoId?: string | null;
  formaPagamento?: FormaPagamento | null;
  id?: string | null;
  observacao?: string | null;
  pagoEm?: string | null;
  sequencial?: number | null;
  status?: Cobranca_Status | null;
  valor?: number | null;
  valorPago?: number | null;
  vencida: boolean;
  vencimento?: string | null;
}

export interface FinanceiroDtos_ContaRequest {
  ativo: boolean;
  dataSaldoInicial?: string | null;
  nome?: string | null;
  saldoInicial?: number | null;
}

export interface FinanceiroDtos_ContaResponse {
  ativo: boolean;
  dataSaldoInicial?: string | null;
  id?: string | null;
  nome?: string | null;
  saldoInicial?: number | null;
}

export interface FinanceiroDtos_FinanceiroResponse {
  cobrancas?: FinanceiroDtos_CobrancaResponse[] | null;
  resumo?: dto_FinanceiroDtos_Resumo | null;
}

export interface FinanceiroDtos_GerarCobrancasRequest {
  ate?: string | null;
  de?: string | null;
}

export interface FinanceiroDtos_IsentarCobrancaRequest {
  motivo?: string | null;
}

export interface FinanceiroDtos_IsentarContratacaoRequest {
  ate?: string | null;
  motivo?: string | null;
}

export interface FinanceiroDtos_MovimentoRequest {
  categoriaId?: string | null;
  contaId?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  tipo?: MovimentoFinanceiro_Tipo | null;
  valor?: number | null;
  vencimento?: string | null;
  versao?: number | null;
}

export interface FinanceiroDtos_MovimentoResponse {
  categoria?: string | null;
  categoriaId?: string | null;
  conta?: string | null;
  contaId?: string | null;
  dataPagamento?: string | null;
  descricao?: string | null;
  id?: string | null;
  observacoes?: string | null;
  situacao?: MovimentoFinanceiro_Situacao | null;
  tipo?: MovimentoFinanceiro_Tipo | null;
  valor?: number | null;
  vencimento?: string | null;
  versao: number;
}

export interface FinanceiroDtos_Pagina {
  itens?: FinanceiroDtos_MovimentoResponse[] | null;
  pagina: number;
  tamanho: number;
  total: number;
}

export interface FinanceiroDtos_RegistrarPagamentoRequest {
  cobrancaIds?: string[] | null;
  formaPagamento?: FormaPagamento | null;
  observacao?: string | null;
  pagoEm?: string | null;
  valorPago?: number | null;
}

export interface FinanceiroDtos_SaldoConta {
  id?: string | null;
  nome?: string | null;
  saldo?: number | null;
}

export interface FinanceiroDtos_VersaoRequest {
  versao?: number | null;
}

export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'OUTRO';

export interface InstanciasVisaoService_Alerta {
  codigo?: string | null;
  estado?: string | null;
  limite?: number | null;
  nome?: string | null;
  usado?: number | null;
}

export interface InstanciasVisaoService_Instancia {
  alertas?: InstanciasVisaoService_Alerta[] | null;
  cliente?: string | null;
  consultadoEm?: string | null;
  contratacaoId?: string | null;
  defasado: boolean;
  instancia?: string | null;
  nivel?: InstanciasVisaoService_Nivel | null;
  plano?: string | null;
  sequencial?: number | null;
  situacaoComercial?: SituacaoComercial | null;
}

export type InstanciasVisaoService_Nivel = 'CRITICO' | 'ATENCAO' | 'OK' | 'SEM_DADOS';

export interface InstanciasVisaoService_Pagina {
  defasadas: number;
  itens?: InstanciasVisaoService_Instancia[] | null;
  pagina: number;
  porNivel?: Record<string, number> | null;
  tamanho: number;
  total: number;
}

export interface InstanciasVisaoService_ResultadoVarredura {
  consultadas: number;
  falhas: number;
  restantesSemDadosOuDefasadas: number;
}

export interface IntegracaoDtos_ErroLinha {
  clienteNome?: string | null;
  codigo?: string | null;
  contratacaoId?: string | null;
  id?: string | null;
  mensagem?: string | null;
  metodo?: string | null;
  nomeInstancia?: string | null;
  ocorridoEm?: string | null;
  produtoCodigo?: string | null;
  requestId?: string | null;
  rota?: string | null;
  status: number;
  tenantId?: string | null;
  usuarioId?: string | null;
}

export interface IntegracaoDtos_ErroRecebido {
  codigo?: string | null;
  id?: string | null;
  mensagem?: string | null;
  metodo?: string | null;
  ocorridoEm?: string | null;
  requestId?: string | null;
  rota?: string | null;
  status?: number | null;
  tenantId?: string | null;
  usuarioId?: string | null;
}

export interface IntegracaoDtos_ErrosRecebidos {
  gravados: number;
  recebidos: number;
}

export interface IntegracaoDtos_LoteDeErros {
  erros?: IntegracaoDtos_ErroRecebido[] | null;
}

export interface IntegracaoDtos_PaginaDireitos {
  geradoEm?: string | null;
  itens?: DireitosInstancia[] | null;
  pagina: number;
  tamanho: number;
  total: number;
}

export interface IntegracaoDtos_RecursoDoAppResponse {
  aplicado: boolean;
  cadastrado: boolean;
  codigo?: string | null;
  nome?: string | null;
  tipo?: TipoRecurso | null;
  unidade?: string | null;
}

export interface IntegracaoDtos_SuporteResponse {
  codigo?: string | null;
  expiraEm?: string | null;
  urlAcesso?: string | null;
}

export interface LoginRequest {
  codigoMfa?: string | null;
  email?: string | null;
  senha?: string | null;
}

export interface LoginResponse {
  accessToken?: string | null;
  expiresInSeconds: number;
  operador?: OperadorResumo | null;
}

export interface MercadoPagoController_PagamentoLinha {
  aplicado: boolean;
  pagamentoId?: string | null;
  situacao?: string | null;
  statusProvedor?: string | null;
}

export interface MfaController_Confirmacao {
  codigo?: string | null;
  senha?: string | null;
}

export interface MfaController_Senha {
  senha?: string | null;
}

export interface MfaService_Preparacao {
  expiraEm?: string | null;
  segredo?: string | null;
}

export interface MfaService_Recuperacao {
  codigos?: string[] | null;
}

export interface MfaService_Status {
  ativo: boolean;
  codigosRestantes: number;
  configurado: boolean;
}

export interface MinhaContaDto {
  cliente?: MinhaContaDto_ClienteDto | null;
  cobrancas?: MinhaContaDto_CobrancaDto[] | null;
  contratacao?: MinhaContaDto_ContratacaoDto | null;
}

export interface MinhaContaDto_AdicionalDto {
  nome?: string | null;
  quantidade?: number | null;
}

export interface MinhaContaDto_ClienteDto {
  contatos?: MinhaContaDto_ContatoDto[] | null;
  documento?: string | null;
  endereco?: MinhaContaDto_EnderecoDto | null;
  nome?: string | null;
}

export interface MinhaContaDto_CobrancaDto {
  competenciaFim?: string | null;
  competenciaInicio?: string | null;
  id?: string | null;
  pagoEm?: string | null;
  situacao?: string | null;
  valor?: number | null;
  vencida: boolean;
  vencimento?: string | null;
}

export interface MinhaContaDto_ContatoDto {
  email?: string | null;
  nome?: string | null;
  principal: boolean;
  telefone?: string | null;
}

export interface MinhaContaDto_ContratacaoDto {
  adicionais?: MinhaContaDto_AdicionalDto[] | null;
  diaVencimento: number;
  inicio?: string | null;
  nomeInstancia?: string | null;
  periodicidade?: Periodicidade | null;
  planoNome?: string | null;
  situacaoComercial?: SituacaoComercial | null;
  valor?: number | null;
  vigenteAte?: string | null;
}

export interface MinhaContaDto_EnderecoDto {
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  complemento?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  uf?: string | null;
}

export type MovimentoFinanceiro_Situacao = 'PENDENTE' | 'PAGO' | 'CANCELADO';

export type MovimentoFinanceiro_Tipo = 'RECEITA' | 'DESPESA';

export interface OperadorResumo {
  email?: string | null;
  id?: string | null;
  nome?: string | null;
}

export type Periodicidade = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export type SituacaoComercial = 'TRIAL' | 'ATIVA' | 'INADIMPLENTE' | 'BLOQUEADA' | 'CANCELADA';

export type SituacaoProvisionamento = 'PENDENTE' | 'PROCESSANDO' | 'ATIVA' | 'ERRO';

export type TipoCliente = 'PF' | 'PJ';

export type TipoRecurso = 'LIMITE' | 'FUNCIONALIDADE';

export interface TrocaSenhaRequest {
  novaSenha?: string | null;
  senhaAtual?: string | null;
}

export interface dto_FinanceiroDtos_Resumo {
  diasAtraso: number;
  proximoVencimento?: string | null;
  totalPagoNoAno?: number | null;
  valorEmAtraso?: number | null;
  vencidas: number;
}

export interface financeiro_FinanceiroDtos_Resumo {
  ate?: string | null;
  contas?: FinanceiroDtos_SaldoConta[] | null;
  de?: string | null;
  despesas?: number | null;
  pagarPrevisto?: number | null;
  receberPrevisto?: number | null;
  receitas?: number | null;
  receitasCobrancas?: number | null;
  receitasManuais?: number | null;
  resultado?: number | null;
  resultadoPrevisto?: number | null;
  saldoTotal?: number | null;
}

/** Rotas do contrato: chave "VERBO /caminho"; `corpo` e `resposta` são os DTOs declarados no controlador. */
export interface ContratoRotas {
  "GET /adicionais": { corpo: null; resposta: CatalogoDtos_AdicionalResponse[] };
  "POST /adicionais": { corpo: CatalogoDtos_SalvarAdicionalRequest; resposta: CatalogoDtos_AdicionalResponse };
  "PUT /adicionais/{id}": { corpo: CatalogoDtos_SalvarAdicionalRequest; resposta: CatalogoDtos_AdicionalResponse };
  "POST /auth/login": { corpo: LoginRequest; resposta: LoginResponse };
  "POST /auth/logout": { corpo: null; resposta: void };
  "POST /auth/refresh": { corpo: null; resposta: LoginResponse };
  "GET /clientes": { corpo: null; resposta: ClienteDtos_ClienteResponse[] };
  "POST /clientes": { corpo: ClienteDtos_SalvarClienteRequest; resposta: ClienteDtos_ClienteResponse };
  "GET /clientes/{id}": { corpo: null; resposta: ClienteDtos_ClienteResponse };
  "PUT /clientes/{id}": { corpo: ClienteDtos_SalvarClienteRequest; resposta: ClienteDtos_ClienteResponse };
  "GET /cobrancas": { corpo: null; resposta: FinanceiroDtos_CobrancaLinha[] };
  "POST /cobrancas/pagamentos": { corpo: FinanceiroDtos_RegistrarPagamentoRequest; resposta: void };
  "POST /cobrancas/pagamentos-online/{id}/reconciliar": { corpo: null; resposta: void };
  "GET /cobrancas/{id}": { corpo: null; resposta: FinanceiroDtos_CobrancaDetalhe };
  "POST /cobrancas/{id}/checkout": { corpo: null; resposta: CheckoutMercadoPagoService_Link };
  "GET /cobrancas/{id}/pagamentos-online": { corpo: null; resposta: MercadoPagoController_PagamentoLinha[] };
  "GET /contratacoes": { corpo: null; resposta: ContratacaoDtos_ContratacaoResumo[] };
  "POST /contratacoes": { corpo: ContratacaoDtos_CriarContratacaoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "GET /contratacoes/{id}": { corpo: null; resposta: ContratacaoDtos_ContratacaoResponse };
  "PUT /contratacoes/{id}": { corpo: ContratacaoDtos_AtualizarProvisionamentoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "PUT /contratacoes/{id}/adicionais": { corpo: ContratacaoDtos_SubstituirAdicionaisRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "POST /contratacoes/{id}/bloquear": { corpo: ContratacaoDtos_MotivoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "POST /contratacoes/{id}/cancelar": { corpo: ContratacaoDtos_MotivoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "POST /contratacoes/{id}/cobrancas/adiantadas": { corpo: FinanceiroDtos_GerarCobrancasRequest; resposta: FinanceiroDtos_FinanceiroResponse };
  "POST /contratacoes/{id}/cobrancas/{cobrancaId}/estornar": { corpo: null; resposta: FinanceiroDtos_FinanceiroResponse };
  "POST /contratacoes/{id}/cobrancas/{cobrancaId}/isentar": { corpo: FinanceiroDtos_IsentarCobrancaRequest; resposta: FinanceiroDtos_FinanceiroResponse };
  "POST /contratacoes/{id}/cobrancas/{cobrancaId}/reemitir": { corpo: null; resposta: FinanceiroDtos_FinanceiroResponse };
  "GET /contratacoes/{id}/consumo": { corpo: null; resposta: ConsumoCentralService_Resposta };
  "GET /contratacoes/{id}/consumo/historico": { corpo: null; resposta: ConsumoHistoricoService_Ponto[] };
  "POST /contratacoes/{id}/desbloquear": { corpo: ContratacaoDtos_MotivoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "GET /contratacoes/{id}/financeiro": { corpo: null; resposta: FinanceiroDtos_FinanceiroResponse };
  "DELETE /contratacoes/{id}/isencao": { corpo: null; resposta: FinanceiroDtos_FinanceiroResponse };
  "POST /contratacoes/{id}/isencao": { corpo: FinanceiroDtos_IsentarContratacaoRequest; resposta: FinanceiroDtos_FinanceiroResponse };
  "POST /contratacoes/{id}/pagamentos": { corpo: FinanceiroDtos_RegistrarPagamentoRequest; resposta: FinanceiroDtos_FinanceiroResponse };
  "PUT /contratacoes/{id}/plano": { corpo: ContratacaoDtos_AlterarPlanoRequest; resposta: ContratacaoDtos_ContratacaoResponse };
  "POST /contratacoes/{id}/suporte": { corpo: ContratacaoDtos_MotivoRequest; resposta: IntegracaoDtos_SuporteResponse };
  "POST /contratacoes/{id}/tentar-provisionamento": { corpo: null; resposta: ContratacaoDtos_ContratacaoResponse };
  "GET /erros": { corpo: null; resposta: IntegracaoDtos_ErroLinha[] };
  "GET /financeiro/categorias": { corpo: null; resposta: FinanceiroDtos_CategoriaResponse[] };
  "POST /financeiro/categorias": { corpo: FinanceiroDtos_CategoriaRequest; resposta: FinanceiroDtos_CategoriaResponse };
  "PUT /financeiro/categorias/{id}": { corpo: FinanceiroDtos_CategoriaRequest; resposta: FinanceiroDtos_CategoriaResponse };
  "GET /financeiro/contas": { corpo: null; resposta: FinanceiroDtos_ContaResponse[] };
  "POST /financeiro/contas": { corpo: FinanceiroDtos_ContaRequest; resposta: FinanceiroDtos_ContaResponse };
  "PUT /financeiro/contas/{id}": { corpo: FinanceiroDtos_ContaRequest; resposta: FinanceiroDtos_ContaResponse };
  "GET /financeiro/movimentos": { corpo: null; resposta: FinanceiroDtos_Pagina };
  "POST /financeiro/movimentos": { corpo: FinanceiroDtos_MovimentoRequest; resposta: FinanceiroDtos_MovimentoResponse };
  "PUT /financeiro/movimentos/{id}": { corpo: FinanceiroDtos_MovimentoRequest; resposta: FinanceiroDtos_MovimentoResponse };
  "POST /financeiro/movimentos/{id}/baixar": { corpo: FinanceiroDtos_BaixaRequest; resposta: FinanceiroDtos_MovimentoResponse };
  "POST /financeiro/movimentos/{id}/cancelar": { corpo: FinanceiroDtos_VersaoRequest; resposta: FinanceiroDtos_MovimentoResponse };
  "POST /financeiro/movimentos/{id}/estornar": { corpo: FinanceiroDtos_VersaoRequest; resposta: FinanceiroDtos_MovimentoResponse };
  "GET /financeiro/resumo": { corpo: null; resposta: financeiro_FinanceiroDtos_Resumo };
  "GET /instancias": { corpo: null; resposta: InstanciasVisaoService_Pagina };
  "POST /instancias/atualizacao": { corpo: null; resposta: InstanciasVisaoService_ResultadoVarredura };
  "GET /integracao/v1/produtos/{produto}/direitos": { corpo: null; resposta: IntegracaoDtos_PaginaDireitos };
  "POST /integracao/v1/produtos/{produto}/erros": { corpo: IntegracaoDtos_LoteDeErros; resposta: IntegracaoDtos_ErrosRecebidos };
  "GET /integracao/v1/produtos/{produto}/instancias/{idExterno}/minha-conta": { corpo: null; resposta: MinhaContaDto };
  "GET /integracao/v1/saude": { corpo: null; resposta: void };
  "GET /monitoramento/metrics": { corpo: null; resposta: string };
  "GET /operadores/eu": { corpo: null; resposta: OperadorResumo };
  "GET /operadores/eu/mfa": { corpo: null; resposta: MfaService_Status };
  "POST /operadores/eu/mfa/ativar": { corpo: MfaController_Confirmacao; resposta: MfaService_Recuperacao };
  "POST /operadores/eu/mfa/desativar": { corpo: MfaController_Confirmacao; resposta: void };
  "POST /operadores/eu/mfa/preparar": { corpo: MfaController_Senha; resposta: MfaService_Preparacao };
  "PUT /operadores/eu/senha": { corpo: TrocaSenhaRequest; resposta: void };
  "GET /planos": { corpo: null; resposta: CatalogoDtos_PlanoResponse[] };
  "POST /planos": { corpo: CatalogoDtos_SalvarPlanoRequest; resposta: CatalogoDtos_PlanoResponse };
  "PUT /planos/{id}": { corpo: CatalogoDtos_SalvarPlanoRequest; resposta: CatalogoDtos_PlanoResponse };
  "POST /planos/{id}/precos": { corpo: CatalogoDtos_NovoPrecoRequest; resposta: CatalogoDtos_PlanoResponse };
  "GET /produtos": { corpo: null; resposta: CatalogoDtos_ProdutoResponse[] };
  "POST /produtos": { corpo: CatalogoDtos_SalvarProdutoRequest; resposta: CatalogoDtos_ProdutoResponse };
  "PUT /produtos/{id}": { corpo: CatalogoDtos_SalvarProdutoRequest; resposta: CatalogoDtos_ProdutoResponse };
  "GET /produtos/{id}/recursos-do-app": { corpo: null; resposta: IntegracaoDtos_RecursoDoAppResponse[] };
  "GET /recursos": { corpo: null; resposta: CatalogoDtos_RecursoResponse[] };
  "POST /recursos": { corpo: CatalogoDtos_SalvarRecursoRequest; resposta: CatalogoDtos_RecursoResponse };
  "PUT /recursos/{id}": { corpo: CatalogoDtos_SalvarRecursoRequest; resposta: CatalogoDtos_RecursoResponse };
  "POST /webhooks/mercadopago": { corpo: null; resposta: void };
}

export type RotaApi = keyof ContratoRotas;
export type CorpoApi<R extends RotaApi> = ContratoRotas[R]['corpo'];
export type RespostaApi<R extends RotaApi> = ContratoRotas[R]['resposta'];
