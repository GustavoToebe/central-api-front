import { Selecao } from './selecao';

describe('Selecao', () => {
  let sel: Selecao;

  beforeEach(() => { sel = new Selecao(); });

  it('marca e desmarca um item', () => {
    sel.alternar('a');
    expect(sel.marcado('a')).toBeTrue();
    sel.alternar('a');
    expect(sel.marcado('a')).toBeFalse();
  });

  it('marcarTodos → desmarcar um → alguns', () => {
    const ids = ['a', 'b', 'c'];
    sel.marcarTodos(ids, true);
    expect(sel.todos(ids)).toBeTrue();
    sel.alternar('b');
    expect(sel.alguns(ids)).toBeTrue();
    expect(sel.todos(ids)).toBeFalse();
  });

  it('id fora da lista visível não é contado em quantidade/todos/alguns', () => {
    sel.alternar('x'); // marca x, mas não está na lista visível
    const ids = ['a', 'b'];
    expect(sel.quantidade(ids)).toBe(0);
    expect(sel.todos(ids)).toBeFalse();
    expect(sel.alguns(ids)).toBeFalse();
  });

  it('todos retorna false com lista vazia', () => {
    expect(sel.todos([])).toBeFalse();
  });

  it('limpar remove tudo', () => {
    sel.alternar('a');
    sel.limpar();
    expect(sel.marcado('a')).toBeFalse();
  });

  it('marcadosEm mantém a ordem e exclui ids fora da lista visível', () => {
    sel.alternar('b');
    sel.alternar('c');
    sel.alternar('z'); // fora da lista visível
    const itens = [
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'c', v: 3 }
    ];
    const resultado = sel.marcadosEm(itens, ['a', 'b', 'c']);
    expect(resultado.map(i => i.id)).toEqual(['b', 'c']);
  });
});
