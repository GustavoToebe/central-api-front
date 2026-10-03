/** Seções do painel: agrupam as telas por assunto no menu lateral, no menu completo e na busca. */
export type SecaoId = 'comercial' | 'financeiro' | 'operacao' | 'catalogo' | 'orientacoes' | 'conta';

export interface SecaoNav { id: SecaoId; titulo: string; }

export const SECOES: SecaoNav[] = [
  { id: 'comercial', titulo: 'Comercial' },
  { id: 'financeiro', titulo: 'Financeiro' },
  { id: 'operacao', titulo: 'Operação' },
  { id: 'catalogo', titulo: 'Catálogo' },
  { id: 'orientacoes', titulo: 'Orientações' },
  { id: 'conta', titulo: 'Minha conta' },
];

/** Uma tela ou atalho que o operador pode abrir. `noMenu` = aparece no menu lateral; os demais só na busca e no menu completo. */
export interface TelaNav {
  id: string;
  rotulo: string;
  url: string;
  consulta?: Record<string, string>;
  secao: SecaoId;
  noMenu: boolean;
  /** Palavras que o operador pode digitar para achar a tela (sinônimos). */
  palavras?: string;
}

export const TODAS_AS_TELAS: TelaNav[] = [
  { id: '/clientes', rotulo: 'Clientes', url: '/clientes', secao: 'comercial', noMenu: true, palavras: 'paróquia quem paga cadastro documento' },
  { id: '/contratacoes', rotulo: 'Contratações', url: '/contratacoes', secao: 'comercial', noMenu: true, palavras: 'assinatura plano instância contrato' },
  { id: '/instancias', rotulo: 'Instâncias', url: '/instancias', secao: 'comercial', noMenu: true, palavras: 'consumo limite paróquia painel' },
  { id: '/cobrancas', rotulo: 'Cobranças', url: '/cobrancas', secao: 'comercial', noMenu: true, palavras: 'pagamento mensalidade vencimento baixa' },
  { id: '/financeiro', rotulo: 'Financeiro', url: '/financeiro', secao: 'financeiro', noMenu: true, palavras: 'dinheiro despesa receita caixa banco' },
  { id: '/contas-bancarias', rotulo: 'Contas bancárias', url: '/contas-bancarias', secao: 'financeiro', noMenu: true, palavras: 'banco caixa conta saldo' },
  { id: '/relatorios', rotulo: 'Relatórios', url: '/relatorios', secao: 'financeiro', noMenu: true, palavras: 'imprimir csv planilha período' },
  { id: '/logs', rotulo: 'Logs', url: '/logs', secao: 'operacao', noMenu: true, palavras: 'erro servidor requestid falha' },
  { id: '/catalogo/produtos', rotulo: 'Produtos', url: '/catalogo/produtos', secao: 'catalogo', noMenu: true, palavras: 'aplicativo servirea integração' },
  { id: '/catalogo/recursos', rotulo: 'Recursos', url: '/catalogo/recursos', secao: 'catalogo', noMenu: true, palavras: 'limite funcionalidade' },
  { id: '/catalogo/planos', rotulo: 'Planos e preços', url: '/catalogo/planos', secao: 'catalogo', noMenu: true, palavras: 'valor mensal anual preço' },
  { id: '/catalogo/adicionais', rotulo: 'Adicionais', url: '/catalogo/adicionais', secao: 'catalogo', noMenu: true, palavras: 'extra complemento' },
  { id: '/ajuda', rotulo: 'Ajuda', url: '/ajuda', secao: 'orientacoes', noMenu: true, palavras: 'manual dúvida como funciona suporte' },
  // Atalhos (não estão no menu lateral):
  { id: 'clientes/novo', rotulo: 'Novo cliente', url: '/clientes/novo', secao: 'comercial', noMenu: false, palavras: 'cadastrar cliente paróquia' },
  { id: 'contratacoes/nova', rotulo: 'Nova contratação', url: '/contratacoes/nova', secao: 'comercial', noMenu: false, palavras: 'criar assinatura instância provisionar' },
  { id: 'financeiro?lancamentos', rotulo: 'Lançamentos financeiros', url: '/financeiro', consulta: { aba: 'lancamentos' }, secao: 'financeiro', noMenu: false, palavras: 'despesa receita baixa pagamento provisão' },
  { id: 'financeiro?plano', rotulo: 'Plano de contas', url: '/financeiro', consulta: { aba: 'plano-de-contas' }, secao: 'financeiro', noMenu: false, palavras: 'grupo conta contábil categoria' },
  { id: 'relatorios/banco-caixa', rotulo: 'Relatório de banco/caixa', url: '/relatorios/banco-caixa', secao: 'financeiro', noMenu: false, palavras: 'movimentação bancária saldo' },
  { id: 'relatorios/demonstrativo', rotulo: 'Demonstrativo do resultado do exercício', url: '/relatorios/demonstrativo', secao: 'financeiro', noMenu: false, palavras: 'resultado dre lucro' },
  { id: 'relatorios/despesas', rotulo: 'Relatório de despesas', url: '/relatorios/despesas', secao: 'financeiro', noMenu: false, palavras: 'gastos custos' },
  { id: 'relatorios/receitas', rotulo: 'Relatório de receitas', url: '/relatorios/receitas', secao: 'financeiro', noMenu: false, palavras: 'faturamento assinaturas entradas' },
  { id: 'meu-perfil', rotulo: 'Meus dados', url: '/meu-perfil', secao: 'conta', noMenu: false, palavras: 'perfil senha mfa segundo fator' },
  { id: 'ajustes', rotulo: 'Ajustes', url: '/ajustes', secao: 'conta', noMenu: false, palavras: 'tema contraste configuração' },
];

export function tituloDaSecao(id: SecaoId): string { return SECOES.find(s => s.id === id)?.titulo ?? ''; }

/** Agrupa as telas por seção, na ordem de SECOES, sem seções vazias. */
export function agruparPorSecao(telas: readonly TelaNav[]): { secao: SecaoNav; telas: TelaNav[] }[] {
  return SECOES.map(secao => ({ secao, telas: telas.filter(t => t.secao === secao.id) })).filter(g => g.telas.length);
}

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Busca por todas as palavras digitadas (sem acento e sem diferença de caixa) no nome, nos sinônimos e na seção.
 * Quem começa com o termo vem primeiro, depois quem contém no nome, depois o resto.
 */
export function buscarTelas(telas: readonly TelaNav[], termo: string): TelaNav[] {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (!palavras.length) return [];
  const completo = normalizar(termo);
  const pontuar = (t: TelaNav) => {
    const nome = normalizar(t.rotulo);
    return nome.startsWith(completo) ? 0 : nome.includes(completo) ? 1 : 2;
  };
  return telas
    .filter(t => {
      const alvo = normalizar(`${t.rotulo} ${t.palavras ?? ''} ${tituloDaSecao(t.secao)}`);
      return palavras.every(p => alvo.includes(p));
    })
    .map((t, i) => ({ t, p: pontuar(t), i }))
    .sort((a, b) => a.p - b.p || a.i - b.i)
    .map(x => x.t);
}

/** Tela que corresponde ao endereço atual: caminho e consulta iguais; senão, a de caminho mais longo que seja prefixo. */
export function telaDoEndereco(telas: readonly TelaNav[], endereco: string): TelaNav | null {
  const [caminho, resto = ''] = endereco.split('#')[0].split('?');
  const consulta = new URLSearchParams(resto);
  const exata = telas.find(t => t.url === caminho && t.consulta && Object.entries(t.consulta).every(([k, v]) => consulta.get(k) === v));
  if (exata) return exata;
  const candidatas = telas.filter(t => !t.consulta && (caminho === t.url || caminho.startsWith(t.url + '/')));
  return candidatas.sort((a, b) => b.url.length - a.url.length)[0] ?? null;
}
