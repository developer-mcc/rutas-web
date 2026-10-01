import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CotizacionAdmin } from '../../core/models/admin.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';

@Component({
  selector: 'app-cotizaciones-admin',
  imports: [DatePipe],
  templateUrl: './cotizaciones-admin.html',
})
export class CotizacionesAdmin {
  private readonly api = inject(AdminApiService);

  protected readonly cotizaciones = signal<CotizacionAdmin[]>([]);
  protected readonly soloPendientes = signal(true);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly visibles = computed(() =>
    this.soloPendientes() ? this.cotizaciones().filter((c) => !c.atendida) : this.cotizaciones(),
  );

  protected readonly pendientes = computed(
    () => this.cotizaciones().filter((c) => !c.atendida).length,
  );

  constructor() {
    this.api.listarCotizaciones().subscribe({
      next: (cotizaciones) => {
        this.cotizaciones.set(cotizaciones);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }

  protected cambiarAtendida(cotizacion: CotizacionAdmin, evento: Event): void {
    const atendida = (evento.target as HTMLInputElement).checked;
    this.api.marcarAtendida(cotizacion.id, atendida).subscribe({
      next: (actualizada) =>
        this.cotizaciones.update((lista) =>
          lista.map((c) => (c.id === actualizada.id ? actualizada : c)),
        ),
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }
}
