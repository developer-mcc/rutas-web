import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AjusteAdmin,
  BloqueRequest,
  CambioAjuste,
  CotizacionAdmin,
  FaqRequest,
  ImagenSubida,
  Perfil,
  PerfilRequest,
  SeccionRequest,
  TourRequest,
} from '../models/admin.models';
import { Bloque, Faq, Seccion, Tour } from '../models/api.models';

/** Acceso HTTP a la API de administración (/api/admin/**). El interceptor añade el token. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin';

  // Tours
  listarTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.base}/tours`);
  }

  obtenerTour(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.base}/tours/${id}`);
  }

  crearTour(tour: TourRequest): Observable<Tour> {
    return this.http.post<Tour>(`${this.base}/tours`, tour);
  }

  actualizarTour(id: number, tour: TourRequest): Observable<Tour> {
    return this.http.put<Tour>(`${this.base}/tours/${id}`, tour);
  }

  eliminarTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tours/${id}`);
  }

  // Preguntas frecuentes
  listarFaqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.base}/faqs`);
  }

  crearFaq(faq: FaqRequest): Observable<Faq> {
    return this.http.post<Faq>(`${this.base}/faqs`, faq);
  }

  actualizarFaq(id: number, faq: FaqRequest): Observable<Faq> {
    return this.http.put<Faq>(`${this.base}/faqs/${id}`, faq);
  }

  eliminarFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/faqs/${id}`);
  }

  // Secciones
  listarSecciones(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.base}/secciones`);
  }

  actualizarSeccion(codigo: string, seccion: SeccionRequest): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.base}/secciones/${codigo}`, seccion);
  }

  // Bloques
  listarBloques(seccion: string): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`${this.base}/bloques`, {
      params: new HttpParams().set('seccion', seccion),
    });
  }

  crearBloque(bloque: BloqueRequest): Observable<Bloque> {
    return this.http.post<Bloque>(`${this.base}/bloques`, bloque);
  }

  actualizarBloque(id: number, bloque: BloqueRequest): Observable<Bloque> {
    return this.http.put<Bloque>(`${this.base}/bloques/${id}`, bloque);
  }

  eliminarBloque(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/bloques/${id}`);
  }

  reordenarBloques(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.base}/bloques/orden`, { ids });
  }

  // Ajustes
  listarAjustes(): Observable<AjusteAdmin[]> {
    return this.http.get<AjusteAdmin[]>(`${this.base}/ajustes`);
  }

  guardarAjustes(ajustes: CambioAjuste[]): Observable<AjusteAdmin[]> {
    return this.http.put<AjusteAdmin[]>(`${this.base}/ajustes`, { ajustes });
  }

  // Cotizaciones
  listarCotizaciones(): Observable<CotizacionAdmin[]> {
    return this.http.get<CotizacionAdmin[]>(`${this.base}/cotizaciones`);
  }

  marcarAtendida(id: number, atendida: boolean): Observable<CotizacionAdmin> {
    return this.http.patch<CotizacionAdmin>(`${this.base}/cotizaciones/${id}`, { atendida });
  }

  // Imágenes y cuenta
  subirImagen(archivo: File): Observable<ImagenSubida> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<ImagenSubida>(`${this.base}/imagenes`, datos);
  }

  perfil(): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.base}/perfil`);
  }

  actualizarPerfil(solicitud: PerfilRequest): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.base}/perfil`, solicitud);
  }

  cambiarPassword(actual: string, nueva: string): Observable<void> {
    return this.http.put<void>(`${this.base}/password`, { actual, nueva });
  }
}
