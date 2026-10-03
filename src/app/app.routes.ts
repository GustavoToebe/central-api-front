import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
      { path: 'clientes', loadComponent: () => import('./features/clientes/clientes-list.component').then(m => m.ClientesListComponent) },
      { path: 'clientes/novo', loadComponent: () => import('./features/clientes/cliente-form.component').then(m => m.ClienteFormComponent) },
      { path: 'clientes/:id/editar', loadComponent: () => import('./features/clientes/cliente-form.component').then(m => m.ClienteFormComponent) },
      { path: 'clientes/:id', loadComponent: () => import('./features/clientes/cliente-detalhe.component').then(m => m.ClienteDetalheComponent) },
      { path: 'instancias', loadComponent: () => import('./features/instancias/instancias.component').then(m => m.InstanciasComponent) },
      { path: 'contratacoes', loadComponent: () => import('./features/contratacoes/contratacoes-list.component').then(m => m.ContratacoesListComponent) },
      { path: 'contratacoes/nova', loadComponent: () => import('./features/contratacoes/contratacao-form.component').then(m => m.ContratacaoFormComponent) },
      { path: 'contratacoes/:id/consumo', loadComponent: () => import('./features/consumo/consumo.component').then(m => m.ConsumoComponent) },
      { path: 'contratacoes/:id', loadComponent: () => import('./features/contratacoes/contratacao-detalhe.component').then(m => m.ContratacaoDetalheComponent) },
      { path: 'meu-perfil', loadComponent: () => import('./features/perfil/meu-perfil.component').then(m => m.MeuPerfilComponent) },
      { path: 'ajustes', loadComponent: () => import('./features/ajustes/ajustes.component').then(m => m.AjustesComponent) },
      { path: 'ajuda', loadComponent: () => import('./features/ajuda/ajuda.component').then(m => m.AjudaComponent) },
      { path: 'logs', loadComponent: () => import('./features/logs/logs.component').then(m => m.LogsComponent) },
      { path: 'contas-bancarias', loadComponent: () => import('./features/financeiro/contas-bancarias.component').then(m => m.ContasBancariasComponent) },
      { path: 'financeiro', loadComponent: () => import('./features/financeiro/financeiro.component').then(m => m.FinanceiroComponent) },
      { path: 'relatorios', loadComponent: () => import('./features/relatorios/relatorios.component').then(m => m.RelatoriosComponent) },
      { path: 'relatorios/:tipo', loadComponent: () => import('./features/relatorios/relatorio-financeiro.component').then(m => m.RelatorioFinanceiroComponent) },
      { path: 'cobrancas', loadComponent: () => import('./features/cobrancas/cobrancas.component').then(m => m.CobrancasComponent) },
      { path: 'catalogo/produtos', loadComponent: () => import('./features/catalogo/produtos.component').then(m => m.ProdutosComponent) },
      { path: 'catalogo/recursos', loadComponent: () => import('./features/catalogo/recursos.component').then(m => m.RecursosComponent) },
      { path: 'catalogo/planos', loadComponent: () => import('./features/catalogo/planos.component').then(m => m.PlanosComponent) },
      { path: 'catalogo/adicionais', loadComponent: () => import('./features/catalogo/adicionais.component').then(m => m.AdicionaisComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
