import { HttpErrorResponse } from '@angular/common/http';

interface CuerpoError {
  mensaje?: string;
  detalles?: string[];
}

/** Convierte un error HTTP en un mensaje legible para el administrador. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No hay conexión con el servidor';
    }
    const cuerpo = error.error as CuerpoError | null;
    if (cuerpo?.mensaje) {
      const detalles = cuerpo.detalles?.length ? `: ${cuerpo.detalles.join('; ')}` : '';
      return `${cuerpo.mensaje}${detalles}`;
    }
    // Respuestas de Nginx (sin cuerpo JSON de la API)
    if (error.status === 429) {
      return 'Demasiados intentos. Espera un minuto y vuelve a intentarlo';
    }
    if (error.status === 413) {
      return 'El archivo supera el tamaño máximo permitido';
    }
  }
  return 'Ocurrió un error inesperado';
}
