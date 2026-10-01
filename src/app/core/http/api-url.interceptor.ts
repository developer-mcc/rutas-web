import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const PREFIJO_API = '/api/';

/** Antepone la dirección de la API (environment.apiUrl) a las llamadas relativas /api/... */
export const apiUrlInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  if (!environment.apiUrl || !peticion.url.startsWith(PREFIJO_API)) {
    return siguiente(peticion);
  }
  return siguiente(peticion.clone({ url: `${environment.apiUrl}${peticion.url}` }));
};
