import { Routes } from '@angular/router';
import { authGuard } from '../core/auth/auth.guard';
import { AdminRaiz } from './admin-raiz';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminRaiz,
    children: [
      {
        path: 'login',
        title: 'Iniciar sesión · Panel Iri Travel',
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./layout/admin-layout').then((m) => m.AdminLayout),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tours' },
          {
            path: 'tours',
            title: 'Tours · Panel Iri Travel',
            loadComponent: () => import('./tours/tours-lista').then((m) => m.ToursLista),
          },
          {
            path: 'tours/nuevo',
            title: 'Nuevo tour · Panel Iri Travel',
            loadComponent: () => import('./tours/tour-form').then((m) => m.TourForm),
          },
          {
            path: 'tours/:id',
            title: 'Editar tour · Panel Iri Travel',
            loadComponent: () => import('./tours/tour-form').then((m) => m.TourForm),
          },
          {
            path: 'faqs',
            title: 'Preguntas frecuentes · Panel Iri Travel',
            loadComponent: () => import('./faqs/faqs-admin').then((m) => m.FaqsAdmin),
          },
          {
            path: 'secciones',
            title: 'Secciones · Panel Iri Travel',
            loadComponent: () =>
              import('./secciones/secciones-admin').then((m) => m.SeccionesAdmin),
          },
          {
            path: 'bloques',
            title: 'Bloques de contenido · Panel Iri Travel',
            loadComponent: () => import('./bloques/bloques-admin').then((m) => m.BloquesAdmin),
          },
          {
            path: 'ajustes',
            title: 'Ajustes del sitio · Panel Iri Travel',
            loadComponent: () => import('./ajustes/ajustes-admin').then((m) => m.AjustesAdmin),
          },
          {
            path: 'cotizaciones',
            title: 'Cotizaciones · Panel Iri Travel',
            loadComponent: () =>
              import('./cotizaciones/cotizaciones-admin').then((m) => m.CotizacionesAdmin),
          },
          {
            path: 'cuenta',
            title: 'Mi cuenta · Panel Iri Travel',
            loadComponent: () => import('./cuenta/cuenta').then((m) => m.Cuenta),
          },
        ],
      },
    ],
  },
];
