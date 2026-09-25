import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { centralAuthInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([centralAuthInterceptor]),
      // O XSRF nativo do Angular ignora URL absoluta (a API é outra origem);
      // quem manda X-XSRF-TOKEN é o interceptor (core/auth/xsrf.ts).
      withNoXsrfProtection()
    )
  ]
};
