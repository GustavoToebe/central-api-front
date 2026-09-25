/**
 * Sessão do operador no navegador. O access token (15 min) fica no
 * sessionStorage; o refresh token fica só no cookie httpOnly
 * `central_refresh_token`, que o JS não lê.
 */
export interface OperadorResumo {
  id: string;
  nome: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresInSeconds: number;
  operador: OperadorResumo;
}

const TOKEN_KEY = 'central_access';
const OPERADOR_KEY = 'central_operador';

export function tokenAtual(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function operadorAtual(): OperadorResumo | null {
  const bruto = sessionStorage.getItem(OPERADOR_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as OperadorResumo;
  } catch {
    return null;
  }
}

export function guardarSessao(resposta: LoginResponse): void {
  sessionStorage.setItem(TOKEN_KEY, resposta.accessToken);
  sessionStorage.setItem(OPERADOR_KEY, JSON.stringify(resposta.operador));
}

export function limparSessao(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(OPERADOR_KEY);
}
