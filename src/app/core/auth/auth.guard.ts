import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/** Com token segue; sem token tenta renovar pelo cookie; senão, login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return auth.renovarSilencioso().pipe(
    map(renovou => renovou ? true : router.createUrlTree(['/login']))
  );
};
