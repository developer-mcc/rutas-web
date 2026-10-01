import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bloque, Seccion } from '../../core/models/api.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { ImagenInput } from '../shared/imagen-input';
import { EnfocarAlCrear, RetornarFoco, enfocarPrimerInvalido } from '../shared/foco';
import { UrlMediaPipe } from '../../core/util/url-media.pipe';

/** Tipos de sección que se pintan con una lista de bloques. */
const TIPOS_CON_BLOQUES = ['BLOQUES', 'COTIZADOR'];

@Component({
  selector: 'app-bloques-admin',
  imports: [UrlMediaPipe, ReactiveFormsModule, ImagenInput, EnfocarAlCrear, RetornarFoco],
  templateUrl: './bloques-admin.html',
})
export class BloquesAdmin {
  private readonly api = inject(AdminApiService);
  private readonly document = inject(DOCUMENT);

  protected readonly secciones = signal<Seccion[]>([]);
  protected readonly seccionActual = signal('');
  protected readonly bloques = signal<Bloque[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly editando = signal<Bloque | 'nuevo' | null>(null);
  protected readonly confirmando = signal<number | null>(null);

  protected readonly nombreSeccion = computed(
    () => this.secciones().find((s) => s.codigo === this.seccionActual())?.nombre ?? '',
  );

  protected readonly form = inject(FormBuilder).nonNullable.group({
    icono: ['', Validators.maxLength(40)],
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    texto: ['', Validators.maxLength(2000)],
    imagenUrl: ['', Validators.maxLength(300)],
    activo: [true],
  });

  constructor() {
    this.api.listarSecciones().subscribe({
      next: (secciones) => {
        const conBloques = secciones.filter((s) => TIPOS_CON_BLOQUES.includes(s.tipo));
        this.secciones.set(conBloques);
        if (conBloques.length) {
          this.seleccionar(conBloques[0].codigo);
        } else {
          this.cargando.set(false);
        }
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }

  protected seleccionar(codigo: string): void {
    this.seccionActual.set(codigo);
    this.editando.set(null);
    this.cargarBloques();
  }

  protected nuevo(): void {
    this.form.reset({ icono: '', titulo: '', texto: '', imagenUrl: '', activo: true });
    this.editando.set('nuevo');
  }

  protected editar(bloque: Bloque): void {
    this.form.reset({
      icono: bloque.icono ?? '',
      titulo: bloque.titulo,
      texto: bloque.texto ?? '',
      imagenUrl: bloque.imagenUrl ?? '',
      activo: bloque.activo,
    });
    this.editando.set(bloque);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.form);
      return;
    }
    const actual = this.editando();
    const orden =
      actual === 'nuevo' || actual === null
        ? Math.max(0, ...this.bloques().map((b) => b.orden)) + 1
        : actual.orden;
    const solicitud = { seccionCodigo: this.seccionActual(), ...this.form.getRawValue(), orden };
    const operacion =
      actual === 'nuevo' || actual === null
        ? this.api.crearBloque(solicitud)
        : this.api.actualizarBloque(actual.id, solicitud);
    this.error.set('');
    operacion.subscribe({
      next: () => {
        this.editando.set(null);
        this.cargarBloques();
      },
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  protected eliminar(bloque: Bloque): void {
    this.confirmando.set(null);
    this.api.eliminarBloque(bloque.id).subscribe({
      next: () => this.cargarBloques(),
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  /** Mueve un bloque una posición y envía el nuevo orden completo. */
  protected mover(indice: number, desplazamiento: number): void {
    const ids = this.bloques().map((bloque) => bloque.id);
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= ids.length) {
      return;
    }
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    this.api.reordenarBloques(ids).subscribe({
      next: () => this.cargarBloques(),
      error: (fallo: unknown) => this.error.set(mensajeDeError(fallo)),
    });
  }

  private cargarBloques(): void {
    this.api.listarBloques(this.seccionActual()).subscribe({
      next: (bloques) => {
        this.bloques.set(bloques);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }
}
