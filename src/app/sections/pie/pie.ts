import { Component, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.html',
})
export class Pie {
  protected readonly site = inject(SiteService);
}
