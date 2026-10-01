import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-tipos-viajero',
  templateUrl: './tipos-viajero.html',
})
export class TiposViajero {
  protected readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('tipos-viajero'));
}
