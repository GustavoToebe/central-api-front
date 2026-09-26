import {
  Cobranca, FormaPagamento, Periodicidade, SituacaoComercial, SituacaoProvisionamento, StatusCobranca, TipoCliente
} from '../../core/api/central.models';

/** Classe de cor do painel (styles.scss): verde, amarelo, vermelho ou apagado. */
export type Tom = 'bo-ok' | 'bo-warn' | 'bo-bad' | 'bo-mute';

const SITUACAO_COMERCIAL: Record<SituacaoComercial, { rotulo: string; tom: Tom }> = {
  TRIAL: { rotulo: 'Teste', tom: 'bo-warn' },
  ATIVA: { rotulo: 'Ativa', tom: 'bo-ok' },
  INADIMPLENTE: { rotulo: 'Inadimplente', tom: 'bo-warn' },
  BLOQUEADA: { rotulo: 'Bloqueada', tom: 'bo-bad' },
  CANCELADA: { rotulo: 'Cancelada', tom: 'bo-mute' }
};

const PROVISIONAMENTO: Record<SituacaoProvisionamento, { rotulo: string; tom: Tom }> = {
  PENDENTE: { rotulo: 'Aguardando envio', tom: 'bo-warn' },
  PROCESSANDO: { rotulo: 'Enviando', tom: 'bo-warn' },
  ATIVA: { rotulo: 'Criada no app', tom: 'bo-ok' },
  ERRO: { rotulo: 'Erro', tom: 'bo-bad' }
};

const STATUS_COBRANCA: Record<StatusCobranca, string> = {
  ABERTA: 'Aberta',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada'
};

const FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  DINHEIRO: 'Dinheiro',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
  OUTRO: 'Outro'
};

export const FORMAS_PAGAMENTO = Object.keys(FORMA_PAGAMENTO) as FormaPagamento[];
export const SITUACOES_INICIAIS: SituacaoComercial[] = ['TRIAL', 'ATIVA'];

export function rotuloSituacao(s: SituacaoComercial): string {
  return SITUACAO_COMERCIAL[s]?.rotulo ?? s;
}

export function tomSituacao(s: SituacaoComercial): Tom {
  return SITUACAO_COMERCIAL[s]?.tom ?? 'bo-mute';
}

/**
 * Cancelada que nunca chegou ao app não será mais enviada (o back descarta o
 * provisionamento): "Aguardando envio" ali enganaria.
 */
function naoSeraEnviada(s: SituacaoProvisionamento, comercial?: SituacaoComercial): boolean {
  return comercial === 'CANCELADA' && s !== 'ATIVA';
}

export function rotuloProvisionamento(s: SituacaoProvisionamento, comercial?: SituacaoComercial): string {
  if (naoSeraEnviada(s, comercial)) return 'Não enviada';
  return PROVISIONAMENTO[s]?.rotulo ?? s;
}

export function tomProvisionamento(s: SituacaoProvisionamento, comercial?: SituacaoComercial): Tom {
  if (naoSeraEnviada(s, comercial)) return 'bo-mute';
  return PROVISIONAMENTO[s]?.tom ?? 'bo-mute';
}

export function rotuloStatusCobranca(s: StatusCobranca, vencida: boolean): string {
  return s === 'ABERTA' && vencida ? 'Vencida' : (STATUS_COBRANCA[s] ?? s);
}

export function tomCobranca(s: StatusCobranca, vencida: boolean): Tom {
  if (s === 'PAGA') return 'bo-ok';
  if (s === 'CANCELADA') return 'bo-mute';
  return vencida ? 'bo-bad' : 'bo-warn';
}

export function rotuloFormaPagamento(f: FormaPagamento | null): string {
  return f ? (FORMA_PAGAMENTO[f] ?? f) : '—';
}

const PERIODICIDADE: Record<Periodicidade, string> = {
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual'
};

export const PERIODICIDADES = Object.keys(PERIODICIDADE) as Periodicidade[];

export function rotuloPeriodicidade(p: Periodicidade): string {
  return PERIODICIDADE[p] ?? p;
}

/** Competência como mês: `10/2026`; período de vários meses: `10/2026 a 12/2026`. */
export function competencia(inicio: string, fim: string): string {
  const mes = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
  return inicio.slice(0, 7) === fim.slice(0, 7) ? mes(inicio) : `${mes(inicio)} a ${mes(fim)}`;
}

/** `YYYY-MM` do mês seguinte ao de uma data ISO (sem data, ao mês de hoje). */
export function mesSeguinte(iso: string | null | undefined, hoje: string = hojeIso()): string {
  const base = iso ?? hoje;
  const ano = Number(base.slice(0, 4));
  const mes = Number(base.slice(5, 7));
  return mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, '0')}`;
}

export function rotuloTipoCliente(t: TipoCliente): string {
  return t === 'PJ' ? 'Pessoa jurídica' : 'Pessoa física';
}

interface EstadoDaContratacao {
  situacaoComercial: SituacaoComercial;
  situacaoProvisionamento: SituacaoProvisionamento;
  idExterno?: string | null;
  provisionamentoEditavel?: boolean;
}

/** "Tentar novamente": só depois de ERRO, sem instância criada e sem cancelamento (o back recusa o resto). */
export function podeTentarNovamente(c: EstadoDaContratacao): boolean {
  return c.situacaoProvisionamento === 'ERRO' && !c.idExterno && c.situacaoComercial !== 'CANCELADA';
}

/** Formulário de nome, slug e admin: o back decide (`provisionamentoEditavel`), cancelada nunca. */
export function podeEditarProvisionamento(c: EstadoDaContratacao): boolean {
  return !!c.provisionamentoEditavel && c.situacaoComercial !== 'CANCELADA';
}

export function podeBloquear(c: EstadoDaContratacao): boolean {
  return c.situacaoComercial !== 'BLOQUEADA' && c.situacaoComercial !== 'CANCELADA';
}

export function podeDesbloquear(c: EstadoDaContratacao): boolean {
  return c.situacaoComercial === 'BLOQUEADA';
}

export function podeCancelar(c: EstadoDaContratacao): boolean {
  return c.situacaoComercial !== 'CANCELADA';
}

/** Suporte precisa da instância criada no app. */
export function podeEntrarEmSuporte(c: EstadoDaContratacao): boolean {
  return !!c.idExterno && c.situacaoComercial !== 'CANCELADA';
}

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function dinheiro(valor: number | null | undefined): string {
  return valor == null ? '—' : MOEDA.format(Number(valor));
}

/** `2026-09-25` → `25/09/2026`; ISO com hora → data e hora locais. */
export function data(iso: string | null | undefined): string {
  if (!iso) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }
  const quando = new Date(iso);
  return Number.isNaN(quando.getTime()) ? iso : quando.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Sugestão de slug a partir do nome: minúsculas, sem acento, hífen no lugar de espaço. */
export function sugerirSlug(nome: string): string {
  return nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(p => p.length > 1);
  if (!partes.length) return '?';
  return ((partes[0][0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

/** Data de hoje em `YYYY-MM-DD` no fuso do navegador. */
export function hojeIso(agora: Date = new Date()): string {
  const m = String(agora.getMonth() + 1).padStart(2, '0');
  const d = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${m}-${d}`;
}

/** `null` para texto vazio; senão o texto aparado. */
export function textoOuNulo(v: string | null | undefined): string | null {
  const t = (v ?? '').trim();
  return t ? t : null;
}

const ACOES_HISTORICO: Record<string, string> = {
  CRIAR: 'Contratação criada',
  ADICIONAIS: 'Adicionais alterados',
  TROCA_PLANO: 'Troca de plano',
  BLOQUEAR: 'Bloqueada',
  DESBLOQUEAR: 'Desbloqueada',
  CANCELAR: 'Cancelada',
  INADIMPLENTE: 'Marcada inadimplente',
  PAGAMENTO: 'Pagamento registrado',
  ISENCAO: 'Cobrança isenta',
  DADOS_PROVISIONAMENTO: 'Nome, slug ou administrador alterados',
  PROVISIONADA: 'Instância criada no aplicativo',
  PROVISIONAMENTO_ERRO: 'Erro no provisionamento',
  PROVISIONAMENTO_DESCARTADO: 'Envio ao aplicativo descartado'
};

/** Ação do histórico em português; ação desconhecida aparece como veio. */
export function rotuloAcaoHistorico(acao: string): string {
  return ACOES_HISTORICO[acao] ?? acao;
}

/** Cobranças do vencimento mais antigo para o mais novo: a ordem em que se cobra. */
export function porVencimento(cobrancas: Cobranca[]): Cobranca[] {
  return [...cobrancas].sort((a, b) => a.vencimento.localeCompare(b.vencimento) || a.competenciaInicio.localeCompare(b.competenciaInicio));
}
