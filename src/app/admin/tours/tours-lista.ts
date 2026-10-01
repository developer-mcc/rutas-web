import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tour } from '../../core/models/api.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { formatearPrecio } from '../../core/util/precio';
import { EnfocarAlCrear, RetornarFoco } from '../shared/foco';

@Component({
  selector: 'app-tours-lista',
  imports: [RouterLink, EnfocarAlCrear, RetornarFoco],
  templateUrl: './tours-lista.html',
})
export class ToursLista {
  private readonly api = inject(AdminApiService);

  protected readonly tours = signal<Tour[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly confirmando = signal<number | null>(null);

  constructor() {
    this.cargar();
  }

  protected precio(tour: Tour): string {
    return formatearPrecio(tour.precioDesde, tour.moneda);
  }

  protected eliminar(tour: Tour): void {
    this.confirmando.set(null);
    this.error.set('');
    this.api.eliminarTour(tour.id).subscribe({
      next: () => {
        this.mensaje.set(
          `"${tour.nombre}" se eliminó. Si tenía cotizaciones, solo se desactivó para conservarlas.`,
        );
        this.cargar();
      },
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  private cargar(): void {
    this.api.listarTours().subscribe({
      next: (tours) => {
        this.tours.set(tours);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }
}
