import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SiteService } from '../../core/services/site.service';

/** Ancho (px) por encima del cual el menú se muestra en línea; debe coincidir con el @media del CSS. */
const ANCHO_ESCRITORIO = 900;

/** Barra superior y menú de navegación (botón de menú en pantallas pequeñas). */
@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.html',
})
export class Cabecera {
  protected readonly site = inject(SiteService);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly boton = viewChild<ElementRef<HTMLButtonElement>>('boton');

  private readonly destruir = inject(DestroyRef);

  /** Enlaces del menú: la clave del texto editable y el id de la sección a la que llevan. */
  protected readonly enlaces = [
    { id: 'tours', clave: 'nav.tours' },
    { id: 'familias', clave: 'nav.familias' },
    { id: 'confort', clave: 'nav.confort' },
    { id: 'cotizar', clave: 'nav.cotizar' },
  ];

  /** Sección que se está viendo (resalta su enlace en el menú). */
  protected readonly activa = signal('');
  protected readonly abierto = signal(false);

  constructor() {
    afterNextRender(() => this.observarSecciones());
  }
  protected readonly etiquetaBoton = computed(() =>
    this.abierto()
      ? this.site.texto('nav.menu_cerrar') || 'Cerrar menú'
      : this.site.texto('nav.menu_abrir') || 'Abrir menú',
  );

  protected alternar(): void {
    this.abierto.update((valor) => !valor);
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  /** Escape cierra el menú y devuelve el foco al botón que lo abrió. */
  @HostListener('document:keydown.escape')
  protected alPulsarEscape(): void {
    if (this.abierto()) {
      this.cerrar();
      this.boton()?.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  protected alHacerClic(evento: Event): void {
    if (this.abierto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.cerrar();
    }
  }

  /** Si el foco sale de la barra con el menú abierto (Tab), se cierra para no dejarlo flotando. */
  @HostListener('focusout', ['$event'])
  protected alPerderFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.abierto() && destino && !this.host.nativeElement.contains(destino)) {
      this.cerrar();
    }
  }

  @HostListener('window:resize')
  protected alRedimensionar(): void {
    if ((this.document.defaultView?.innerWidth ?? 0) > ANCHO_ESCRITORIO) {
      this.cerrar();
    }
  }

  /** Marca como activo el enlace de la sección que cruza la franja central de la pantalla. */
  private observarSecciones(): void {
    const ventana = this.document.defaultView;
    if (!ventana || !('IntersectionObserver' in ventana)) {
      return;
    }
    const visibles = new Set<string>();
    const observador = new ventana.IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            visibles.add(entrada.target.id);
          } else {
            visibles.delete(entrada.target.id);
          }
        }
        this.activa.set(this.enlaces.find((enlace) => visibles.has(enlace.id))?.id ?? '');
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    for (const enlace of this.enlaces) {
      const seccion = this.document.getElementById(enlace.id);
      if (seccion) {
        observador.observe(seccion);
      }
    }
    this.destruir.onDestroy(() => observador.disconnect());
  }
}
