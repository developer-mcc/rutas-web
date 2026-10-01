import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SeccionRequest } from '../../core/models/admin.models';
import { Seccion } from '../../core/models/api.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';

@Component({
  selector: 'app-secciones-admin',
  templateUrl: './secciones-admin.html',
})
export class SeccionesAdmin {
  private readonly api = inject(AdminApiService);

  protected readonly secciones = signal<Seccion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.cargar();
  }

  protected cambiarVisible(seccion: Seccion, evento: Event): void {
    this.actualizar(seccion, { visible: (evento.target as HTMLInputElement).checked });
  }

  protected cambiarNombre(seccion: Seccion, evento: Event): void {
    const nombre = (evento.target as HTMLInputElement).value.trim();
    if (nombre && nombre !== seccion.nombre) {
      this.actualizar(seccion, { nombre });
    }
  }

  /** Intercambia el orden con la sección vecina. */
  protected mover(indice: number, desplazamiento: number): void {
    const lista = this.secciones();
    const actual = lista[indice];
    const vecina = lista[indice + desplazamiento];
    if (!actual || !vecina) {
      return;
    }
    forkJoin([
      this.api.actualizarSeccion(actual.codigo, this.solicitud(actual, { orden: vecina.orden })),
      this.api.actualizarSeccion(vecina.codigo, this.solicitud(vecina, { orden: actual.orden })),
    ]).subscribe({
      next: () => this.cargar(),
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  private actualizar(seccion: Seccion, cambios: Partial<SeccionRequest>): void {
    this.error.set('');
    this.api.actualizarSeccion(seccion.codigo, this.solicitud(seccion, cambios)).subscribe({
      next: () => this.cargar(),
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargar();
      },
    });
  }

  private solicitud(seccion: Seccion, cambios: Partial<SeccionRequest>): SeccionRequest {
    return {
      nombre: seccion.nombre,
      visible: seccion.visible,
      orden: seccion.orden,
      ...cambios,
    };
  }

  private cargar(): void {
    this.api.listarSecciones().subscribe({
      next: (secciones) => {
        this.secciones.set(secciones);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }
}
