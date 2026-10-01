import { Component, computed, inject, signal } from '@angular/core';
import { AjusteAdmin } from '../../core/models/admin.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { ImagenInput } from '../shared/imagen-input';

const ETIQUETAS_GRUPO: Record<string, string> = {
  general: 'General',
  contacto: 'Contacto y WhatsApp',
  hero: 'Portada',
  'tipos-viajero': 'Tipos de viajero',
  tours: 'Catálogo de tours',
  promo: 'Promoción',
  familias: 'Familias',
  confort: 'Confort',
  confianza: 'Confianza',
  cotizador: 'Cotizador',
  faq: 'Preguntas frecuentes',
  footer: 'Pie de página',
  seo: 'SEO y redes',
  tema: 'Colores',
};

@Component({
  selector: 'app-ajustes-admin',
  imports: [ImagenInput],
  templateUrl: './ajustes-admin.html',
})
export class AjustesAdmin {
  private readonly api = inject(AdminApiService);

  protected readonly ajustes = signal<AjusteAdmin[]>([]);
  protected readonly cambios = signal<Record<string, string>>({});
  protected readonly grupoActivo = signal('');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  /** Grupos en el orden en que aparecen en la web; los desconocidos van al final. */
  protected readonly grupos = computed(() => {
    const orden = Object.keys(ETIQUETAS_GRUPO);
    const posicion = (grupo: string) => {
      const indice = orden.indexOf(grupo);
      return indice === -1 ? orden.length : indice;
    };
    return [...new Set(this.ajustes().map((a) => a.grupo))].sort(
      (a, b) => posicion(a) - posicion(b),
    );
  });

  protected readonly delGrupo = computed(() =>
    this.ajustes()
      .filter((a) => a.grupo === this.grupoActivo())
      .sort((a, b) => a.orden - b.orden),
  );

  protected readonly pendientes = computed(() => Object.keys(this.cambios()).length);

  constructor() {
    this.api.listarAjustes().subscribe({
      next: (ajustes) => {
        this.ajustes.set(ajustes);
        this.grupoActivo.set(this.grupos()[0] ?? '');
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }

  protected etiquetaGrupo(grupo: string): string {
    return ETIQUETAS_GRUPO[grupo] ?? grupo;
  }

  protected pendientesDe(grupo: string): number {
    const claves = new Set(
      this.ajustes()
        .filter((a) => a.grupo === grupo)
        .map((a) => a.clave),
    );
    return Object.keys(this.cambios()).filter((clave) => claves.has(clave)).length;
  }

  protected valor(ajuste: AjusteAdmin): string {
    return this.cambios()[ajuste.clave] ?? ajuste.valor ?? '';
  }

  protected editar(clave: string, evento: Event): void {
    this.cambiar(clave, (evento.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  protected cambiar(clave: string, valor: string): void {
    this.mensaje.set('');
    this.cambios.update((actuales) => ({ ...actuales, [clave]: valor }));
  }

  protected guardar(): void {
    const cambios = Object.entries(this.cambios()).map(([clave, valor]) => ({ clave, valor }));
    if (!cambios.length) {
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.api.guardarAjustes(cambios).subscribe({
      next: (guardados) => {
        const porClave = new Map(guardados.map((ajuste) => [ajuste.clave, ajuste]));
        this.ajustes.update((lista) => lista.map((ajuste) => porClave.get(ajuste.clave) ?? ajuste));
        this.cambios.set({});
        this.mensaje.set('Cambios guardados. Ya se ven en la web.');
        this.guardando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.guardando.set(false);
      },
    });
  }

  protected descartar(): void {
    this.cambios.set({});
    this.mensaje.set('');
  }
}
