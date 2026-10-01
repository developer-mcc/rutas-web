import { Component, inject } from '@angular/core';
import { SiteService } from '../../core/services/site.service';
import { TourCard } from './tour-card';

@Component({
  selector: 'app-tours',
  imports: [TourCard],
  templateUrl: './tours.html',
})
export class Tours {
  protected readonly site = inject(SiteService);
}
