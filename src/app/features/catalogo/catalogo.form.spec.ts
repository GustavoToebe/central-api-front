import {
  codigo, codigoRecurso, limitesSemValor, montarAdicionalRequest, montarPlanoRequest, montarProdutoRequest, montarRecursoRequest, precoVigente
} from './catalogo.form';

describe('catalogo.form', () => {
  it('código em maiúsculas e sem espaço', () => {
    expect(codigo(' servire ')).toBe('SERVIRE');
    expect(codigo('plano basico')).toBe('PLANO_BASICO');
  });

  it('produto: URL sem barra final e vazia vira nula', () => {
    expect(montarProdutoRequest({ codigo: 'servire', nome: ' Servire ', urlBaseIntegracao: 'https://api.servirea.com.br/', ativo: true }))
      .toEqual({ codigo: 'SERVIRE', nome: 'Servire', urlBaseIntegracao: 'https://api.servirea.com.br', ativo: true });
    expect(montarProdutoRequest({ codigo: 'x', nome: 'x', urlBaseIntegracao: ' ', ativo: false }).urlBaseIntegracao).toBeNull();
  });

  it('recurso: valor padrão só em limite', () => {
    expect(montarRecursoRequest({ produtoId: 'p1', codigo: 'voluntarios', nome: ' Voluntários ', tipo: 'LIMITE', unidade: '', valorPadrao: '100' }))
      .toEqual({ produtoId: 'p1', codigo: 'voluntarios', nome: 'Voluntários', tipo: 'LIMITE', unidade: null, valorPadrao: 100 });
    expect(montarRecursoRequest({ produtoId: 'p1', codigo: 'escalas', nome: 'Escalas', tipo: 'FUNCIONALIDADE', unidade: '', valorPadrao: '5' }).valorPadrao)
      .toBeNull();
  });

  it('plano: recursos escolhidos (funcionalidade vale 1) e só os preços preenchidos', () => {
    const corpo = montarPlanoRequest({
      produtoId: 'p1', codigo: 'pro', nome: 'Profissional', ativo: true,
      recursos: [
        { recursoId: 'r1', tipo: 'LIMITE', valor: '100' },
        { recursoId: 'r3', tipo: 'FUNCIONALIDADE', valor: '' }
      ],
      precos: { MENSAL: '49,90', TRIMESTRAL: '', ANUAL: '499' }
    });
    expect(corpo.codigo).toBe('PRO');
    expect(corpo.recursos).toEqual([{ recursoId: 'r1', valor: 100 }, { recursoId: 'r3', valor: 1 }]);
    expect(corpo.precos).toEqual([{ periodicidade: 'MENSAL', valor: 49.9 }, { periodicidade: 'ANUAL', valor: 499 }]);
  });

  it('limite adicionado sem valor impede salvar', () => {
    expect(limitesSemValor([{ recursoId: 'r1', tipo: 'LIMITE', valor: ' ' }])).toBeTrue();
    expect(limitesSemValor([{ recursoId: 'r1', tipo: 'LIMITE', valor: '10' }, { recursoId: 'r2', tipo: 'FUNCIONALIDADE', valor: '' }])).toBeFalse();
  });

  it('adicional aceita valor com vírgula', () => {
    expect(montarAdicionalRequest({ produtoId: 'p1', recursoId: 'r1', codigo: 'mais 50', nome: ' +50 ', quantidade: '50', preco: '15,00', ativo: true }))
      .toEqual({ produtoId: 'p1', recursoId: 'r1', codigo: 'MAIS_50', nome: '+50', quantidade: 50, preco: 15, ativo: true });
  });

  it('preço vigente: o mais recente da periodicidade que já começou', () => {
    const precos = [
      { id: '1', periodicidade: 'TRIMESTRAL' as const, valor: 130, vigenteDesde: '2026-01-01' },
      { id: '2', periodicidade: 'TRIMESTRAL' as const, valor: 140, vigenteDesde: '2026-09-01' },
      { id: '3', periodicidade: 'TRIMESTRAL' as const, valor: 150, vigenteDesde: '2026-12-01' },
      { id: '4', periodicidade: 'MENSAL' as const, valor: 49.9, vigenteDesde: '2026-01-01' }
    ];
    expect(precoVigente(precos, 'TRIMESTRAL', '2026-09-26')).toBe(140);
    expect(precoVigente(precos, 'MENSAL', '2026-09-26')).toBe(49.9);
    expect(precoVigente(precos, 'ANUAL', '2026-09-26')).toBeNull();
  });

  it('código do recurso mantém maiúsculas e minúsculas do app', () => {
    expect(codigoRecurso(' voluntarios ')).toBe('voluntarios');
    expect(codigoRecurso('INSCRICAO PUBLICA')).toBe('INSCRICAO_PUBLICA');
  });
});
