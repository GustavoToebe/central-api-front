/** Espelho dos DTOs do `central-api-back` (pacotes `comercial/dto` e `integracao`). */

export type TipoCliente = 'PF' | 'PJ';
export type TipoRecurso = 'LIMITE' | 'FUNCIONALIDADE';
export type Periodicidade = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
export type SituacaoComercial = 'TRIAL' | 'ATIVA' | 'INADIMPLENTE' | 'BLOQUEADA' | 'CANCELADA';
export type SituacaoProvisionamento = 'PENDENTE' | 'PROCESSANDO' | 'ATIVA' | 'ERRO';
export type StatusCobranca = 'ABERTA' | 'PAGA' | 'CANCELADA';
export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'OUTRO';

// ---- Clientes

export interface Contato {
  nome: string;
  email: string | null;
  telefone: string | null;
  principal: boolean;
}

export interface ContatoResponse extends Contato {
  id: string;
}

export interface SalvarClienteRequest {
  tipo: TipoCliente;
  documento: string;
  nome: string;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  contatos: Contato[];
}

export interface Cliente extends Omit<SalvarClienteRequest, 'contatos'> {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  contatos: ContatoResponse[];
}

// ---- Catálogo

export interface Produto {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  codigo: string;
  nome: string;
  urlBaseIntegracao: string | null;
  ativo: boolean;
}

export interface SalvarProdutoRequest {
  codigo: string;
  nome: string;
  urlBaseIntegracao: string | null;
  ativo: boolean;
}

export interface Recurso {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  produtoId: string;
  codigo: string;
  nome: string;
  tipo: TipoRecurso;
  unidade: string | null;
  /** Só LIMITE: vem preenchido quando o recurso entra num plano. */
  valorPadrao: number | null;
}

export interface SalvarRecursoRequest {
  produtoId: string;
  codigo: string;
  nome: string;
  tipo: TipoRecurso;
  unidade: string | null;
  valorPadrao: number | null;
}

export interface RecursoDoPlano {
  recursoId: string;
  codigo: string;
  tipo: TipoRecurso;
  valor: number;
}

export interface Preco {
  id: string;
  periodicidade: Periodicidade;
  valor: number;
  vigenteDesde: string;
}

export interface Plano {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  produtoId: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  /** Preço em vigor hoje; periodicidade sem preço não aparece. */
  precosVigentes: { periodicidade: Periodicidade; valor: number }[];
  recursos: RecursoDoPlano[];
  precos: Preco[];
}

export interface SalvarPlanoRequest {
  produtoId: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  recursos: { recursoId: string; valor: number }[];
  /** Vale a partir de hoje; periodicidade fora da lista não muda. */
  precos: { periodicidade: Periodicidade; valor: number }[];
}

export interface NovoPrecoRequest {
  periodicidade: Periodicidade;
  valor: number;
  vigenteDesde: string;
}

export interface Adicional {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  produtoId: string;
  recursoId: string;
  recursoCodigo: string;
  codigo: string;
  nome: string;
  quantidade: number;
  preco: number;
  ativo: boolean;
}

export interface SalvarAdicionalRequest {
  produtoId: string;
  recursoId: string;
  codigo: string;
  nome: string;
  quantidade: number;
  preco: number;
  ativo: boolean;
}

// ---- Contratações

export interface AdicionalContratado {
  adicionalId: string;
  quantidade: number;
}

export interface CriarContratacaoRequest {
  clienteId: string;
  produtoId: string;
  planoId: string;
  periodicidade: Periodicidade;
  valor: number | null;
  diaVencimento: number;
  inicio: string;
  situacaoComercial: SituacaoComercial | null;
  nomeInstancia: string;
  slugInstancia: string;
  adminNome: string;
  adminEmail: string;
  observacoes: string | null;
  adicionais: AdicionalContratado[];
}

export interface AtualizarProvisionamentoRequest {
  nomeInstancia: string;
  slugInstancia: string;
  adminNome: string;
  adminEmail: string;
}

export interface AlterarPlanoRequest {
  planoId: string;
  periodicidade: Periodicidade;
  valor: number | null;
  diaVencimento: number;
  aPartirDe: string;
  motivo: string | null;
}

export interface ContratacaoResumo {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  clienteId: string;
  clienteNome: string;
  produtoId: string;
  produtoCodigo: string;
  planoId: string;
  planoCodigo: string;
  periodicidade: Periodicidade;
  valor: number;
  diaVencimento: number;
  vigenteAte: string | null;
  situacaoComercial: SituacaoComercial;
  situacaoProvisionamento: SituacaoProvisionamento;
  versaoDireitos: number;
  acessoLiberado: boolean;
  nomeInstancia: string;
  slugInstancia: string;
}

export interface Direitos {
  contratacaoId: string;
  clienteId: string;
  produto: string;
  tenantId: string | null;
  versao: number;
  situacao: string;
  acessoLiberado: boolean;
  motivoBloqueio: string | null;
  vigenteAte: string | null;
  plano: { codigo: string; nome: string } | null;
  limites: Record<string, number>;
  funcionalidades: string[];
  geradoEm: string;
}

export interface AdicionalContratadoResponse {
  adicionalId: string;
  codigo: string;
  recursoCodigo: string;
  quantidadeUnitaria: number;
  quantidade: number;
}

export interface Historico {
  id: string;
  acao: string;
  motivo: string | null;
  operadorId: string | null;
  versaoDireitos: number;
  criadoEm: string;
}

export interface Contratacao {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  clienteId: string;
  produtoId: string;
  produtoCodigo: string;
  planoId: string;
  planoCodigo: string;
  planoNome: string;
  periodicidade: Periodicidade;
  valor: number;
  diaVencimento: number;
  inicio: string;
  vigenteAte: string | null;
  situacaoComercial: SituacaoComercial;
  situacaoProvisionamento: SituacaoProvisionamento;
  idempotencyKey: string;
  idExterno: string | null;
  provisionamentoEditavel: boolean;
  nomeInstancia: string;
  slugInstancia: string;
  adminNome: string;
  adminEmail: string;
  versaoDireitos: number;
  direitos: Direitos;
  adicionais: AdicionalContratadoResponse[];
  historico: Historico[];
}

export interface Suporte {
  codigo: string;
  urlAcesso: string;
  expiraEm: string;
}

// ---- Financeiro

export interface Cobranca {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  contratacaoId: string;
  competenciaInicio: string;
  competenciaFim: string;
  vencimento: string;
  valor: number;
  status: StatusCobranca;
  vencida: boolean;
  pagoEm: string | null;
  valorPago: number | null;
  formaPagamento: FormaPagamento | null;
  observacao: string | null;
}

export interface Financeiro {
  cobrancas: Cobranca[];
  resumo: {
    vencidas: number;
    diasAtraso: number;
    valorEmAtraso: number;
    proximoVencimento: string | null;
    totalPagoNoAno: number;
  };
}

export interface RegistrarPagamentoRequest {
  cobrancaIds: string[];
  pagoEm: string;
  formaPagamento: FormaPagamento;
  valorPago: number | null;
  observacao: string | null;
}

// ---- Cobranças (lista geral e detalhe)

/** Todos opcionais; `situacao` aceita também `VENCIDA` (aberta com vencimento passado). */
export interface FiltroCobrancas {
  produtoId?: string;
  situacao?: StatusCobranca | 'VENCIDA' | '';
  formaPagamento?: FormaPagamento | '';
  vencimentoDe?: string;
  vencimentoAte?: string;
  /** `YYYY-MM` */
  competencia?: string;
  busca?: string;
}

export interface CobrancaLinha {
  /** Número curto para ditar e copiar. */
  sequencial: number;
  id: string;
  contratacaoId: string;
  clienteId: string;
  clienteNome: string;
  produtoCodigo: string;
  nomeInstancia: string;
  planoNome: string;
  periodicidade: Periodicidade;
  competenciaInicio: string;
  competenciaFim: string;
  vencimento: string;
  valor: number;
  status: StatusCobranca;
  vencida: boolean;
  pagoEm: string | null;
  valorPago: number | null;
  formaPagamento: FormaPagamento | null;
}

export interface CobrancaItem {
  tipo: 'PLANO' | 'ADICIONAL';
  descricao: string;
  quantidade: number;
  /** PLANO: preço do período. ADICIONAL: preço mensal do pacote. */
  valorUnitario: number;
  meses: number;
  valor: number;
}

export interface CobrancaDetalhe {
  cobranca: CobrancaLinha;
  observacao: string | null;
  itens: CobrancaItem[];
}

/** Sugestão do aplicativo para a tela de Recursos (contrato 5.5). */
export interface RecursoDoApp {
  codigo: string;
  nome: string;
  tipo: TipoRecurso;
  unidade: string | null;
  /** O app já faz valer o limite/funcionalidade. */
  aplicado: boolean;
  /** Já existe recurso com este código exato no produto. */
  cadastrado: boolean;
}

// ---- Logs de erro dos aplicativos (contrato 6.2)

export interface FiltroErros {
  produtoId?: string;
  contratacaoId?: string;
  /** `YYYY-MM-DD`, pela data em que ocorreu. */
  de?: string;
  ate?: string;
  busca?: string;
}

export interface ErroAplicativo {
  id: string;
  ocorridoEm: string;
  produtoCodigo: string;
  contratacaoId: string | null;
  clienteNome: string | null;
  nomeInstancia: string | null;
  tenantId: string | null;
  /** Só o id: a Central não guarda nome nem e-mail de usuário dos apps. */
  usuarioId: string | null;
  metodo: string | null;
  rota: string | null;
  status: number;
  codigo: string | null;
  mensagem: string | null;
  requestId: string | null;
}
