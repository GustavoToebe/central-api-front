import {
  competencia, data, dinheiro, hojeIso, iniciais, mesSeguinte, rotuloPeriodicidade, podeBloquear, podeCancelar, podeDesbloquear, podeEditarProvisionamento,
  podeEntrarEmSuporte, podeTentarNovamente, porVencimento, rotuloAcaoHistorico, rotuloFormaPagamento, rotuloProvisionamento,
  rotuloSituacao, rotuloStatusCobranca, sugerirSlug, textoOuNulo, tomCobranca, tomProvisionamento, tomSituacao
} from './rotulos';

describe('rotulos', () => {
  it('traduz situação comercial com o tom certo', () => {
    expect(rotuloSituacao('TRIAL')).toBe('Teste');
    expect(tomSituacao('ATIVA')).toBe('bo-ok');
    expect(tomSituacao('INADIMPLENTE')).toBe('bo-warn');
    expect(tomSituacao('BLOQUEADA')).toBe('bo-bad');
    expect(tomSituacao('CANCELADA')).toBe('bo-mute');
  });

  it('traduz provisionamento', () => {
    expect(rotuloProvisionamento('ATIVA')).toBe('Criada no app');
    expect(rotuloProvisionamento('ERRO')).toBe('Erro');
    expect(tomProvisionamento('ERRO')).toBe('bo-bad');
    expect(tomProvisionamento('PROCESSANDO')).toBe('bo-warn');
  });

  it('cancelada que não chegou ao app aparece como não enviada', () => {
    expect(rotuloProvisionamento('PENDENTE', 'CANCELADA')).toBe('Não enviada');
    expect(tomProvisionamento('ERRO', 'CANCELADA')).toBe('bo-mute');
    expect(rotuloProvisionamento('ATIVA', 'CANCELADA')).toBe('Criada no app');
    expect(rotuloProvisionamento('PENDENTE', 'ATIVA')).toBe('Aguardando envio');
    expect(rotuloAcaoHistorico('PROVISIONAMENTO_DESCARTADO')).toBe('Envio ao aplicativo descartado');
  });

  it('cobrança aberta e vencida aparece como vencida, em vermelho', () => {
    expect(rotuloStatusCobranca('ABERTA', true)).toBe('Vencida');
    expect(tomCobranca('ABERTA', true)).toBe('bo-bad');
    expect(rotuloStatusCobranca('ABERTA', false)).toBe('Aberta');
    expect(tomCobranca('PAGA', false)).toBe('bo-ok');
    expect(rotuloFormaPagamento('CARTAO_CREDITO')).toBe('Cartão de crédito');
    expect(rotuloFormaPagamento(null)).toBe('—');
  });

  describe('Tentar novamente', () => {
    it('só aparece com ERRO, sem instância criada e sem cancelamento', () => {
      expect(podeTentarNovamente({ situacaoComercial: 'TRIAL', situacaoProvisionamento: 'ERRO', idExterno: null })).toBeTrue();
      expect(podeTentarNovamente({ situacaoComercial: 'TRIAL', situacaoProvisionamento: 'PENDENTE', idExterno: null })).toBeFalse();
      expect(podeTentarNovamente({ situacaoComercial: 'TRIAL', situacaoProvisionamento: 'ERRO', idExterno: 't1' })).toBeFalse();
      expect(podeTentarNovamente({ situacaoComercial: 'CANCELADA', situacaoProvisionamento: 'ERRO', idExterno: null })).toBeFalse();
    });
  });

  describe('editar nome, slug e admin', () => {
    it('segue o provisionamentoEditavel do back e nunca em cancelada', () => {
      expect(podeEditarProvisionamento({ situacaoComercial: 'TRIAL', situacaoProvisionamento: 'ERRO', provisionamentoEditavel: true })).toBeTrue();
      expect(podeEditarProvisionamento({ situacaoComercial: 'TRIAL', situacaoProvisionamento: 'PROCESSANDO', provisionamentoEditavel: false })).toBeFalse();
      expect(podeEditarProvisionamento({ situacaoComercial: 'CANCELADA', situacaoProvisionamento: 'PENDENTE', provisionamentoEditavel: true })).toBeFalse();
    });
  });

  it('ações conforme a situação', () => {
    const ativa = { situacaoComercial: 'ATIVA' as const, situacaoProvisionamento: 'ATIVA' as const, idExterno: 't1' };
    const bloqueada = { ...ativa, situacaoComercial: 'BLOQUEADA' as const };
    const cancelada = { ...ativa, situacaoComercial: 'CANCELADA' as const };
    expect(podeBloquear(ativa)).toBeTrue();
    expect(podeBloquear(bloqueada)).toBeFalse();
    expect(podeDesbloquear(bloqueada)).toBeTrue();
    expect(podeDesbloquear(ativa)).toBeFalse();
    expect(podeCancelar(cancelada)).toBeFalse();
    expect(podeEntrarEmSuporte(bloqueada)).toBeTrue();
    expect(podeEntrarEmSuporte({ ...ativa, idExterno: null })).toBeFalse();
    expect(podeEntrarEmSuporte(cancelada)).toBeFalse();
  });

  it('formata dinheiro e datas em pt-BR', () => {
    expect(dinheiro(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
    expect(dinheiro(null)).toBe('—');
    expect(data('2026-09-25')).toBe('25/09/2026');
    expect(data(null)).toBe('—');
    expect(data('2026-09-25T12:00:00Z')).toContain('25/09/2026');
  });

  it('sugere slug sem acento nem espaço', () => {
    expect(sugerirSlug('Paróquia São José Operário')).toBe('paroquia-sao-jose-operario');
    expect(sugerirSlug('  --Santa   Maria!! ')).toBe('santa-maria');
  });

  it('iniciais, data de hoje e texto vazio', () => {
    expect(iniciais('Lucas Fernando')).toBe('LF');
    expect(iniciais('Ana')).toBe('A');
    expect(iniciais('')).toBe('?');
    expect(hojeIso(new Date(2026, 8, 5))).toBe('2026-09-05');
    expect(textoOuNulo('  ')).toBeNull();
    expect(textoOuNulo(' x ')).toBe('x');
  });

  it('ordena cobranças do vencimento mais antigo para o mais novo', () => {
    const cb = (id: string, vencimento: string) => ({
      id, contratacaoId: 'k', competenciaInicio: vencimento, competenciaFim: vencimento, vencimento, valor: 1,
      status: 'ABERTA' as const, vencida: false, pagoEm: null, valorPago: null, formaPagamento: null, observacao: null
    });
    const lista = [cb('out', '2026-10-10'), cb('set', '2026-09-25'), cb('nov', '2026-11-10')];
    expect(porVencimento(lista).map(c => c.id)).toEqual(['set', 'out', 'nov']);
    expect(lista[0].id).toBe('out');
  });

  it('traduz as ações do histórico e mantém as desconhecidas', () => {
    expect(rotuloAcaoHistorico('PROVISIONADA')).toBe('Instância criada no aplicativo');
    expect(rotuloAcaoHistorico('TROCA_PLANO')).toBe('Troca de plano');
    expect(rotuloAcaoHistorico('NOVA_ACAO')).toBe('NOVA_ACAO');
  });

  it('competência como mês e período de vários meses', () => {
    expect(competencia('2026-10-01', '2026-10-31')).toBe('10/2026');
    expect(competencia('2026-10-01', '2026-12-31')).toBe('10/2026 a 12/2026');
    expect(competencia('2026-09-01', '2027-08-31')).toBe('09/2026 a 08/2027');
  });

  it('mês seguinte vira o ano em dezembro e usa hoje sem data', () => {
    expect(mesSeguinte('2026-10-31')).toBe('2026-11');
    expect(mesSeguinte('2026-12-31')).toBe('2027-01');
    expect(mesSeguinte(undefined, '2026-09-26')).toBe('2026-10');
  });

  it('traduz as quatro periodicidades', () => {
    expect(rotuloPeriodicidade('MENSAL')).toBe('Mensal');
    expect(rotuloPeriodicidade('TRIMESTRAL')).toBe('Trimestral');
    expect(rotuloPeriodicidade('SEMESTRAL')).toBe('Semestral');
    expect(rotuloPeriodicidade('ANUAL')).toBe('Anual');
  });
});
