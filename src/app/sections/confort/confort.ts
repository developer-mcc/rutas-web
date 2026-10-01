import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-confort',
  templateUrl: './confort.html',
})
export class Confort {
  protected readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('confort'));
}
