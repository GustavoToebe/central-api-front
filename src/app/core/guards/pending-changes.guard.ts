import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmacaoNavegacaoService } from './confirmacao-navegacao.service';

export interface HasPendingChanges {
  hasPendingChanges(): boolean;
}

/** Confere o formulário antes de abandonar uma rota da Central. */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = component =>
  !component.hasPendingChanges() || inject(ConfirmacaoNavegacaoService).confirmar();
