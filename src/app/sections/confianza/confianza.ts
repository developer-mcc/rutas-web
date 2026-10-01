import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-confianza',
  templateUrl: './confianza.html',
})
export class Confianza {
  protected readonly site = inject(SiteService);
  protected readonly items = computed(() => this.site.bloquesDe('confianza'));
}
