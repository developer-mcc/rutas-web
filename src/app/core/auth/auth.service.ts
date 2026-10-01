import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, Sesion } from '../models/admin.models';

const CLAVE_SESION = 'iri.sesion';

/** Sesión del administrador. El token vive solo en sessionStorage y se descarta al expirar. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesion = signal<Sesion | null>(this.leerSesion());

  readonly nombre = computed(() => this.sesion()?.nombreCompleto ?? '');

  autenticado(): boolean {
    const actual = this.sesion();
    return actual !== null && actual.expiraEn > Date.now();
  }

  token(): string | null {
    return this.autenticado() ? (this.sesion()?.token ?? null) : null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', { username, password })
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  /** Refresca el nombre mostrado cuando el usuario edita su perfil (la sesión guarda una copia). */
  actualizarNombre(nombreCompleto: string): void {
    const actual = this.sesion();
    if (actual) {
      this.guardarSesionActual({ ...actual, nombreCompleto });
    }
  }

  cerrarSesion(): void {
    this.sesion.set(null);
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // sessionStorage no disponible: la sesión ya se descartó en memoria
    }
    void this.router.navigate(['/admin/login']);
  }

  private guardarSesion(respuesta: LoginResponse): void {
    const nueva: Sesion = {
      token: respuesta.token,
      username: respuesta.username,
      nombreCompleto: respuesta.nombreCompleto,
      expiraEn: Date.now() + respuesta.expiraEnSegundos * 1000,
    };
    this.guardarSesionActual(nueva);
  }

  private guardarSesionActual(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // sin sessionStorage la sesión dura solo mientras la página siga abierta
    }
  }

  private leerSesion(): Sesion | null {
    try {
      const guardada = sessionStorage.getItem(CLAVE_SESION);
      const sesion = guardada ? (JSON.parse(guardada) as Sesion) : null;
      return sesion && sesion.expiraEn > Date.now() ? sesion : null;
    } catch {
      return null;
    }
  }
}
