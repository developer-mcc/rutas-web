import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Ajustes, Bloque, Faq, Seccion, Tour } from '../models/api.models';
import { ApiService } from './api.service';

const PREFIJO_TEMA = 'tema.';
const ID_JSON_LD = 'json-ld-sitio';

/**
 * Contenido del sitio. Se carga una vez al iniciar la app y todos los componentes
 * solo pintan estos datos: no hay textos, imágenes ni colores fijos en el código.
 */
@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly api = inject(ApiService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly ajustes = signal<Ajustes>({});
  readonly secciones = signal<Seccion[]>([]);
  readonly bloques = signal<Bloque[]>([]);
  readonly tours = signal<Tour[]>([]);
  readonly faqs = signal<Faq[]>([]);
  readonly cargado = signal(false);
  readonly error = signal(false);

  readonly seccionesVisibles = computed(() =>
    this.secciones()
      .filter((seccion) => seccion.visible)
      .sort((a, b) => a.orden - b.orden),
  );

  private readonly bloquesPorSeccion = computed(() =>
    this.bloques()
      .filter((bloque) => bloque.activo)
      .reduce((grupos, bloque) => {
        const lista = grupos.get(bloque.seccionCodigo) ?? [];
        return grupos.set(bloque.seccionCodigo, [...lista, bloque]);
      }, new Map<string, Bloque[]>()),
  );

  /** Carga todo el contenido; si la API falla la app arranca igual y muestra el estado de error. */
  async cargar(): Promise<void> {
    try {
      const [ajustes, secciones, bloques, tours, faqs] = await firstValueFrom(
        forkJoin([
          this.api.ajustes(),
          this.api.secciones(),
          this.api.bloques(),
          this.api.tours(),
          this.api.faqs(),
        ]),
      );
      this.ajustes.set(ajustes);
      this.secciones.set(secciones);
      this.bloques.set(bloques);
      this.tours.set(tours);
      this.faqs.set(faqs);
      this.aplicarTema(ajustes);
      this.aplicarSeo(ajustes, tours, faqs);
      this.cargado.set(true);
    } catch {
      this.error.set(true);
    }
  }

  texto(clave: string): string {
    return this.ajustes()[clave] ?? '';
  }

  bloquesDe(seccion: string): Bloque[] {
    return this.bloquesPorSeccion().get(seccion) ?? [];
  }

  /** Enlace de WhatsApp con el mensaje ya codificado. */
  whatsappUrl(mensaje: string): string {
    return `https://wa.me/${this.texto('contacto.whatsapp')}?text=${encodeURIComponent(mensaje)}`;
  }

  /** Los ajustes "tema.xxx" pasan a ser las variables CSS "--xxx". */
  private aplicarTema(ajustes: Ajustes): void {
    const raiz = this.document.documentElement;
    Object.entries(ajustes)
      .filter(([clave, valor]) => clave.startsWith(PREFIJO_TEMA) && valor)
      .forEach(([clave, valor]) =>
        raiz.style.setProperty(`--${clave.slice(PREFIJO_TEMA.length)}`, valor),
      );
  }

  private aplicarSeo(ajustes: Ajustes, tours: Tour[], faqs: Faq[]): void {
    const dato = (clave: string) => ajustes[clave] ?? '';
    this.title.setTitle(dato('seo.titulo'));
    this.meta.updateTag({ name: 'description', content: dato('seo.descripcion') });
    this.meta.updateTag({ name: 'keywords', content: dato('seo.keywords') });
    this.meta.updateTag({ property: 'og:title', content: dato('seo.og_titulo') });
    this.meta.updateTag({ property: 'og:description', content: dato('seo.og_descripcion') });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.insertarJsonLd(ajustes, tours, faqs);
  }

  private insertarJsonLd(ajustes: Ajustes, tours: Tour[], faqs: Faq[]): void {
    const datos = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TravelAgency',
          name: ajustes['sitio.nombre'],
          telephone: `+${ajustes['contacto.whatsapp'] ?? ''}`,
          description: ajustes['seo.descripcion'],
        },
        {
          '@type': 'ItemList',
          name: ajustes['tours.titulo'],
          itemListElement: tours.map((tour, indice) => ({
            '@type': 'ListItem',
            position: indice + 1,
            name: tour.nombre,
          })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.pregunta,
            acceptedAnswer: { '@type': 'Answer', text: faq.respuesta },
          })),
        },
      ],
    };
    const anterior = this.document.getElementById(ID_JSON_LD);
    const script = anterior ?? this.document.createElement('script');
    script.id = ID_JSON_LD;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(datos);
    if (!anterior) {
      this.document.head.appendChild(script);
    }
  }
}
