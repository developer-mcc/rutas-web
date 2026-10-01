import { Component, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

/** Botón flotante de WhatsApp, siempre visible. */
@Component({
  selector: 'app-flotante-whatsapp',
  templateUrl: './flotante-whatsapp.html',
})
export class FlotanteWhatsapp {
  protected readonly site = inject(SiteService);
}
