import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, OperadorResumo, guardarSessao, limparSessao, operadorAtual, tokenAtual } from './sessao';
import { cabecalhoXsrf } from './xsrf';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!tokenAtual();
  }

  operador(): OperadorResumo | null {
    return operadorAtual();
  }

  async login(email: string, senha: string): Promise<void> {
    const resposta = await firstValueFrom(this.http.post<LoginResponse>(
      `${this.api}/auth/login`, { email: email.trim(), senha }, { withCredentials: true }));
    guardarSessao(resposta);
  }

  /**
   * Aba nova sem token, mas com o cookie de refresh ainda válido: renova em
   * silêncio. O interceptor manda o X-XSRF-TOKEN. Sem o cookie CENTRAL-XSRF-TOKEN a
   * Central recusa o refresh (403), então nem tenta: vai direto ao login.
   */
  renovarSilencioso(): Observable<boolean> {
    if (!Object.keys(cabecalhoXsrf()).length) return of(false);
    return this.http.post<LoginResponse>(`${this.api}/auth/refresh`, {}, { withCredentials: true }).pipe(
      map(resposta => {
        guardarSessao(resposta);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }));
    } catch {
      // A sessão local sai mesmo se o servidor já tiver derrubado o cookie.
    } finally {
      limparSessao();
    }
  }
}
