import { Component, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.html',
})
export class Faq {
  protected readonly site = inject(SiteService);
}
