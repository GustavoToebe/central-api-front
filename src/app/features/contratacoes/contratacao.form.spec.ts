import {
  ContratacaoForm, adicionaisValidos, montarContratacaoRequest, montarPagamento, montarProvisionamentoRequest,
  montarTrocaDePlano, valorOuNulo
} from './contratacao.form';

describe('contratacao.form', () => {
  const base: ContratacaoForm = {
    clienteId: 'c1', produtoId: 'p1', planoId: 'pl1', periodicidade: 'MENSAL', valor: '', diaVencimento: 10,
    inicio: '2026-10-01', situacaoComercial: 'TRIAL', nomeInstancia: ' Paróquia São José ', slugInstancia: ' Sao-Jose ',
    adminNome: ' Lucas ', adminEmail: ' LUCAS@X.COM ', observacoes: ' ', adicionais: []
  };

  it('lê valor em reais nos formatos comuns', () => {
    expect(valorOuNulo('')).toBeNull();
    expect(valorOuNulo('  ')).toBeNull();
    expect(valorOuNulo('49,90')).toBe(49.9);
    expect(valorOuNulo('1.234,56')).toBe(1234.56);
    expect(valorOuNulo('R$ 1.234,56')).toBe(1234.56);
    expect(valorOuNulo('1234.56')).toBe(1234.56);
    expect(valorOuNulo('abc')).toBeNull();
    expect(valorOuNulo(12)).toBe(12);
    expect(valorOuNulo(null)).toBeNull();
  });

  it('soma adicionais repetidos e descarta linhas inválidas', () => {
    expect(adicionaisValidos([
      { adicionalId: 'a1', quantidade: 1 }, { adicionalId: '', quantidade: 3 }, { adicionalId: 'a2', quantidade: 0 },
      { adicionalId: 'a1', quantidade: 2 }
    ])).toEqual([{ adicionalId: 'a1', quantidade: 3 }]);
  });

  it('monta a contratação: valor vazio vira nulo (preço do plano), slug e e-mail em minúsculas', () => {
    const corpo = montarContratacaoRequest({ ...base, adicionais: [{ adicionalId: 'a1', quantidade: 2 }] });
    expect(corpo.valor).toBeNull();
    expect(corpo.nomeInstancia).toBe('Paróquia São José');
    expect(corpo.slugInstancia).toBe('sao-jose');
    expect(corpo.adminNome).toBe('Lucas');
    expect(corpo.adminEmail).toBe('lucas@x.com');
    expect(corpo.observacoes).toBeNull();
    expect(corpo.diaVencimento).toBe(10);
    expect(corpo.adicionais).toEqual([{ adicionalId: 'a1', quantidade: 2 }]);
    expect(montarContratacaoRequest({ ...base, valor: '99,90' }).valor).toBe(99.9);
  });

  it('monta a edição do provisionamento', () => {
    expect(montarProvisionamentoRequest({ nomeInstancia: ' A ', slugInstancia: ' B-C ', adminNome: ' D ', adminEmail: ' E@F.COM ' }))
      .toEqual({ nomeInstancia: 'A', slugInstancia: 'b-c', adminNome: 'D', adminEmail: 'e@f.com' });
  });

  it('monta a troca de plano', () => {
    expect(montarTrocaDePlano({ planoId: 'pl2', periodicidade: 'ANUAL', valor: '', diaVencimento: 5, aPartirDe: '2026-11-01', motivo: ' ' }))
      .toEqual({ planoId: 'pl2', periodicidade: 'ANUAL', valor: null, diaVencimento: 5, aPartirDe: '2026-11-01', motivo: null });
  });

  it('monta o pagamento sem cobrança repetida', () => {
    expect(montarPagamento({ cobrancaIds: ['a', 'b', 'a'], pagoEm: '2026-09-25', formaPagamento: 'PIX', valorPago: '100', observacao: '' }))
      .toEqual({ cobrancaIds: ['a', 'b'], pagoEm: '2026-09-25', formaPagamento: 'PIX', valorPago: 100, observacao: null });
  });
});
