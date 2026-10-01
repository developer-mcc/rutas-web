import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-promo',
  templateUrl: './promo.html',
})
export class Promo {
  protected readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('promo'));
}
