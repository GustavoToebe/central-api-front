import {
  AdicionalContratado, AlterarPlanoRequest, AtualizarProvisionamentoRequest, CriarContratacaoRequest, Periodicidade,
  RegistrarPagamentoRequest, FormaPagamento, SituacaoComercial
} from '../../core/api/central.models';
import { textoOuNulo } from '../comum/rotulos';

export interface ContratacaoForm {
  clienteId: string;
  produtoId: string;
  planoId: string;
  periodicidade: Periodicidade;
  /** Vazio = preço vigente do plano. */
  valor: string;
  diaVencimento: number;
  inicio: string;
  situacaoComercial: SituacaoComercial;
  nomeInstancia: string;
  slugInstancia: string;
  adminNome: string;
  adminEmail: string;
  observacoes: string;
  adicionais: { adicionalId: string; quantidade: number }[];
}

/** Valor digitado em reais (`1.234,56`, `1234.56` ou vazio) → número, ou nulo. */
export function valorOuNulo(texto: string | number | null | undefined): number | null {
  if (texto == null) return null;
  if (typeof texto === 'number') return Number.isFinite(texto) ? texto : null;
  const limpo = texto.trim().replace(/\s|R\$/g, '');
  if (!limpo) return null;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

/** Soma quantidades do mesmo adicional e descarta linha sem adicional ou com quantidade ≤ 0. */
export function adicionaisValidos(linhas: { adicionalId: string; quantidade: number }[]): AdicionalContratado[] {
  const somados = new Map<string, number>();
  for (const l of linhas) {
    const qtd = Number(l.quantidade);
    if (!l.adicionalId || !(qtd > 0)) continue;
    somados.set(l.adicionalId, (somados.get(l.adicionalId) ?? 0) + qtd);
  }
  return [...somados].map(([adicionalId, quantidade]) => ({ adicionalId, quantidade }));
}

export function montarContratacaoRequest(f: ContratacaoForm): CriarContratacaoRequest {
  return {
    clienteId: f.clienteId,
    produtoId: f.produtoId,
    planoId: f.planoId,
    periodicidade: f.periodicidade,
    valor: valorOuNulo(f.valor),
    diaVencimento: Number(f.diaVencimento),
    inicio: f.inicio,
    situacaoComercial: f.situacaoComercial,
    nomeInstancia: f.nomeInstancia.trim(),
    slugInstancia: f.slugInstancia.trim().toLowerCase(),
    adminNome: f.adminNome.trim(),
    adminEmail: f.adminEmail.trim().toLowerCase(),
    observacoes: textoOuNulo(f.observacoes),
    adicionais: adicionaisValidos(f.adicionais)
  };
}

export function montarProvisionamentoRequest(f: {
  nomeInstancia: string; slugInstancia: string; adminNome: string; adminEmail: string;
}): AtualizarProvisionamentoRequest {
  return {
    nomeInstancia: f.nomeInstancia.trim(),
    slugInstancia: f.slugInstancia.trim().toLowerCase(),
    adminNome: f.adminNome.trim(),
    adminEmail: f.adminEmail.trim().toLowerCase()
  };
}

export function montarTrocaDePlano(f: {
  planoId: string; periodicidade: Periodicidade; valor: string; diaVencimento: number; aPartirDe: string; motivo: string;
}): AlterarPlanoRequest {
  return {
    planoId: f.planoId,
    periodicidade: f.periodicidade,
    valor: valorOuNulo(f.valor),
    diaVencimento: Number(f.diaVencimento),
    aPartirDe: f.aPartirDe,
    motivo: textoOuNulo(f.motivo)
  };
}

export function montarPagamento(f: {
  cobrancaIds: string[]; pagoEm: string; formaPagamento: FormaPagamento; valorPago: string; observacao: string;
}): RegistrarPagamentoRequest {
  return {
    cobrancaIds: [...new Set(f.cobrancaIds)],
    pagoEm: f.pagoEm,
    formaPagamento: f.formaPagamento,
    valorPago: valorOuNulo(f.valorPago),
    observacao: textoOuNulo(f.observacao)
  };
}
