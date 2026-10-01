import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Raíz del módulo admin: carga una sola vez los estilos del panel (todas sus clases llevan el prefijo adm-). */
@Component({
  selector: 'app-admin-raiz',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './admin.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminRaiz {}
