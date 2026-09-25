import { HttpErrorResponse } from '@angular/common/http';

/** Corpo de erro da Central (`ApiError`), com `codigo` estável para decidir na tela. */
export interface ApiErro {
  status: number;
  message?: string;
  codigo?: string;
  fieldErrors?: { field: string; message: string }[];
}

/** Mensagem para o operador: a da API, a do primeiro campo inválido ou o texto padrão. */
export function mensagemApi(erro: unknown, padrao: string): string {
  if (erro instanceof HttpErrorResponse) {
    const corpo = erro.error as ApiErro | null;
    const campo = corpo?.fieldErrors?.[0]?.message;
    if (campo) return campo;
    if (corpo?.message) return corpo.message;
    if (erro.status === 0) return 'Não foi possível falar com a API da Central. Confira se ela está no ar.';
  }
  if (erro instanceof Error && erro.message) return erro.message;
  return padrao;
}

/** Código estável do erro (`PROVISIONAMENTO_NAO_EDITAVEL`, `CONFLITO`…), se veio. */
export function codigoApi(erro: unknown): string | null {
  if (erro instanceof HttpErrorResponse) {
    return (erro.error as ApiErro | null)?.codigo ?? null;
  }
  return null;
}
