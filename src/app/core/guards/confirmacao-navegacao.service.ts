import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmacaoNavegacaoService {
  readonly aberto = signal(false);
  private resolver?: (descartar: boolean) => void;
  private componenteAtivo?: { hasPendingChanges(): boolean };

  registrar(component: unknown): void {
    this.componenteAtivo = component && typeof (component as { hasPendingChanges?: unknown }).hasPendingChanges === 'function'
      ? component as { hasPendingChanges(): boolean } : undefined;
  }

  antesDeFechar(evento: BeforeUnloadEvent): void {
    if (this.componenteAtivo?.hasPendingChanges()) evento.preventDefault();
  }

  confirmar(): Promise<boolean> {
    if (this.resolver) return Promise.resolve(false);
    this.aberto.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  responder(descartar: boolean): void {
    const resolver = this.resolver;
    this.resolver = undefined;
    this.aberto.set(false);
    resolver?.(descartar);
  }
}
