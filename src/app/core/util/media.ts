import { environment } from '../../../environments/environment';

const PREFIJO_UPLOADS = '/uploads/';

/**
 * Las imágenes propias se guardan como ruta relativa (/uploads/archivo.jpg). Cuando la API está en
 * otro dominio (producción) se les antepone su dirección; las URL https externas quedan intactas.
 */
export function urlMedia(ruta: string | null | undefined): string {
  if (!ruta) {
    return '';
  }
  return ruta.startsWith(PREFIJO_UPLOADS) ? `${environment.apiUrl}${ruta}` : ruta;
}
