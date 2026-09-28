/**
 * Gerenciamento de seleção de linhas de uma lista (PLANO-002).
 * Trabalha sempre sobre a lista **visível** passada como parâmetro,
 * para que ids fora da lista visível não sejam contados.
 */
export class Selecao {
  private readonly _marcados = new Set<string>();

  /** Alterna a seleção de um item. */
  alternar(id: string): void {
    if (this._marcados.has(id)) this._marcados.delete(id);
    else this._marcados.add(id);
  }

  /** Retorna `true` se o id está marcado. */
  marcado(id: string): boolean {
    return this._marcados.has(id);
  }

  /**
   * Marca ou desmarca todos os ids fornecidos.
   * Ids fora dessa lista não são afetados.
   */
  marcarTodos(ids: string[], marcar: boolean): void {
    for (const id of ids) {
      if (marcar) this._marcados.add(id);
      else this._marcados.delete(id);
    }
  }

  /** Quantidade de ids da lista visível que estão marcados. */
  quantidade(ids: string[]): number {
    return ids.filter(id => this._marcados.has(id)).length;
  }

  /** `true` se todos os ids da lista estão marcados. `false` com lista vazia. */
  todos(ids: string[]): boolean {
    return ids.length > 0 && ids.every(id => this._marcados.has(id));
  }

  /** `true` se alguns (mas não todos) ids da lista estão marcados. */
  alguns(ids: string[]): boolean {
    const q = this.quantidade(ids);
    return q > 0 && q < ids.length;
  }

  /** Remove todas as seleções. */
  limpar(): void {
    this._marcados.clear();
  }

  /**
   * Filtra `itens` mantendo a ordem, retornando apenas os que têm `id` marcado
   * e cujo `id` está na lista visível fornecida.
   */
  marcadosEm<T extends { id: string }>(itens: T[], idsVisiveis: string[]): T[] {
    const visivelSet = new Set(idsVisiveis);
    return itens.filter(item => this._marcados.has(item.id) && visivelSet.has(item.id));
  }
}
