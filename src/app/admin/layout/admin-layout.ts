import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { SiteService } from '../../core/services/site.service';

interface Opcion {
  ruta: string;
  etiqueta: string;
}

/** Estructura del panel: cabecera con el menú de cuenta, navegación de secciones, contenido y pie. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly site = inject(SiteService);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly boton = viewChild<ElementRef<HTMLButtonElement>>('boton');
  private readonly botonUsuario = viewChild<ElementRef<HTMLButtonElement>>('botonUsuario');

  /** Menú de secciones desplegado (solo en pantallas pequeñas, donde se abre con el botón de menú). */
  protected readonly menuAbierto = signal(false);
  protected readonly usuarioAbierto = signal(false);
  protected readonly anio = new Date().getFullYear();
  /** Nombre de la pantalla actual, para la cabecera. */
  protected readonly seccionActual = signal('');

  /** Iniciales del nombre para el avatar (decorativo: el nombre completo está al lado). */
  protected readonly iniciales = computed(() =>
    this.auth
      .nombre()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase())
      .join(''),
  );

  protected readonly opciones: Opcion[] = [
    { ruta: 'tours', etiqueta: 'Tours' },
    { ruta: 'faqs', etiqueta: 'Preguntas frecuentes' },
    { ruta: 'secciones', etiqueta: 'Secciones' },
    { ruta: 'bloques', etiqueta: 'Bloques de contenido' },
    { ruta: 'ajustes', etiqueta: 'Ajustes del sitio' },
    { ruta: 'cotizaciones', etiqueta: 'Cotizaciones' },
  ];

  private navegaciones = 0;

  constructor() {
    // Al cambiar de pantalla se cierran los menús y el foco pasa al contenido, para que teclado y
    // lector de pantalla sepan que la vista cambió (la primera carga se omite: el foco queda en el inicio).
    inject(Router)
      .events.pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((evento) => {
        this.seccionActual.set(this.nombreDeRuta(evento.urlAfterRedirects));
        this.menuAbierto.set(false);
        this.usuarioAbierto.set(false);
        if (this.navegaciones++ > 0) {
          this.document.getElementById('contenido')?.focus();
        }
      });
  }

  protected alternarMenu(): void {
    this.usuarioAbierto.set(false);
    this.menuAbierto.update((valor) => !valor);
  }

  protected alternarUsuario(): void {
    this.menuAbierto.set(false);
    this.usuarioAbierto.update((valor) => !valor);
  }

  /** Enlace "Saltar al contenido": mueve el foco al <main> sin recargar la ruta. */
  protected saltar(evento: Event): void {
    evento.preventDefault();
    this.document.getElementById('contenido')?.focus();
  }

  /** Escape cierra el menú abierto y devuelve el foco al botón que lo abrió. */
  @HostListener('document:keydown.escape')
  protected alPulsarEscape(): void {
    if (this.usuarioAbierto()) {
      this.usuarioAbierto.set(false);
      this.botonUsuario()?.nativeElement.focus();
    } else if (this.menuAbierto()) {
      this.menuAbierto.set(false);
      this.boton()?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  protected alHacerClic(evento: Event): void {
    if (this.usuarioAbierto() && !this.menuUsuario()?.contains(evento.target as Node)) {
      this.usuarioAbierto.set(false);
    }
  }

  /** Si el foco sale del menú de cuenta con Tab, se cierra. */
  @HostListener('focusout', ['$event'])
  protected alPerderFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.usuarioAbierto() && destino && !this.menuUsuario()?.contains(destino)) {
      this.usuarioAbierto.set(false);
    }
  }

  private nombreDeRuta(url: string): string {
    const ruta = url.split(/[?#]/)[0].split('/')[2] ?? '';
    return ruta === 'cuenta'
      ? 'Mi cuenta'
      : (this.opciones.find((opcion) => opcion.ruta === ruta)?.etiqueta ?? '');
  }

  private menuUsuario(): Element | null {
    return this.host.nativeElement.querySelector('.adm-usuario-menu');
  }
}
