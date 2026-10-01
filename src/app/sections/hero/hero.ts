import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
})
export class Hero {
  protected readonly site = inject(SiteService);
  protected readonly chips = computed(() => this.site.bloquesDe('hero'));
}
