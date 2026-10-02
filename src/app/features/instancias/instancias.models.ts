export type NivelInstancia = 'CRITICO' | 'ATENCAO' | 'OK' | 'SEM_DADOS';
export interface AlertaInstancia { codigo: string; nome: string; estado: string; usado: number | null; limite: number | null; }
export interface Instancia {
  contratacaoId: string; sequencial: number | null; cliente: string; instancia: string; plano: string;
  situacaoComercial: string; nivel: NivelInstancia; defasado: boolean; consultadoEm: string | null; alertas: AlertaInstancia[];
}
export interface PaginaInstancias {
  itens: Instancia[]; total: number; pagina: number; tamanho: number;
  porNivel: Record<NivelInstancia, number>; defasadas: number;
}
export interface ResultadoAtualizacao { consultadas: number; falhas: number; restantesSemDadosOuDefasadas: number; }
