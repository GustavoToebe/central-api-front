import { Tipo } from '../financeiro/financeiro.models';

/** REALIZADO = baixados no período (data da baixa); PREVISTO = pendentes pelo vencimento. */
export type Visao = 'REALIZADO' | 'PREVISTO';

export interface LancamentoRelatorio { id: string | null; data: string; descricao: string; contaBanco: string; valor: number; }
export interface ContaContabilLinha { id: string | null; nome: string; total: number; lancamentos: LancamentoRelatorio[]; }
/** `comercial` = grupo calculado das cobranças de assinatura; não faz parte do plano de contas. */
export interface GrupoLinha { id: string | null; nome: string; comercial: boolean; total: number; contas: ContaContabilLinha[]; }
export interface PorTipo { de: string; ate: string; visao: Visao; tipo: Tipo; total: number; grupos: GrupoLinha[]; }

export interface MovimentoBanco { id: string | null; data: string; descricao: string; contaContabil: string; entrada: number; saida: number; saldo: number; }
export interface ContaBanco { id: string; nome: string; ativo: boolean; saldoAnterior: number; entradas: number; saidas: number; saldoFinal: number; movimentos: MovimentoBanco[]; }
export interface BancoCaixa { de: string; ate: string; saldoAnterior: number; entradas: number; saidas: number; saldoFinal: number; observacao: string; contas: ContaBanco[]; }

export interface Demonstrativo {
  de: string; ate: string; receitas: PorTipo; despesas: PorTipo; totalReceitas: number; totalDespesas: number; resultado: number;
  aReceber: number; aPagar: number; resultadoPrevisto: number; saldos: { id: string; nome: string; saldo: number }[];
}

export type RelatorioId = 'banco-caixa' | 'demonstrativo' | 'despesas' | 'receitas';
export interface RelatorioCatalogo { id: RelatorioId; categoria: string; titulo: string; descricao: string; }

/** Catálogo da tela Relatórios: cada item vira um cartão que abre `/relatorios/:id`. */
export const CATALOGO_RELATORIOS: RelatorioCatalogo[] = [
  { id: 'banco-caixa', categoria: 'Financeiro', titulo: 'Relatório de banco/caixa', descricao: 'Apresenta as movimentações bancárias de um período, com saldo anterior, entradas, saídas e saldo final de cada conta.' },
  { id: 'demonstrativo', categoria: 'Financeiro', titulo: 'Demonstrativo do resultado do exercício', descricao: 'Resultado das despesas e receitas e saldo das contas, por grupo e conta contábil.' },
  { id: 'despesas', categoria: 'Financeiro', titulo: 'Relatório de despesas', descricao: 'Apresenta as despesas de um período específico, por grupo e conta contábil, com cada lançamento.' },
  { id: 'receitas', categoria: 'Financeiro', titulo: 'Relatório de receitas', descricao: 'Apresenta as receitas de um período específico, inclusive as assinaturas dos aplicativos.' },
];

export function relatorioPorId(id: string): RelatorioCatalogo | undefined { return CATALOGO_RELATORIOS.find(r => r.id === id); }
