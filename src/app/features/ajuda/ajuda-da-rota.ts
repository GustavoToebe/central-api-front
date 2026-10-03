/** Qual tema da Ajuda explica cada tela. A regra mais específica (prefixo mais longo) vence. */
const REGRAS: readonly (readonly [string, string])[] = [
  ['/clientes', 'clientes'],
  ['/contratacoes', 'contratacoes'],
  ['/contratacoes/nova', 'primeiros-passos'],
  ['/instancias', 'instancias'],
  ['/cobrancas', 'cobrancas'],
  ['/financeiro', 'financeiro'],
  ['/relatorios', 'relatorios'],
  ['/logs', 'logs'],
  ['/catalogo', 'catalogo'],
  ['/meu-perfil', 'seguranca'],
  ['/ajustes', 'ajustes'],
];

/** Id do tema da Ajuda para a tela do endereço, ou null (a própria Ajuda e telas fora do painel não têm botão). */
export function ajudaDaRota(endereco: string): string | null {
  const caminho = endereco.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
  if (caminho === '/' || caminho === '/ajuda') return null;
  const partes = caminho.split('/');
  if (partes[1] === 'contratacoes' && partes[3] === 'consumo') return 'consumo';
  let melhor: readonly [string, string] | null = null;
  for (const regra of REGRAS) {
    if ((caminho === regra[0] || caminho.startsWith(regra[0] + '/')) && (!melhor || regra[0].length > melhor[0].length)) melhor = regra;
  }
  return melhor ? melhor[1] : null;
}
