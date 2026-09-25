import { NovoPrecoRequest, Periodicidade, SalvarAdicionalRequest, SalvarPlanoRequest, SalvarProdutoRequest, SalvarRecursoRequest, TipoRecurso } from '../../core/api/central.models';
import { valorOuNulo } from '../contratacoes/contratacao.form';
import { textoOuNulo } from '../comum/rotulos';

/** Códigos em maiúsculas, sem espaço (o app pede exatamente `SERVIRE`). */
export function codigo(texto: string): string {
  return texto.trim().toUpperCase().replace(/\s+/g, '_');
}

export function montarProdutoRequest(f: { codigo: string; nome: string; urlBaseIntegracao: string; ativo: boolean }): SalvarProdutoRequest {
  const url = textoOuNulo(f.urlBaseIntegracao);
  return { codigo: codigo(f.codigo), nome: f.nome.trim(), urlBaseIntegracao: url ? url.replace(/\/+$/, '') : null, ativo: f.ativo };
}

export function montarRecursoRequest(f: { produtoId: string; codigo: string; nome: string; tipo: TipoRecurso; unidade: string }): SalvarRecursoRequest {
  return { produtoId: f.produtoId, codigo: codigo(f.codigo), nome: f.nome.trim(), tipo: f.tipo, unidade: textoOuNulo(f.unidade) };
}

/** Recurso sem valor fica de fora do plano; funcionalidade marcada vale 1. */
export function montarPlanoRequest(f: {
  produtoId: string; codigo: string; nome: string; ativo: boolean;
  recursos: { recursoId: string; tipo: TipoRecurso; valor: string; marcado: boolean }[];
}): SalvarPlanoRequest {
  const recursos = f.recursos.flatMap(r => {
    if (r.tipo === 'FUNCIONALIDADE') return r.marcado ? [{ recursoId: r.recursoId, valor: 1 }] : [];
    const valor = valorOuNulo(r.valor);
    return valor == null ? [] : [{ recursoId: r.recursoId, valor }];
  });
  return { produtoId: f.produtoId, codigo: codigo(f.codigo), nome: f.nome.trim(), ativo: f.ativo, recursos };
}

export function montarPrecoRequest(f: { periodicidade: Periodicidade; valor: string; vigenteDesde: string }): NovoPrecoRequest {
  return { periodicidade: f.periodicidade, valor: valorOuNulo(f.valor) ?? 0, vigenteDesde: f.vigenteDesde };
}

export function montarAdicionalRequest(f: {
  produtoId: string; recursoId: string; codigo: string; nome: string; quantidade: string; preco: string; ativo: boolean;
}): SalvarAdicionalRequest {
  return {
    produtoId: f.produtoId, recursoId: f.recursoId, codigo: codigo(f.codigo), nome: f.nome.trim(),
    quantidade: valorOuNulo(f.quantidade) ?? 0, preco: valorOuNulo(f.preco) ?? 0, ativo: f.ativo
  };
}
