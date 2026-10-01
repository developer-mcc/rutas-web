import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ajustes, Bloque, CotizacionRequest, Faq, Seccion, Tour } from '../models/api.models';

/** Acceso HTTP a la API pública. Las URL son relativas: Nginx (o el proxy en desarrollo) enruta /api. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  secciones(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.base}/secciones`);
  }

  ajustes(): Observable<Ajustes> {
    return this.http.get<Ajustes>(`${this.base}/ajustes`);
  }

  bloques(): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`${this.base}/bloques`);
  }

  tours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.base}/tours`);
  }

  faqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.base}/faqs`);
  }

  registrarCotizacion(solicitud: CotizacionRequest): Observable<unknown> {
    return this.http.post(`${this.base}/cotizaciones`, solicitud);
  }
}
