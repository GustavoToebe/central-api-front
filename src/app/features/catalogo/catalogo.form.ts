import { Periodicidade, Preco, SalvarAdicionalRequest, SalvarPlanoRequest, SalvarProdutoRequest, SalvarRecursoRequest, TipoRecurso } from '../../core/api/central.models';
import { valorOuNulo } from '../contratacoes/contratacao.form';
import { hojeIso, textoOuNulo } from '../comum/rotulos';

/** Códigos em maiúsculas, sem espaço (o app pede exatamente `SERVIRE`). */
export function codigo(texto: string): string {
  return texto.trim().toUpperCase().replace(/\s+/g, '_');
}

export function montarProdutoRequest(f: { codigo: string; nome: string; urlBaseIntegracao: string; ativo: boolean }): SalvarProdutoRequest {
  const url = textoOuNulo(f.urlBaseIntegracao);
  return { codigo: codigo(f.codigo), nome: f.nome.trim(), urlBaseIntegracao: url ? url.replace(/\/+$/, '') : null, ativo: f.ativo };
}

/**
 * Código do recurso fica como o aplicativo usa (`voluntarios`, `ESCALAS`): em maiúsculas
 * nunca casaria com o que o app lê nos direitos. Só troca espaço por `_`.
 */
export function codigoRecurso(texto: string): string {
  return texto.trim().replace(/\s+/g, '_');
}

/** Valor padrão só vai para LIMITE (o back ignora nos outros). */
export function montarRecursoRequest(f: {
  produtoId: string; codigo: string; nome: string; tipo: TipoRecurso; unidade: string; valorPadrao: string;
}): SalvarRecursoRequest {
  return {
    produtoId: f.produtoId, codigo: codigoRecurso(f.codigo), nome: f.nome.trim(), tipo: f.tipo, unidade: textoOuNulo(f.unidade),
    valorPadrao: f.tipo === 'LIMITE' ? valorOuNulo(f.valorPadrao) : null
  };
}

/** Recurso escolhido para o plano: limite com valor, funcionalidade só pela presença. */
export interface LinhaRecursoDoPlano {
  recursoId: string;
  tipo: TipoRecurso;
  valor: string;
}

/** Limite sem valor ainda não pode ser salvo (o operador adicionou e esqueceu de preencher). */
export function limitesSemValor(linhas: LinhaRecursoDoPlano[]): boolean {
  return linhas.some(l => l.tipo === 'LIMITE' && valorOuNulo(l.valor) == null);
}

/**
 * Plano com os recursos escolhidos (funcionalidade vale 1) e os preços por
 * periodicidade; preço vazio fica de fora e não muda o que já existe.
 */
export function montarPlanoRequest(f: {
  produtoId: string; codigo: string; nome: string; ativo: boolean;
  recursos: LinhaRecursoDoPlano[];
  precos: Partial<Record<Periodicidade, string>>;
}): SalvarPlanoRequest {
  const recursos = f.recursos.flatMap(r => {
    if (r.tipo === 'FUNCIONALIDADE') return [{ recursoId: r.recursoId, valor: 1 }];
    const valor = valorOuNulo(r.valor);
    return valor == null ? [] : [{ recursoId: r.recursoId, valor }];
  });
  const precos = (Object.entries(f.precos) as [Periodicidade, string][]).flatMap(([periodicidade, texto]) => {
    const valor = valorOuNulo(texto);
    return valor == null ? [] : [{ periodicidade, valor }];
  });
  return { produtoId: f.produtoId, codigo: codigo(f.codigo), nome: f.nome.trim(), ativo: f.ativo, recursos, precos };
}

export function montarAdicionalRequest(f: {
  produtoId: string; recursoId: string; codigo: string; nome: string; quantidade: string; preco: string; ativo: boolean;
}): SalvarAdicionalRequest {
  return {
    produtoId: f.produtoId, recursoId: f.recursoId, codigo: codigo(f.codigo), nome: f.nome.trim(),
    quantidade: valorOuNulo(f.quantidade) ?? 0, preco: valorOuNulo(f.preco) ?? 0, ativo: f.ativo
  };
}

/** Preço em vigor numa data: o mais recente da periodicidade que já começou (mesma regra do back). */
export function precoVigente(precos: Preco[], periodicidade: Periodicidade, hoje: string = hojeIso()): number | null {
  const vigentes = precos
    .filter(p => p.periodicidade === periodicidade && p.vigenteDesde <= hoje)
    .sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde));
  return vigentes.length ? vigentes[0].valor : null;
}
