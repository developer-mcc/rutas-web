import { Component, computed, inject, input } from '@angular/core';
import { Tour } from '../../core/models/api.models';
import { SiteService } from '../../core/services/site.service';
import { formatearPrecio } from '../../core/util/precio';

/** Tarjeta de un tour. El host no genera caja propia para que el <article> sea el elemento de la grilla. */
@Component({
  selector: 'app-tour-card',
  host: { style: 'display: contents' },
  templateUrl: './tour-card.html',
})
export class TourCard {
  protected readonly site = inject(SiteService);
  readonly tour = input.required<Tour>();

  protected readonly precio = computed(() =>
    formatearPrecio(this.tour().precioDesde, this.tour().moneda),
  );

  protected readonly whatsapp = computed(() =>
    this.site.whatsappUrl(
      this.site.texto('whatsapp.mensaje_tour').replace('{tour}', this.tour().nombre),
    ),
  );
}
