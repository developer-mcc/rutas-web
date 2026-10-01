import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((modulo) => modulo.adminRoutes),
  },
  {
    path: '',
    title: 'Iri Travel Perú',
    loadComponent: () => import('./pages/home/home').then((modulo) => modulo.Home),
  },
  { path: '**', redirectTo: '' },
];
