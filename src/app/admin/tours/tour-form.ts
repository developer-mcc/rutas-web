import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TourRequest } from '../../core/models/admin.models';
import { Tour } from '../../core/models/api.models';
import { AdminApiService } from '../../core/services/admin-api.service';
import { mensajeDeError } from '../../core/util/errores';
import { generarSlug } from '../../core/util/slug';
import { ImagenInput } from '../shared/imagen-input';
import { enfocarPrimerInvalido } from '../shared/foco';

const PATRON_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

@Component({
  selector: 'app-tour-form',
  imports: [ReactiveFormsModule, RouterLink, ImagenInput],
  templateUrl: './tour-form.html',
})
export class TourForm {
  private readonly api = inject(AdminApiService);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Id del tour que se edita; nulo cuando se crea uno nuevo. */
  protected readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  protected readonly cargando = signal(this.id !== null);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    slug: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(PATRON_SLUG)]],
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    emoji: ['', Validators.maxLength(16)],
    etiqueta: ['', Validators.maxLength(120)],
    insignia: ['', Validators.maxLength(60)],
    descripcion: ['', [Validators.required, Validators.maxLength(4000)]],
    resumen: ['', Validators.maxLength(200)],
    precioDesde: [0, [Validators.required, Validators.min(0)]],
    moneda: ['PEN', Validators.required],
    textoPrecio: ['', Validators.maxLength(120)],
    unidadPrecio: ['', Validators.maxLength(120)],
    textoPorPersona: ['', Validators.maxLength(120)],
    imagenUrl: ['', Validators.maxLength(300)],
    destacado: [false],
    orden: [0, Validators.min(0)],
    activo: [true],
    inclusiones: new FormArray<FormControl<string>>([]),
  });

  constructor() {
    if (this.id === null) {
      this.form.controls.nombre.valueChanges.pipe(takeUntilDestroyed()).subscribe((nombre) => {
        if (!this.form.controls.slug.dirty) {
          this.form.controls.slug.setValue(generarSlug(nombre));
        }
      });
      this.agregarInclusion();
    } else {
      this.cargarTour(this.id);
    }
  }

  protected get inclusiones(): FormArray<FormControl<string>> {
    return this.form.controls.inclusiones;
  }

  protected agregarInclusion(texto = ''): void {
    this.inclusiones.push(
      new FormControl(texto, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(300)],
      }),
    );
  }

  protected quitarInclusion(indice: number): void {
    this.inclusiones.removeAt(indice);
  }

  protected moverInclusion(indice: number, desplazamiento: number): void {
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= this.inclusiones.length) {
      return;
    }
    const actual = this.inclusiones.at(indice).value;
    this.inclusiones.at(indice).setValue(this.inclusiones.at(destino).value);
    this.inclusiones.at(destino).setValue(actual);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      enfocarPrimerInvalido(this.document, this.form);
      return;
    }
    const valores = this.form.getRawValue();
    const solicitud: TourRequest = {
      ...valores,
      precioDesde: Number(valores.precioDesde),
      orden: Number(valores.orden),
      inclusiones: valores.inclusiones.map((texto) => texto.trim()).filter(Boolean),
    };
    this.enviando.set(true);
    this.error.set('');
    const operacion =
      this.id === null
        ? this.api.crearTour(solicitud)
        : this.api.actualizarTour(this.id, solicitud);
    operacion.subscribe({
      next: () => void this.router.navigate(['/admin/tours']),
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.enviando.set(false);
      },
    });
  }

  private cargarTour(id: number): void {
    this.api.obtenerTour(id).subscribe({
      next: (tour) => {
        this.rellenar(tour);
        this.cargando.set(false);
      },
      error: (fallo: unknown) => {
        this.error.set(mensajeDeError(fallo));
        this.cargando.set(false);
      },
    });
  }

  private rellenar(tour: Tour): void {
    this.form.patchValue({
      slug: tour.slug,
      nombre: tour.nombre,
      emoji: tour.emoji ?? '',
      etiqueta: tour.etiqueta ?? '',
      insignia: tour.insignia ?? '',
      descripcion: tour.descripcion,
      resumen: tour.resumen ?? '',
      precioDesde: tour.precioDesde,
      moneda: tour.moneda,
      textoPrecio: tour.textoPrecio ?? '',
      unidadPrecio: tour.unidadPrecio ?? '',
      textoPorPersona: tour.textoPorPersona ?? '',
      imagenUrl: tour.imagenUrl ?? '',
      destacado: tour.destacado,
      orden: tour.orden,
      activo: tour.activo,
    });
    tour.inclusiones.forEach((texto) => this.agregarInclusion(texto));
  }
}
