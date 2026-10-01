import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-familias',
  templateUrl: './familias.html',
})
export class Familias {
  protected readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('familias'));
}
