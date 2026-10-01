import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-valores',
  templateUrl: './valores.html',
})
export class Valores {
  private readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('valores'));
}
