import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const PREFIJO_ADMIN = '/api/admin';

/** Añade el token a las llamadas de administración y cierra la sesión si el servidor responde 401. */
export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  if (!peticion.url.startsWith(PREFIJO_ADMIN)) {
    return siguiente(peticion);
  }
  const auth = inject(AuthService);
  const token = auth.token();
  const conToken = token
    ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : peticion;
  return siguiente(conToken).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.cerrarSesion();
      }
      return throwError(() => error);
    }),
  );
};
