import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';
import { Cabecera } from '../../sections/cabecera/cabecera';
import { Confianza } from '../../sections/confianza/confianza';
import { Confort } from '../../sections/confort/confort';
import { Cotizador } from '../../sections/cotizador/cotizador';
import { Faq } from '../../sections/faq/faq';
import { Familias } from '../../sections/familias/familias';
import { FlotanteWhatsapp } from '../../sections/flotante-whatsapp/flotante-whatsapp';
import { Hero } from '../../sections/hero/hero';
import { Pie } from '../../sections/pie/pie';
import { Promo } from '../../sections/promo/promo';
import { TiposViajero } from '../../sections/tipos-viajero/tipos-viajero';
import { Tours } from '../../sections/tours/tours';
import { Valores } from '../../sections/valores/valores';

/** Página pública: pinta las secciones visibles en el orden que define el admin. */
@Component({
  selector: 'app-home',
  imports: [
    Cabecera,
    Hero,
    Valores,
    TiposViajero,
    Tours,
    Promo,
    Familias,
    Confort,
    Confianza,
    Cotizador,
    Faq,
    Pie,
    FlotanteWhatsapp,
  ],
  templateUrl: './home.html',
})
export class Home {
  protected readonly site = inject(SiteService);

  /** Secciones del contenido principal; el pie va aparte, fuera de <main>, y siempre al final. */
  protected readonly cuerpo = computed(() =>
    this.site.seccionesVisibles().filter((seccion) => seccion.codigo !== 'footer'),
  );
  protected readonly conPie = computed(() =>
    this.site.seccionesVisibles().some((seccion) => seccion.codigo === 'footer'),
  );
}
